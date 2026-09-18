import prisma from '../config/db.js';

/**
 * Format a Date object to YYYY-MM-DD string with optional timezone support
 */
export function formatDate(d, timeZone = null) {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  try {
    if (timeZone) {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    }
  } catch (e) {
    // fallback if invalid timeZone
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extract learning hours from a submission record
 */
export function extractHoursFromSubmission(sub) {
  if (!sub) return 0.25;
  if (sub.feedback) {
    try {
      if (typeof sub.feedback === 'string' && sub.feedback.trim().startsWith('{')) {
        const parsed = JSON.parse(sub.feedback);
        if (parsed?.hours) return parseFloat(parsed.hours) || 0.3;
      }
    } catch (e) {}
    const match = sub.feedback.match(/hours?:?\s*([0-9.]+)/i);
    if (match) return parseFloat(match[1]) || 0.3;
  }
  if (sub.type === 'Course_Graduation') return 1.5;
  if (sub.type === 'Challenge') return 0.5;
  if (sub.type === 'Lesson') return 0.3;
  return 0.25;
}

/**
 * Ensure a LearnerProfile exists for the given user, with realistic baseline defaults if missing.
 */
export async function getOrCreateLearnerProfile(userId) {
  let profile = await prisma.learnerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    profile = await prisma.learnerProfile.create({
      data: {
        userId,
        bio: '',
        institution: '',
        level: 1,
        xp: 0,
        rank: 1,
        streak: 0,
        longestStreak: 0,
        learningHours: 0,
        certificates: [],
      },
    });
  }

  return profile;
}

/**
 * Record work performed by a learner (lesson completed, challenge solved, simulation run, practice logged)
 * This automatically updates:
 *  - XP Earned
 *  - Level (recalculated: Math.floor(xp / 500) + 1)
 *  - Hours Spent
 *  - Streak (active today vs yesterday vs broken)
 *  - Longest Streak
 *  - Global Rank (based on XP compared to all learners)
 *  - Activity record in Submission / DB for the heatmap
/**
 * Compute exact global rank for a user against all learner profiles in the platform.
 * Mirrors the exact ordering of the Global Leaderboard:
 * ORDER BY xp DESC, id ASC
 *
 * This ensures that a user's rank is 100% consistent across:
 * - Profile Page
 * - Achievements Page
 * - Global Leaderboard
 * - Dashboard Quick Stats
 * - Challenges Top Bar
 */
export async function computeGlobalRank(userId, xp = null) {
  const profile = await prisma.learnerProfile.findUnique({
    where: { userId },
    select: { id: true, xp: true },
  });

  const userXp = xp !== null ? xp : (profile?.xp || 0);
  const profileId = profile?.id || null;

  // 1. Count all profiles with strictly higher XP
  // 2. For profiles with tied XP, break ties deterministically by profile id (matches Leaderboard order)
  const [higherXpCount, tiedAheadCount] = await Promise.all([
    prisma.learnerProfile.count({
      where: {
        userId: { not: userId },
        xp: { gt: userXp },
      },
    }),
    profileId
      ? prisma.learnerProfile.count({
          where: {
            userId: { not: userId },
            xp: userXp,
            id: { lt: profileId },
          },
        })
      : 0,
  ]);

  const exactRank = higherXpCount + tiedAheadCount + 1;

  // Persist updated rank to LearnerProfile in DB
  if (profile) {
    await prisma.learnerProfile.update({
      where: { userId },
      data: { rank: exactRank },
    }).catch(() => {});
  }

  return exactRank;
}

/**
 * Synchronize all learner profile ranks in the database according to
 * the exact Global Leaderboard ordering: ORDER BY xp DESC, id ASC.
 * Guarantees that every user's stored rank in PostgreSQL matches their live rank.
 */
export async function syncAllGlobalRanks() {
  try {
    const allProfiles = await prisma.learnerProfile.findMany({
      orderBy: [{ xp: 'desc' }, { id: 'asc' }],
      select: { id: true, userId: true, rank: true, xp: true },
    });
    for (let i = 0; i < allProfiles.length; i++) {
      const p = allProfiles[i];
      const newRank = i + 1;
      if (p.rank !== newRank) {
        await prisma.learnerProfile.update({
          where: { id: p.id },
          data: { rank: newRank },
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('syncAllGlobalRanks warning:', err.message);
  }
}

export async function recordLearnerWork({
  userId,
  type = 'LESSON', // 'LESSON' | 'CHALLENGE' | 'SIMULATION' | 'EXPERIMENT' | 'GOAL' | 'PRACTICE'
  description = 'Learner quantum activity',
  xp = 50,
  hours = 0.3,
  lessonId = null,
  courseId = null,
  challengeId = null,
}) {
  const profile = await getOrCreateLearnerProfile(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveAt: true },
  });

  const now = new Date();
  const todayStr = formatDate(now);
  const lastActiveStr = user?.lastActiveAt ? formatDate(user.lastActiveAt) : null;

  // Streak calculation (starts at 0 for new learners, becomes 1 on first active day)
  let newStreak = profile.streak || 0;
  if (lastActiveStr) {
    const todayMs = new Date(todayStr).getTime();
    const lastActiveMs = new Date(lastActiveStr).getTime();
    const dayDiff = Math.round((todayMs - lastActiveMs) / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) {
      // Already active today: maintain current streak (at least 1)
      newStreak = Math.max(1, profile.streak || 1);
    } else if (dayDiff === 1) {
      // Active yesterday: increment streak!
      newStreak = (profile.streak || 0) + 1;
    } else {
      // Streak broken (more than 1 full day skipped): reset to 1
      newStreak = 1;
    }
  } else {
    // First active activity: start streak at 1
    newStreak = 1;
  }

  const safeHours = hours !== undefined && !isNaN(parseFloat(hours)) ? Math.max(0, parseFloat(hours)) : 0.3;
  const newLongestStreak = Math.max(profile.longestStreak || 0, newStreak);
  const newXp = (profile.xp || 0) + Math.max(0, parseInt(xp) || 0);
  const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
  const newHours = parseFloat(((profile.learningHours || 0) + safeHours).toFixed(2));

  // Compute unified dynamic global rank matching the global leaderboard
  const newRank = await computeGlobalRank(userId, newXp);

  // Update profile
  const updatedProfile = await prisma.learnerProfile.update({
    where: { userId },
    data: {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      longestStreak: newLongestStreak,
      learningHours: newHours,
      rank: newRank,
    },
  });

  // Update user lastActiveAt
  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: now },
  });

  // Record submission with structured feedback containing hours spent
  const submissionType = type === 'CHALLENGE' ? 'Challenge' : type === 'LESSON' ? 'Lesson' : 'Lab';
  const assignmentId = lessonId || challengeId || `activity_${Date.now()}`;
  const feedbackData = JSON.stringify({
    description,
    hours: safeHours,
    minutes: Math.round(safeHours * 60),
    xp,
    type,
  });

  await prisma.submission.create({
    data: {
      userId,
      assignmentId,
      courseId: courseId || null,
      type: submissionType,
      status: 'COMPLETED',
      score: xp,
      feedback: feedbackData,
      submittedAt: now,
      gradedAt: now,
    },
  });

  // If completing a lesson for an enrolled course, advance progress %
  if (courseId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (enrollment) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { totalLessons: true, title: true },
      });
      const total = Math.max(1, course?.totalLessons || 10);
      const newProgress = Math.min(100, Math.round((enrollment.progress + (100 / total))));
      const isGraduating = newProgress >= 100 && enrollment.status !== 'Completed';

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progress: newProgress,
          status: newProgress >= 100 ? 'Completed' : 'Active',
          lastActive: now,
        },
      });

      // Automatically issue certificate and graduate learner if course reaches 100%
      if (isGraduating && course?.title) {
        const currentCerts = Array.isArray(profile.certificates) ? [...profile.certificates] : [];
        const alreadyHasCert = currentCerts.some(c => c.title === course.title);
        if (!alreadyHasCert) {
          currentCerts.push({
            title: course.title,
            date: now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            icon: '🎓',
            courseId,
          });
          await prisma.learnerProfile.update({
            where: { userId },
            data: {
              certificates: currentCerts,
              xp: { increment: 300 }, // +300 XP graduation bonus
              learningHours: { increment: 1.0 },
            },
          });
          await prisma.submission.create({
            data: {
              userId,
              assignmentId: `grad_${courseId}_${Date.now()}`,
              courseId,
              type: 'Course_Graduation',
              status: 'COMPLETED',
              score: 300,
              feedback: `Graduated from ${course.title} with verified certificate`,
              submittedAt: now,
              gradedAt: now,
            },
          });
        }
      }
    }
  }

  // Auto-evaluate and award badges immediately upon learning progress
  await evaluateAndAwardBadges(userId).catch(err => console.error('Error auto-evaluating badges:', err));

  // Sync all ranks across the database so all profiles reflect true leaderboard ranking
  await syncAllGlobalRanks().catch(() => {});
  const finalRank = await computeGlobalRank(userId, newXp);

  return {
    profile: { ...updatedProfile, rank: finalRank },
    xpEarned: xp,
    hoursEarned: hours,
    streak: newStreak,
    rank: finalRank,
    level: newLevel,
  };
}

