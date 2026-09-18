import prisma from '../config/db.js';
import { formatDate, extractHoursFromSubmission } from './learnerActivityService.js';

/**
 * Format minutes into a clean human-readable duration
 * e.g. 35 -> "35m", 75 -> "1h 15m", 120 -> "2h", 0 -> "0m"
 */
export function formatDuration(minutes) {
  const mins = Math.max(0, Math.round(minutes || 0));
  if (mins === 0) return '0m';
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs === 0) return `${remMins}m`;
  if (remMins === 0) return `${hrs}h`;
  return `${hrs}h ${remMins}m`;
}

/**
 * Retrieve comprehensive and accurate weekly learning activity data for a learner.
 * Supports:
 *  1. Current Week (Monday to Sunday) with day-by-day dates and today indicator
 *  2. Rolling Past 7 Days (6 days ago to today) with dynamic weekday labels
 *  3. Accurate calendar-day time tracking (active study heartbeats + completed lessons/challenges/labs)
 *  4. Week summary metrics (total hours, daily average, active days, peak day)
 *  5. Direct float array `weeklyActivity` [monHrs, tueHrs, ...] for backwards compatibility
 *
 * @param {string} userId
 * @param {string} timeZone User's local timezone (e.g. 'Asia/Kolkata')
 */
