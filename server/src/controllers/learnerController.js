import prisma from '../config/db.js';
import { 
  getLearnerProfileData, 
  recordLearnerWork, 
  recordStudyHeartbeat,
  completeCourse as completeCourseService,
  getLearnerAchievementsData,
  computeGlobalRank,
  evaluateAndAwardBadges,
  syncAllGlobalRanks,
  XP_MILESTONES,
} from '../services/learnerActivityService.js';
import { getLearnerWeeklyActivityData } from '../services/weeklyActivityService.js';

export const getLearnerDashboard = async (req, res) => {
  try {
    const { id, name, email, role } = req.user;

    const profile = await prisma.learnerProfile.findUnique({
      where: { userId: id }
    });

    const goals = await prisma.dailyGoal.findMany({
      where: { userId: id, date: new Date().toISOString().slice(0, 10) }
    });

    const courses = await prisma.course.findMany({
      take: 3
    });

    return res.status(200).json({
      success: true,
      message: 'Learner dashboard data fetched successfully.',
      data: {
        user: { id, name, email, role },
        level: profile?.level || 1,
        xp: profile?.xp || 0,
        streak: profile?.streak || 0,
        longestStreak: profile?.longestStreak || 0,
        currentCourse,
        todayGoals,
        stats: {
          courses: { enrolled: 0, completed: 0 },
          lessons: { total: 0, completed: 0 },
          challenges: { attempted: 0, solved: 0 },
          quizScore: 0,
          learningHours: profile?.learningHours || 0
        },
        recentActivity: [],
        recommendation: {
          title: courses[0]?.title || 'Course',
          reason: 'Recommended based on your activity.',
          module: 'Module 1',
          difficulty: 'Beginner',
          duration: '35 min',
        },
        quickStats: { rank: profile?.rank || 0, badges: 0, daysActive: profile?.streak || 0, xpThisWeek: 0 }
      },
    });
  } catch (error) {
    console.error('Error fetching learner dashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
};


export const getLearnerCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: { select: { name: true } },
      },
    });

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
    });

    const enrollmentMap = new Map(enrollments.map(e => [e.courseId, e]));

    const formattedCourses = courses.map(c => {
      const userEnrollment = enrollmentMap.get(c.id);
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        difficulty: c.difficulty,
        duration: c.duration,
        modules: c.totalLessons > 0 ? 5 : 0,
        lessons: c.totalLessons,
        instructor: c.instructor?.name || 'Unknown',
        progress: userEnrollment ? Math.round(userEnrollment.progress || 0) : 0,
        enrolled: !!userEnrollment,
        status: userEnrollment?.status || (userEnrollment ? 'Active' : 'Available'),
        studentsEnrolled: c.enrolledStudents || 0,
        category: c.category,
        rating: c.rating || 0,
      };
    });

    const paths = await prisma.learningPath.findMany();

    return res.status(200).json({
      success: true,
      data: {
        courses: formattedCourses,
        enrolled: formattedCourses.filter(c => c.enrolled),
        catalog: formattedCourses.filter(c => !c.enrolled),
        paths: paths.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          courses: 0,
          totalHours: p.totalHours || 0,
          difficulty: p.difficulty || 'Beginner',
          progress: 0,
          enrolled: false,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching learner courses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch courses' });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { name: true } },
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
    });

    const formattedCourse = {
      ...course,
      instructor: course.instructor?.name || 'Unknown',
      enrolled: !!enrollment,
      progress: Math.round(enrollment?.progress || 0),
    };

    const curriculum = course.modules.map(m => ({
      id: m.id,
      title: m.title,
      completed: false,
      locked: false,
      progress: 0,
      items: m.lessons.map(l => ({
        id: l.id,
        type: l.type,
        title: l.title,
        duration: l.duration,
        completed: false,
      })),
    }));

    return res.status(200).json({
      success: true,
      data: { course: formattedCourse, curriculum },
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch course' });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const now = new Date();
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: req.user.id, courseId } },
      update: { lastActive: now },
      create: {
        userId: req.user.id,
        courseId,
        progress: 0,
        status: 'Active',
        lastActive: now,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Successfully enrolled in course ${courseId}.`,
      data: { courseId, enrolled: true, progress: enrollment.progress },
    });
  } catch (error) {
    console.error('Error enrolling course:', error);
    res.status(500).json({ success: false, error: 'Failed to enroll in course' });
  }
};

export const completeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await completeCourseService({ userId: req.user.id, courseId });
    return res.status(200).json({
      success: true,
      message: `Congratulations! You graduated from "${result.course.title}" and earned a verified certificate.`,
      data: result,
    });
  } catch (error) {
    console.error('completeCourse error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to complete course' });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { courseId, hours } = req.body || {};

    // Try to find the lesson and parent module/course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { courseId: true, title: true } } },
    }).catch(() => null);

    const resolvedCourseId = courseId || lesson?.module?.courseId;
    const title = lesson?.title || lessonId;
    const hoursToLog = parseFloat(hours) || 0.3;

    const result = await recordLearnerWork({
      userId: req.user.id,
      type: 'LESSON',
      description: `Completed lesson: ${title}`,
      xp: 50,
      hours: hoursToLog,
      lessonId,
      courseId: resolvedCourseId,
    });

    return res.status(200).json({
      success: true,
      message: `Lesson "${title}" completed successfully!`,
      data: {
        lessonId,
        completed: true,
        xpEarned: 50,
        hoursEarned: 0.3,
        stats: {
          xp: result.profile.xp,
          streak: result.streak,
          hours: result.profile.learningHours,
          rank: result.rank,
          level: result.level,
        },
      },
    });
  } catch (error) {
    console.error('completeLesson error:', error);
    res.status(500).json({ success: false, error: 'Failed to complete lesson' });
  }
};

export const solveChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { points, code } = req.body || {};

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    }).catch(() => null);

    const xpToAward = points || challenge?.xp || 250;
    const title = challenge?.title || 'Quantum Challenge';

    const result = await recordLearnerWork({
      userId: req.user.id,
      type: 'CHALLENGE',
      description: `Solved challenge: ${title}`,
      xp: xpToAward,
      hours: 0.5,
      challengeId,
      courseId: challenge?.courseId,
    });

    return res.status(200).json({
      success: true,
      message: `Challenge "${title}" solved successfully!`,
      data: {
        challengeId,
        solved: true,
        xpEarned: xpToAward,
        hoursEarned: 0.5,
        stats: {
          xp: result.profile.xp,
          streak: result.streak,
          hours: result.profile.learningHours,
          rank: result.rank,
          level: result.level,
        },
      },
    });
  } catch (error) {
    console.error('solveChallenge error:', error);
    res.status(500).json({ success: false, error: 'Failed to solve challenge' });
  }
};

export const getLearnerProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const timeZone = req.query.tz || req.headers['x-timezone'] || null;

    const [
      profile,
      enrollments,
      lessonsCompleted,
      challengesSolved,
      challengesAttempted,
      circuitsBuilt,
      simulationsRun,
      weeklyData,
    ] = await Promise.all([
      prisma.learnerProfile.findUnique({ where: { userId } }),
      prisma.enrollment.findMany({ where: { userId }, include: { course: { select: { totalLessons: true } } } }),
      prisma.submission.count({ where: { userId, type: 'Lesson', status: 'COMPLETED' } }),
      prisma.submission.count({ where: { userId, type: 'Challenge', status: 'COMPLETED' } }),
      prisma.submission.count({ where: { userId, type: 'Challenge' } }),
      prisma.savedCircuit.count({ where: { userId } }),
      prisma.simulationRun.count({ where: { userId } }),
      getLearnerWeeklyActivityData(userId, timeZone),
    ]);

    const totalCourses = enrollments.length;
    const coursesCompleted = enrollments.filter(e => e.status === 'Completed' || (e.progress || 0) >= 100).length;
    const totalLessons = enrollments.reduce((sum, e) => sum + (e.course?.totalLessons || 10), 0) || Math.max(lessonsCompleted, 10);
    const overallProgress = totalCourses > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalCourses)
      : 0;

    // Ensure learningHours is at least the verified total active hours recorded this week
    let effectiveHours = profile?.learningHours || 0;
    if (weeklyData?.weekSummary?.totalHours && weeklyData.weekSummary.totalHours > effectiveHours) {
      effectiveHours = weeklyData.weekSummary.totalHours;
      // Reconcile profile in background
      prisma.learnerProfile.update({
        where: { userId },
        data: { learningHours: effectiveHours },
      }).catch(() => {});
    }

    // Dynamic roadmap milestones based on learner XP progression
    const currentXp = profile?.xp || 0;
    const milestones = (XP_MILESTONES || []).map((m, idx) => {
      const isCompleted = currentXp >= m.xp;
      const isNext = !isCompleted && (idx === 0 || currentXp >= (XP_MILESTONES[idx - 1]?.xp || 0));
      return {
        title: `${m.label} Milestone (${m.xp} XP)`,
        xp: m.xp,
        status: isCompleted ? 'Completed' : isNext ? 'In Progress' : 'Locked',
        date: isCompleted ? 'Earned' : isNext ? 'Active Goal' : `Requires ${m.xp} XP`,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        overallProgress,
        coursesCompleted,
        totalCourses,
        lessonsCompleted,
        totalLessons,
        challengesSolved,
        challengesAttempted: Math.max(challengesSolved, challengesAttempted),
        quizAvgScore: 0,
        learningHours: effectiveHours,
        currentStreak: profile?.streak || 0,
        longestStreak: profile?.longestStreak || 0,
        weeklyActivity: weeklyData.weeklyActivity,
        weeklyDetails: weeklyData.weeklyDetails,
        rolling7Days: weeklyData.rolling7Days,
        weekSummary: weeklyData.weekSummary,
        todayIndex: weeklyData.todayIndex,
        timeZone: weeklyData.timeZone,
        milestones,
        circuitsBuilt,
        simulationsRun,
        aiInteractions: 0,
      },
    });
  } catch (error) {
    console.error('getLearnerProgress error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch progress' });
  }
};

export const getLearnerAchievements = async (req, res) => {
  try {
    const data = await getLearnerAchievementsData(req.user.id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching learner achievements:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch achievements' });
  }
};

export const getLearnerProfile = async (req, res) => {
  try {
    const timeZone = req.query.tz || req.headers['x-timezone'] || null;
    const profileData = await getLearnerProfileData(req.user, timeZone);
    return res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error('getLearnerProfile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

export const updateLearnerProfile = async (req, res) => {
  try {
    const { name, bio, institution, phone, mobile, github, linkedin, socialLinks } = req.body;
    
    // 1. If name is provided, update User.name
    if (name && typeof name === 'string' && name.trim()) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: name.trim() },
      });
    }

    // 2. Update bio and institution via Prisma upsert
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (institution !== undefined) updateData.institution = institution;

    await prisma.learnerProfile.upsert({
      where: { userId: req.user.id },
      update: updateData,
      create: { userId: req.user.id, ...updateData },
    });

    // 3. Update phone, github, linkedin, socialLinks directly in Postgres
    const resolvedPhone = phone !== undefined ? String(phone).trim() : (mobile !== undefined ? String(mobile).trim() : undefined);
    const resolvedGithub = github !== undefined ? String(github).trim() : undefined;
    const resolvedLinkedin = linkedin !== undefined ? String(linkedin).trim() : undefined;
    const resolvedSocial = socialLinks !== undefined
      ? (typeof socialLinks === 'object' ? JSON.stringify(socialLinks) : String(socialLinks))
      : undefined;

    const setClauses = [];
    const params = [req.user.id];
    let paramIdx = 2;

    if (resolvedPhone !== undefined) {
      setClauses.push(`"phone" = $${paramIdx++}`);
      params.push(resolvedPhone);
    }
    if (resolvedGithub !== undefined) {
      setClauses.push(`"github" = $${paramIdx++}`);
      params.push(resolvedGithub);
    }
    if (resolvedLinkedin !== undefined) {
      setClauses.push(`"linkedin" = $${paramIdx++}`);
      params.push(resolvedLinkedin);
    }
    if (resolvedSocial !== undefined) {
      setClauses.push(`"socialLinks" = $${paramIdx++}::jsonb`);
      params.push(resolvedSocial);
    }

    if (setClauses.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE "LearnerProfile" SET ${setClauses.join(', ')} WHERE "userId" = $1`,
        ...params
      );
    }

    const timeZone = req.query.tz || req.headers['x-timezone'] || null;
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    const profileData = await getLearnerProfileData(updatedUser, timeZone);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: profileData,
    });
  } catch (error) {
    console.error('updateLearnerProfile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

export const logLearnerActivity = async (req, res) => {
  try {
    const { type = 'PRACTICE', description = 'Quantum study session', xp = 40, hours = 0.3 } = req.body;

    const result = await recordLearnerWork({
      userId: req.user.id,
      type: (type || 'PRACTICE').toUpperCase(),
      description,
      xp: parseInt(xp) || 40,
      hours: parseFloat(hours) || 0.3,
    });

    const timeZone = req.query.tz || req.headers['x-timezone'] || null;
    const profileData = await getLearnerProfileData(req.user, timeZone);

    return res.status(200).json({
      success: true,
      message: 'Activity recorded! Your profile and heatmap have updated.',
      data: profileData,
    });
  } catch (error) {
    console.error('logLearnerActivity error:', error);
    res.status(500).json({ success: false, error: 'Failed to log learner activity' });
  }
};

export const logStudyHeartbeat = async (req, res) => {
  try {
    const { seconds = 60, context = '', title = '', tz = null } = req.body || {};
    const timeZone = tz || req.query.tz || req.headers['x-timezone'] || null;
    const result = await recordStudyHeartbeat({
      userId: req.user.id,
      seconds: parseInt(seconds) || 60,
      context,
      title,
      timeZone,
    });

    return res.status(200).json({
      success: true,
      message: 'Study heartbeat logged successfully.',
      data: result,
    });
  } catch (error) {
    console.error('logStudyHeartbeat error:', error);
    res.status(500).json({ success: false, error: 'Failed to log study heartbeat' });
  }
};

export const getTodayGoals = async (req, res) => {
  try {
    const goals = await prisma.dailyGoal.findMany({
      where: { userId: req.user.id, date: new Date().toISOString().slice(0, 10) }
    });

    return res.status(200).json({
      success: true,
      data: {
        goals,
        date: new Date().toISOString().slice(0, 10),
        xpAvailable: 180,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch goals' });
  }
};

export const toggleGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { done } = req.body;
    
    const updated = await prisma.dailyGoal.update({
      where: { id: goalId },
      data: { done, xpEarned: done ? 30 : 0 }
    });

    if (done) {
      await recordLearnerWork({
        userId: req.user.id,
        type: 'GOAL',
        description: `Completed daily goal: ${updated.label}`,
        xp: 30,
        hours: 0.2,
      }).catch(err => console.warn('Goal work record warning:', err.message));
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('toggleGoal error:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle goal' });
  }
};