/**
 * Record active study time heartbeat sent from the client
 * Automatically increments learningHours in LearnerProfile and records/aggregates
 * today's study minutes into a dedicated Submission record for the heatmap.
 */
export async function recordStudyHeartbeat({ userId, seconds = 60, context = '', title = '', timeZone = null }) {
  const profile = await getOrCreateLearnerProfile(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveAt: true },
  });

  const validSeconds = Math.min(300, Math.max(1, parseInt(seconds) || 60));
  const addedHours = validSeconds / 3600;

  const now = new Date();
  const todayStr = formatDate(now, timeZone);
  const lastActiveStr = user?.lastActiveAt ? formatDate(user.lastActiveAt, timeZone) : null;

  // Streak calculation (increment if active yesterday, maintain if active today)
  let newStreak = profile.streak || 0;
  if (lastActiveStr) {
    const todayMs = new Date(todayStr).getTime();
    const lastActiveMs = new Date(lastActiveStr).getTime();
    const dayDiff = Math.round((todayMs - lastActiveMs) / (1000 * 60 * 60 * 24));
    if (dayDiff === 0) {
      newStreak = Math.max(1, profile.streak || 1);
    } else if (dayDiff === 1) {
      newStreak = (profile.streak || 0) + 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const newLongestStreak = Math.max(profile.longestStreak || 0, newStreak);
  const newHours = parseFloat(((profile.learningHours || 0) + addedHours).toFixed(2));

  // Update learner profile with incremented learning hours
  const updatedProfile = await prisma.learnerProfile.update({
    where: { userId },
    data: {
      learningHours: newHours,
      streak: newStreak,
      longestStreak: newLongestStreak,
    },
  });

  // Update user's lastActiveAt
  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: now },
  });

  // Aggregate today's active study time in a dedicated Submission record
  const studyAssignmentId = `study_session_${todayStr}`;
  const existingStudy = await prisma.submission.findFirst({
    where: { userId, assignmentId: studyAssignmentId },
  });

  const minutesToAdd = Math.max(1, Math.round(validSeconds / 60));

  if (existingStudy) {
    let currentMins = 0;
    try {
      if (existingStudy.feedback && existingStudy.feedback.trim().startsWith('{')) {
        const parsed = JSON.parse(existingStudy.feedback);
        currentMins = parsed.minutes || 0;
      }
    } catch (e) {}

    const totalMinsToday = currentMins + minutesToAdd;
    const totalHoursToday = parseFloat((totalMinsToday / 60).toFixed(2));

    await prisma.submission.update({
      where: { id: existingStudy.id },
      data: {
        feedback: JSON.stringify({
          description: title ? `Active study: ${title}` : 'Active quantum platform study session',
          hours: totalHoursToday,
          minutes: totalMinsToday,
          lastHeartbeat: now.toISOString(),
          context,
        }),
        submittedAt: now,
      },
    });
  } else {
    await prisma.submission.create({
      data: {
        userId,
        assignmentId: studyAssignmentId,
        type: 'Practice',
        status: 'COMPLETED',
        score: 10,
        feedback: JSON.stringify({
          description: title ? `Active study: ${title}` : 'Active quantum platform study session',
          hours: parseFloat((minutesToAdd / 60).toFixed(2)),
          minutes: minutesToAdd,
          lastHeartbeat: now.toISOString(),
          context,
        }),
        submittedAt: now,
        gradedAt: now,
      },
    });
  }

  return {
    profile: updatedProfile,
    addedSeconds: validSeconds,
    addedHours,
    learningHours: newHours,
    streak: newStreak,
  };
}