export async function getLearnerWeeklyActivityData(userId, timeZone = null) {
  const now = new Date();
  const tz = timeZone || 'UTC';

  // 1. Get today's date string and day-of-week in the user's timezone
  const todayStr = formatDate(now, tz); // "YYYY-MM-DD"
  let weekday = 'Mon';
  try {
    weekday = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now);
  } catch (e) {
    weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(now);
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Current weekday index in Monday-to-Sunday format (0 = Mon, ..., 6 = Sun)
  let currentMonSunIdx = dayNames.indexOf(weekday);
  if (currentMonSunIdx === -1) currentMonSunIdx = 0;

  // Base date representing today at noon UTC to perform safe date-stepping
  const [yearNum, monthNum, dayNum] = todayStr.split('-').map(Number);
  const baseDate = new Date(Date.UTC(yearNum, monthNum - 1, dayNum, 12, 0, 0));

  // Monday of the current week (Mon-Sun)
  const mondayDate = new Date(baseDate);
  mondayDate.setUTCDate(baseDate.getUTCDate() - currentMonSunIdx);

  // 14 days lookback start date to ensure all possible activities across both current week and rolling 7 days are fetched
  const queryStartDate = new Date(baseDate);
  queryStartDate.setUTCDate(baseDate.getUTCDate() - 14);
  queryStartDate.setUTCHours(0, 0, 0, 0);

  // 2. Fetch all user activities across models within range
  const [submissions, goals, simulations, experiments, circuits] = await Promise.all([
    prisma.submission.findMany({
      where: { userId, submittedAt: { gte: queryStartDate } },
      select: { id: true, submittedAt: true, type: true, score: true, feedback: true, assignmentId: true },
      orderBy: { submittedAt: 'asc' },
    }),
    prisma.dailyGoal.findMany({
      where: { userId, createdAt: { gte: queryStartDate } },
      select: { createdAt: true, done: true, label: true },
    }),
    prisma.simulationRun.findMany({
      where: { userId, createdAt: { gte: queryStartDate } },
      select: { createdAt: true, backend: true },
    }),
    prisma.experiment.findMany({
      where: { userId, createdAt: { gte: queryStartDate } },
      select: { createdAt: true, name: true },
    }),
    prisma.savedCircuit.findMany({
      where: { userId, createdAt: { gte: queryStartDate } },
      select: { createdAt: true, name: true },
    }),
  ]);

  // 3. Aggregate activity minutes, counts, and descriptions keyed strictly by local calendar date (YYYY-MM-DD)
  // Maps dateStr -> { minutes: number, count: number, details: string[], studyMinutes: number, taskMinutes: number }
  const dailyActivityMap = new Map();

  function recordDayTime(dateStr, mins, label = '', isStudySession = false) {
    if (!dateStr || isNaN(mins) || mins <= 0) return;
    const roundedMins = Math.round(mins);
    const existing = dailyActivityMap.get(dateStr) || {
      minutes: 0,
      count: 0,
      details: [],
      studyMinutes: 0,
      taskMinutes: 0,
    };

    existing.minutes += roundedMins;
    existing.count += 1;
    if (isStudySession) {
      existing.studyMinutes += roundedMins;
    } else {
      existing.taskMinutes += roundedMins;
    }

    if (label && existing.details.length < 6) {
      existing.details.push(label);
    }
    dailyActivityMap.set(dateStr, existing);
  }

  // A. Process submissions
  submissions.forEach((s) => {
    // Check if this is a dedicated study heartbeat session
    const isStudySession = s.assignmentId?.startsWith('study_session_') || s.type === 'Practice';
    
    // For study sessions, prefer the date encoded in assignmentId (e.g. study_session_2026-09-17)
    let sessionDate = null;
    if (s.assignmentId?.startsWith('study_session_')) {
      const match = s.assignmentId.match(/study_session_(\d{4}-\d{2}-\d{2})/);
      if (match) sessionDate = match[1];
    }
    const targetDateStr = sessionDate || formatDate(s.submittedAt, tz);

    let parsedHours = 0;
    let parsedMinutes = 0;
    let description = '';

    if (s.feedback) {
      try {
        if (typeof s.feedback === 'string' && s.feedback.trim().startsWith('{')) {
          const parsed = JSON.parse(s.feedback);
          parsedHours = parsed.hours ? parseFloat(parsed.hours) : 0;
          parsedMinutes = parsed.minutes ? parseInt(parsed.minutes, 10) : 0;
          description = parsed.description || '';
        }
      } catch (e) {}
    }

    // Determine accurate minutes
    let effectiveMins = parsedMinutes;
    if (!effectiveMins && parsedHours > 0) {
      effectiveMins = Math.round(parsedHours * 60);
    }
    if (!effectiveMins) {
      const extHrs = extractHoursFromSubmission(s);
      effectiveMins = Math.round(extHrs * 60);
    }

    // Determine label
    let itemLabel = '';
    if (isStudySession) {
      itemLabel = `Active Study (${formatDuration(effectiveMins)})`;
    } else if (s.type === 'Course_Graduation') {
      itemLabel = `🎓 Course Graduation (${formatDuration(effectiveMins)})`;
    } else if (s.type === 'Challenge') {
      itemLabel = `Challenge Solved (${formatDuration(effectiveMins)})`;
    } else if (s.type === 'Lesson') {
      itemLabel = `Lesson Completed (${formatDuration(effectiveMins)})`;
    } else {
      itemLabel = `${s.type || 'Activity'} (${formatDuration(effectiveMins)})`;
    }

    recordDayTime(targetDateStr, effectiveMins, itemLabel, isStudySession);
  });

  // B. Process non-submission activities (if not already logged via recordLearnerWork submissions)
  // Daily goals
  goals.filter((g) => g.done).forEach((g) => {
    const dStr = formatDate(g.createdAt, tz);
    recordDayTime(dStr, 12, `Daily Goal: ${g.label || 'Completed'}`);
  });

  // Simulations
  simulations.forEach((sim) => {
    const dStr = formatDate(sim.createdAt, tz);
    recordDayTime(dStr, 12, `Simulation: ${sim.backend || 'Qiskit'}`);
  });

  // Experiments
  experiments.forEach((exp) => {
    const dStr = formatDate(exp.createdAt, tz);
    recordDayTime(dStr, 15, `Lab: ${exp.name || 'Quantum Lab'}`);
  });

  // Circuits
  circuits.forEach((c) => {
    const dStr = formatDate(c.createdAt, tz);
    recordDayTime(dStr, 15, `Circuit: ${c.name || 'Quantum Circuit'}`);
  });

  // 4. Construct Current Week Day Objects (Monday to Sunday)
  const weekDetails = [];
  const weeklyActivity = [];
  let totalWeeklyMinutes = 0;
  let activeDaysThisWeek = 0;
  let peakDayName = 'None';
  let peakMinutes = 0;

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(mondayDate);
    dayDate.setUTCDate(mondayDate.getUTCDate() + i);

    const year = dayDate.getUTCFullYear();
    const month = String(dayDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dayDate.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const isToday = dateStr === todayStr;
    const isFuture = i > currentMonSunIdx;
    const formattedDate = `${dayDate.getUTCDate()} ${monthNames[dayDate.getUTCMonth()]}`;

    const dayData = dailyActivityMap.get(dateStr) || { minutes: 0, count: 0, details: [] };
    const dayMinutes = dayData.minutes;
    const dayHours = parseFloat((dayMinutes / 60).toFixed(1));

    if (dayMinutes > 0) {
      activeDaysThisWeek += 1;
      totalWeeklyMinutes += dayMinutes;
      if (dayMinutes > peakMinutes) {
        peakMinutes = dayMinutes;
        peakDayName = fullDayNames[i];
      }
    }

    weeklyActivity.push(dayHours);

    weekDetails.push({
      index: i,
      day: dayNames[i],
      fullDay: fullDayNames[i],
      date: dateStr,
      formattedDate,
      hours: dayHours,
      minutes: dayMinutes,
      formattedTime: formatDuration(dayMinutes),
      isToday,
      isFuture,
      activityCount: dayData.count,
      details: dayData.details,
    });
  }

  // 5. Construct Rolling Past 7 Days (6 days ago up to today)
  const rolling7Days = [];
  let totalRollingMinutes = 0;

  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(baseDate);
    dayDate.setUTCDate(baseDate.getUTCDate() - i);

    const year = dayDate.getUTCFullYear();
    const month = String(dayDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dayDate.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dWeekday = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' }).format(dayDate);
    const dFullWeekday = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' }).format(dayDate);
    const formattedDate = `${dayDate.getUTCDate()} ${monthNames[dayDate.getUTCMonth()]}`;

    const dayData = dailyActivityMap.get(dateStr) || { minutes: 0, count: 0, details: [] };
    const dayMinutes = dayData.minutes;
    const dayHours = parseFloat((dayMinutes / 60).toFixed(1));

    totalRollingMinutes += dayMinutes;

    rolling7Days.push({
      day: dWeekday,
      fullDay: dFullWeekday,
      date: dateStr,
      formattedDate,
      hours: dayHours,
      minutes: dayMinutes,
      formattedTime: formatDuration(dayMinutes),
      isToday: dateStr === todayStr,
      isFuture: false,
      activityCount: dayData.count,
      details: dayData.details,
    });
  }

  // 6. Summary metrics for student improvement
  const totalWeeklyHours = parseFloat((totalWeeklyMinutes / 60).toFixed(1));
  const elapsedDays = Math.max(1, currentMonSunIdx + 1);
  const dailyAverageMinutes = Math.round(totalWeeklyMinutes / elapsedDays);
  const dailyAverageHours = parseFloat((dailyAverageMinutes / 60).toFixed(1));

  // Today specific metrics
  const todayData = dailyActivityMap.get(todayStr) || { minutes: 0, count: 0, details: [] };
  const todayHours = parseFloat((todayData.minutes / 60).toFixed(1));

  const weekSummary = {
    totalHours: totalWeeklyHours,
    totalMinutes: totalWeeklyMinutes,
    formattedTotalTime: formatDuration(totalWeeklyMinutes),
    totalRollingHours: parseFloat((totalRollingMinutes / 60).toFixed(1)),
    totalRollingMinutes,
    activeDays: activeDaysThisWeek,
    daysElapsed: elapsedDays,
    dailyAverageHours,
    dailyAverageMinutes,
    formattedDailyAverage: formatDuration(dailyAverageMinutes),
    bestDay: peakDayName,
    todayHours,
    todayMinutes: todayData.minutes,
    formattedTodayTime: formatDuration(todayData.minutes),
    todayActivityCount: todayData.count,
    weeklyTargetHours: 5, // Recommended weekly quantum study target
    targetProgressPct: Math.min(100, Math.round((totalWeeklyHours / 5) * 100)),
  };

  return {
    weeklyActivity, // Legacy 7-element float array [monHrs, tueHrs, wedHrs, thuHrs, friHrs, satHrs, sunHrs]
    weeklyDetails: weekDetails, // Current week Monday to Sunday rich day objects
    rolling7Days, // Trailing 7 days rich day objects
    weekSummary,
    todayIndex: currentMonSunIdx,
    timeZone: tz,
  };
}