/**
 * Directly complete a course, mark status Completed, and issue certificate
 */
export async function completeCourse({ userId, courseId }) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) throw new Error('Course not found');

  const now = new Date();
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { progress: 100, status: 'Completed', lastActive: now },
    create: { userId, courseId, progress: 100, status: 'Completed', lastActive: now },
  });

  const profile = await getOrCreateLearnerProfile(userId);
  const currentCerts = Array.isArray(profile.certificates) ? [...profile.certificates] : [];
  if (!currentCerts.some(c => c.title === course.title)) {
    currentCerts.push({
      title: course.title,
      date: now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      icon: '🎓',
      courseId,
    });
  }

  const result = await recordLearnerWork({
    userId,
    type: 'COURSE_COMPLETED',
    description: `Graduated from ${course.title} with verified certificate`,
    xp: 300,
    hours: 1.5,
    courseId,
  });

  await prisma.learnerProfile.update({
    where: { userId },
    data: { certificates: currentCerts },
  });

  return { enrollment, course, profile: result.profile };
}

/**
 * Generate 52-week activity heatmap data (52 columns of 7 days, Sunday to Saturday)
 * Populates each day with real activity count, time spent (minutes & hours), and intensity level (0-4)
 * driven by learning duration so cells progressively darken as time spent increases.
 */
export async function buildActivityHeatmap(userId, timeZone = null) {
  const profile = await getOrCreateLearnerProfile(userId);
  const today = new Date();
  const todayStr = formatDate(today, timeZone);
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Align calendar grid so every row is consistent across all 52 weeks:
  // Row 0 is Sunday, Row 6 is Saturday.
  // The current week (column 51) starts on this week's Sunday:
  const currentWeekSunday = new Date(today);
  currentWeekSunday.setDate(today.getDate() - dayOfWeek);
  currentWeekSunday.setHours(0, 0, 0, 0);

  // Week 0 starts on the Sunday 51 weeks before currentWeekSunday (total 52 weeks)
  const startDate = new Date(currentWeekSunday);
  startDate.setDate(currentWeekSunday.getDate() - (51 * 7));
  startDate.setHours(0, 0, 0, 0);

  const totalDays = 52 * 7; // 364 days

  // Fetch all user activities across models within range
  const [submissions, goals, simulations, experiments, circuits] = await Promise.all([
    prisma.submission.findMany({
      where: { userId, submittedAt: { gte: startDate } },
      select: { submittedAt: true, type: true, score: true, feedback: true },
    }),
    prisma.dailyGoal.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true, done: true, xpEarned: true, label: true },
    }),
    prisma.simulationRun.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true, backend: true },
    }),
    prisma.experiment.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true, name: true },
    }),
    prisma.savedCircuit.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true, name: true },
    }),
  ]);

  // Aggregate activity counts and minutes by YYYY-MM-DD
  const activityMap = new Map();

  function addActivity(dateObj, minutes = 15, label = 'Quantum Activity') {
    if (!dateObj) return;
    const key = formatDate(dateObj, timeZone);
    const curr = activityMap.get(key) || { count: 0, minutes: 0, details: [] };
    curr.count += 1;
    curr.minutes += Math.round(minutes);
    if (curr.details.length < 5 && label) {
      curr.details.push(label);
    }
    activityMap.set(key, curr);
  }

  // Aggregate real work
  submissions.forEach(s => {
    const hours = extractHoursFromSubmission(s);
    const mins = Math.round(hours * 60);
    const label = s.type === 'Course_Graduation'
      ? '🎓 Course Graduated'
      : `${s.type || 'Lesson'}: ${s.score || 50} XP (${mins}m)`;
    addActivity(s.submittedAt, mins, label);
  });

  goals.filter(g => g.done).forEach(g => {
    addActivity(g.createdAt, 12, `Daily Goal: ${g.label || 'Completed'}`);
  });

  simulations.forEach(s => {
    addActivity(s.createdAt, 12, `Simulation: ${s.backend || 'Qiskit'}`);
  });

  experiments.forEach(e => {
    addActivity(e.createdAt, 15, `Lab: ${e.name || 'Experiment'}`);
  });

  circuits.forEach(c => {
    addActivity(c.createdAt, 15, `Circuit: ${c.name || 'Saved Circuit'}`);
  });

  // (Only real user activity from submissions, goals, simulations, experiments, and circuits is populated)

  // Build the contiguous 364-day array (52 weeks x 7 days)
  const heatmap = [];
  let totalActivities = 0;
  let totalMinutes = 0;
  let activeDays = 0;

  let todayMinutes = 0;
  let todayActivities = 0;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = formatDate(d, timeZone);
    const dayData = activityMap.get(dateStr);
    const count = dayData ? dayData.count : 0;
    const minutes = dayData ? dayData.minutes : 0;
    const hours = parseFloat((minutes / 60).toFixed(1));

    // Determine if this day is today or in the future
    const isToday = dateStr === todayStr;
    const isFuture = d > today && !isToday;

    // Time-based intensity level:
    // Level 0: 0 minutes
    // Level 1: 1 - 25 minutes
    // Level 2: 26 - 55 minutes
    // Level 3: 56 - 110 minutes (~1 to 2 hrs)
    // Level 4: 111+ minutes (2+ hrs)
    let value = 0;
    if (!isFuture) {
      if (minutes >= 111) value = 4;
      else if (minutes >= 56) value = 3;
      else if (minutes >= 26) value = 2;
      else if (minutes >= 1) value = 1;
    }

    if (count > 0 && !isFuture) {
      totalActivities += count;
      totalMinutes += minutes;
      activeDays += 1;
    }

    if (isToday) {
      todayMinutes = minutes;
      todayActivities = count;
    }

    heatmap.push({
      date: dateStr,
      count,
      minutes,
      hours,
      value,
      isToday,
      isFuture,
      dayOfWeek: d.getDay(),
      details: dayData?.details || [],
    });
  }

  return {
    heatmap,
    summary: {
      totalActivities,
      totalMinutes,
      totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
      todayMinutes,
      todayHours: parseFloat((todayMinutes / 60).toFixed(1)),
      todayActivities,
      activeDays,
      currentStreak: profile.streak || 0,
      longestStreak: profile.longestStreak || 0,
    },
  };
}

/**
 * Get comprehensive, dynamic learner profile data
 */
export async function getLearnerProfileData(user, timeZone = null) {
  // 1. Evaluate & award any eligible badges before calculating profile metrics
  await evaluateAndAwardBadges(user.id).catch(() => {});

  const profile = await getOrCreateLearnerProfile(user.id);

  // Dynamic counts of lessons and challenges
  const [completedLessonsCount, solvedChallengesCount, enrollments] = await Promise.all([
    prisma.submission.count({
      where: {
        userId: user.id,
        type: 'Lesson',
        status: 'COMPLETED',
      },
    }),
    prisma.submission.count({
      where: {
        userId: user.id,
        type: 'Challenge',
        status: 'COMPLETED',
      },
    }),
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            totalLessons: true,
            modules: { select: { id: true } },
          },
        },
      },
    }),
  ]);

  // Real dynamic counts of completed lessons and challenges
  const lessonsDone = completedLessonsCount;
  const challengesDone = solvedChallengesCount;

  // 2. Auto-reconcile orphaned baseline defaults: if user has no real activities and has leftover dummy 1.5h or 150xp
  const totalSubmissions = await prisma.submission.count({ where: { userId: user.id } });
  if (totalSubmissions === 0 && enrollments.length === 0 && (profile.learningHours === 1.5 || profile.xp === 150)) {
    await prisma.learnerProfile.update({
      where: { userId: user.id },
      data: { learningHours: 0, xp: 0, streak: 0, longestStreak: 0, level: 1 },
    });
    profile.learningHours = 0;
    profile.xp = 0;
    profile.streak = 0;
    profile.longestStreak = 0;
    profile.level = 1;
  }

  // Recompute unified global rank matching the global leaderboard
  const globalRank = await computeGlobalRank(user.id, profile.xp || 0);
  await syncAllGlobalRanks().catch(() => {});

  // Build 52-week activity heatmap with timezone
  const { heatmap, summary } = await buildActivityHeatmap(user.id, timeZone);

  // Format real enrolled courses (empty array if new learner hasn't enrolled yet)
  const formattedCourses = enrollments.map(e => ({
    id: e.courseId,
    title: e.course?.title || 'Quantum Course',
    progress: Math.round(e.progress || 0),
    modules: e.course?.modules?.length || 5,
    status: e.status,
  }));

  // Real certificates (empty array if new learner hasn't earned any yet)
  const certificates = Array.isArray(profile.certificates) ? profile.certificates : [];

  // Query mobile/phone and social links (github, linkedin)
  const extraFieldsList = await prisma.$queryRawUnsafe(
    'SELECT phone, github, linkedin, "socialLinks" FROM "LearnerProfile" WHERE "userId" = $1 LIMIT 1',
    user.id
  ).catch(() => []);
  const extraFields = extraFieldsList[0] || {};
  const phone = extraFields.phone || '';
  const github = extraFields.github || '';
  const linkedin = extraFields.linkedin || '';
  const socialLinks = extraFields.socialLinks || {};

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    bio: profile.bio || '',
    institution: profile.institution || '',
    phone,
    mobile: phone,
    github,
    linkedin,
    socialLinks: {
      github,
      linkedin,
      ...(typeof socialLinks === 'object' && socialLinks !== null ? socialLinks : {}),
    },
    joined: user.createdAt
      ? new Date(user.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })
      : 'Recently',
    level: profile.level || Math.max(1, Math.floor((profile.xp || 0) / 500) + 1),
    stats: {
      xp: profile.xp || 0,
      lessons: lessonsDone,
      streak: profile.streak || 0,
      challenges: challengesDone,
      hours: profile.learningHours || 0,
      rank: globalRank,
    },
    enrolledCourses: formattedCourses,
    certificates,
    activityHeatmap: heatmap,
    heatmapSummary: summary,
  };
}

/**
 * Standard 9 badges in the quantum platform
 */
export const STANDARD_BADGES = [
  { id: 'b1', title: 'Qubit Pioneer', desc: 'Completed your first quantum lesson', icon: '⚛️', xp: 50, rarity: 'Common' },
  { id: 'b2', title: 'Bell State Builder', desc: 'Successfully created a Bell entangled pair', icon: '🔔', xp: 150, rarity: 'Uncommon' },
  { id: 'b3', title: 'Grover Explorer', desc: "Completed Grover's search module", icon: '🔍', xp: 250, rarity: 'Rare' },
  { id: 'b4', title: 'Circuit Architect', desc: 'Built 10+ unique quantum circuits in playground', icon: '🏗️', xp: 200, rarity: 'Uncommon' },
  { id: 'b5', title: '7-Day Streak', desc: 'Learned for 7 consecutive days', icon: '🔥', xp: 100, rarity: 'Common' },
  { id: 'b6', title: 'Quiz Ace', desc: 'Scored 100% on 3 consecutive quizzes', icon: '🎯', xp: 300, rarity: 'Rare' },
  { id: 'b7', title: 'Shor Specialist', desc: "Master Shor's factoring algorithm", icon: '🔐', xp: 500, rarity: 'Epic' },
  { id: 'b8', title: 'QML Trailblazer', desc: 'Complete the Quantum ML track', icon: '🤖', xp: 600, rarity: 'Epic' },
  { id: 'b9', title: 'Grand Quantum Master', desc: 'Complete all courses with 90%+ quiz avg', icon: '🏆', xp: 2000, rarity: 'Legendary' },
];

/**
 * Full 7-stage XP Level Path milestones
 */
export const XP_MILESTONES = [
  { xp: 0, label: 'Novice', icon: '🌱' },
  { xp: 500, label: 'Apprentice', icon: '⚗️' },
  { xp: 1000, label: 'Explorer', icon: '🔭' },
  { xp: 2000, label: 'Practitioner', icon: '⚛️' },
  { xp: 3500, label: 'Specialist', icon: '🧬' },
  { xp: 5000, label: 'Expert', icon: '🌌' },
  { xp: 8000, label: 'Master', icon: '🏆' },
];

/**
 * Dynamically evaluate and award any newly unlocked badges for a user
 */
export async function evaluateAndAwardBadges(userId) {
  const profile = await getOrCreateLearnerProfile(userId);

  // Gather stats for badge evaluation
  const [submissions, userBadges, savedCircuitsCount, simulationsCount] = await Promise.all([
    prisma.submission.findMany({
      where: { userId },
      select: { type: true, score: true, feedback: true, assignmentId: true },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    }),
    prisma.savedCircuit.count({ where: { userId } }),
    prisma.simulationRun.count({ where: { userId } }),
  ]);

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
  const newBadgesToAward = [];

  const totalXP = profile.xp || 0;
  const streak = Math.max(profile.streak || 0, profile.longestStreak || 0);
  const certs = Array.isArray(profile.certificates) ? profile.certificates : [];

  // b1: Qubit Pioneer (1+ lesson completed or XP >= 50)
  if (!earnedBadgeIds.has('b1')) {
    const hasLesson = submissions.some(s => s.type === 'Lesson' || s.type === 'LESSON') || totalXP >= 50;
    if (hasLesson) newBadgesToAward.push('b1');
  }

  // b2: Bell State Builder (completed Bell state, simulation, or circuit)
  if (!earnedBadgeIds.has('b2')) {
    const hasBell = submissions.some(s => 
      (s.assignmentId && s.assignmentId.toLowerCase().includes('bell')) || 
      (s.feedback && s.feedback.toLowerCase().includes('bell'))
    ) || simulationsCount >= 1 || savedCircuitsCount >= 1;
    if (hasBell) newBadgesToAward.push('b2');
  }

  // b3: Grover Explorer (completed Grover search or 3+ submissions)
  if (!earnedBadgeIds.has('b3')) {
    const hasGrover = submissions.some(s => 
      (s.assignmentId && s.assignmentId.toLowerCase().includes('grover')) || 
      (s.feedback && s.feedback.toLowerCase().includes('grover'))
    ) || submissions.length >= 3;
    if (hasGrover) newBadgesToAward.push('b3');
  }

  // b4: Circuit Architect (5+ circuits or simulations or 5+ submissions)
  if (!earnedBadgeIds.has('b4')) {
    if ((savedCircuitsCount + simulationsCount) >= 5 || submissions.length >= 5) {
      newBadgesToAward.push('b4');
    }
  }

  // b5: 7-Day Streak (streak >= 7)
  if (!earnedBadgeIds.has('b5')) {
    if (streak >= 7) {
      newBadgesToAward.push('b5');
    }
  }

  // b6: Quiz Ace (scored >= 80 on 3+ activities or XP >= 400)
  if (!earnedBadgeIds.has('b6')) {
    const highScores = submissions.filter(s => (s.score || 0) >= 80);
    if (highScores.length >= 3 || totalXP >= 400) {
      newBadgesToAward.push('b6');
    }
  }

  // b7: Shor Specialist (Shor algorithm or XP >= 1500)
  if (!earnedBadgeIds.has('b7')) {
    const hasShor = submissions.some(s => 
      (s.assignmentId && s.assignmentId.toLowerCase().includes('shor')) || 
      (s.feedback && s.feedback.toLowerCase().includes('shor'))
    ) || totalXP >= 1500;
    if (hasShor) newBadgesToAward.push('b7');
  }

  // b8: QML Trailblazer (QML track or XP >= 2500)
  if (!earnedBadgeIds.has('b8')) {
    const hasQML = submissions.some(s => 
      (s.assignmentId && s.assignmentId.toLowerCase().includes('qml')) || 
      (s.feedback && s.feedback.toLowerCase().includes('qml'))
    ) || totalXP >= 2500;
    if (hasQML) newBadgesToAward.push('b8');
  }

  // b9: Grand Quantum Master (Certificate earned AND XP >= 3000)
  if (!earnedBadgeIds.has('b9')) {
    if (certs.length >= 1 && totalXP >= 3000) {
      newBadgesToAward.push('b9');
    }
  }

  // Ensure standard badges exist in Badge table if empty
  const badgeCount = await prisma.badge.count();
  if (badgeCount < 9) {
    for (const sb of STANDARD_BADGES) {
      await prisma.badge.upsert({
        where: { id: sb.id },
        update: { title: sb.title, desc: sb.desc, icon: sb.icon, xp: sb.xp, rarity: sb.rarity },
        create: sb,
      }).catch(() => {});
    }
  }

  // Award new badges with bonus XP
  let bonusXp = 0;
  for (const badgeId of newBadgesToAward) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId } },
      update: {},
      create: { userId, badgeId, earnedAt: new Date() },
    }).catch(() => {});

    const badgeDef = STANDARD_BADGES.find(b => b.id === badgeId);
    if (badgeDef?.xp) {
      bonusXp += badgeDef.xp;
    }
  }

  // If newly unlocked badges grant XP, persist bonus XP and sync ranks
  if (bonusXp > 0) {
    const updated = await prisma.learnerProfile.update({
      where: { userId },
      data: {
        xp: { increment: bonusXp },
      },
      select: { xp: true },
    }).catch(() => null);

    if (updated) {
      const newLevel = Math.max(1, Math.floor(updated.xp / 500) + 1);
      await prisma.learnerProfile.update({
        where: { userId },
        data: { level: newLevel },
      }).catch(() => {});
      await syncAllGlobalRanks().catch(() => {});
    }
  }
}

/**
 * Fetch all dynamic achievements data: stats, badges, milestones, and leaderboard
 */
export async function getLearnerAchievementsData(userId) {
  // 1. Evaluate & award any newly eligible badges
  await evaluateAndAwardBadges(userId);

  // 2. Fetch profile & user details
  const profile = await getOrCreateLearnerProfile(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  const userXp = profile.xp || 0;
  const streak = profile.streak || 0;

  // 3. Compute live dynamic Global Rank matching the global leaderboard
  const currentRank = await computeGlobalRank(userId, userXp);

  // 4. Fetch all badges with user earned status
  const [allBadges, userBadges] = await Promise.all([
    prisma.badge.findMany({ orderBy: { xp: 'asc' } }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    }),
  ]);

  const userBadgeMap = new Map();
  userBadges.forEach(ub => userBadgeMap.set(ub.badgeId, ub));

  const formattedBadges = allBadges.map(b => {
    const earned = userBadgeMap.get(b.id);
    return {
      id: b.id,
      title: b.title,
      desc: b.desc,
      icon: b.icon,
      xp: b.xp,
      rarity: b.rarity,
      earned: !!earned,
      date: earned ? new Date(earned.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
    };
  });

  // 5. XP Level Path Milestones
  const dynamicMilestones = XP_MILESTONES.map(m => ({
    xp: m.xp,
    label: m.label,
    icon: m.icon,
    reached: userXp >= m.xp,
  }));

  // 6. Global Leaderboard (Top 10 learners ordered by XP, then profile id)
  const topProfiles = await prisma.learnerProfile.findMany({
    take: 10,
    orderBy: [{ xp: 'desc' }, { id: 'asc' }],
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  let userInTop10 = false;
  const leaderboard = topProfiles.map((p, idx) => {
    const rank = idx + 1;
    const isYou = p.userId === userId;
    if (isYou) userInTop10 = true;
    const displayName = isYou ? (user?.name || p.user?.name || 'You') : (p.user?.name || `Learner #${rank}`);
    const initials = displayName
      .split(' ')
      .map(n => n[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'L';

    let badge = null;
    if (rank === 1) badge = '🏆';
    else if (rank === 2) badge = '🥈';
    else if (rank === 3) badge = '🥉';

    return {
      rank,
      name: displayName,
      xp: p.xp || 0,
      avatar: initials,
      badge,
      isYou,
    };
  });

  // If current user is not in top 10, append them with their real calculated rank
  if (!userInTop10) {
    const displayName = user?.name || 'You';
    const initials = displayName
      .split(' ')
      .map(n => n[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

    leaderboard.push({
      rank: currentRank,
      name: displayName,
      xp: userXp,
      avatar: initials,
      badge: currentRank === 1 ? '🏆' : currentRank === 2 ? '🥈' : currentRank === 3 ? '🥉' : null,
      isYou: true,
    });
  }

  return {
    xp: userXp,
    level: profile.level || Math.max(1, Math.floor(userXp / 500) + 1),
    streak,
    longestStreak: profile.longestStreak || streak,
    rank: currentRank,
    badges: formattedBadges,
    milestones: dynamicMilestones,
    leaderboard,
  };
}

