"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { LearnerSidebar } from '../../components/sidebar';
import DashboardNavbar from '../../components/navbar/DashboardNavbar';
import { apiFetch } from '../../services/api';
import {
  LuChartBar,
  LuSparkles,
  LuAward,
  LuGraduationCap,
  LuCheck,
  LuClock,
  LuFlame,
  LuCpu,
  LuActivity,
  LuTrophy,
  LuBookOpen,
  LuBrain,
  LuBot,
  LuTarget,
  LuCalendar,
} from 'react-icons/lu';

const DEFAULT_PROGRESS = {
  overallProgress: 0,
  coursesCompleted: 0,
  totalCourses: 0,
  lessonsCompleted: 0,
  totalLessons: 0,
  challengesSolved: 0,
  challengesAttempted: 0,
  quizAvgScore: 0,
  learningHours: 0,
  currentStreak: 0,
  longestStreak: 0,
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  weeklyDetails: [],
  rolling7Days: [],
  weekSummary: {
    totalHours: 0,
    totalMinutes: 0,
    formattedTotalTime: '0m',
    totalRollingHours: 0,
    totalRollingMinutes: 0,
    activeDays: 0,
    daysElapsed: 1,
    dailyAverageHours: 0,
    dailyAverageMinutes: 0,
    formattedDailyAverage: '0m',
    bestDay: 'None',
    todayHours: 0,
    todayMinutes: 0,
    formattedTodayTime: '0m',
    todayActivityCount: 0,
    weeklyTargetHours: 5,
    targetProgressPct: 0,
  },
  milestones: [],
  circuitsBuilt: 0,
  simulationsRun: 0,
  aiInteractions: 0,
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProgressPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [activityView, setActivityView] = useState('week'); // 'week' | 'rolling'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const fetchProgress = React.useCallback(async () => {
    try {
      setLoading(true);
      const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
      const res = await apiFetch(`/learner/progress?tz=${encodeURIComponent(tz)}`);
      if (res?.data) {
        setProgress(res.data);
      }
    } catch (err) {
      console.warn('ProgressPage error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();

    const handleStorage = (e) => {
      if (e.key === 'learner_activity_sync') {
        fetchProgress();
      }
    };

    // Auto-refresh every 60s to dynamically reflect learning time and activity updates
    const liveInterval = setInterval(() => {
      fetchProgress();
    }, 60000);

    window.addEventListener('focus', fetchProgress);
    window.addEventListener('learner:activity-updated', fetchProgress);
    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(liveInterval);
      window.removeEventListener('focus', fetchProgress);
      window.removeEventListener('learner:activity-updated', fetchProgress);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchProgress]);

  const stats = [
    { label: 'Circuits Created', value: progress.circuitsBuilt, icon: LuCpu, color: 'text-cyan-400', change: '+3 this week' },
    { label: 'Simulations Run', value: progress.simulationsRun, icon: LuActivity, color: 'text-violet-400', change: '+12 this week' },
    { label: 'Challenges Solved', value: `${progress.challengesSolved}/${progress.challengesAttempted}`, icon: LuTrophy, color: 'text-amber-400', change: `${Math.round((progress.challengesSolved / (progress.challengesAttempted || 1)) * 100)}% Accuracy` },
    { label: 'Learning Hours', value: `${progress.learningHours}h`, icon: LuClock, color: 'text-emerald-400', change: `${progress.currentStreak} day streak 🔥` },
  ];

  // Current Week Days fallback if backend hasn't populated weeklyDetails
  const currentWeekDays = progress.weeklyDetails && progress.weeklyDetails.length === 7
    ? progress.weeklyDetails
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
        index: i,
        day: d,
        fullDay: d,
        date: '',
        formattedDate: '',
        hours: (progress.weeklyActivity && progress.weeklyActivity[i]) || 0,
        minutes: Math.round(((progress.weeklyActivity && progress.weeklyActivity[i]) || 0) * 60),
        formattedTime: `${(progress.weeklyActivity && progress.weeklyActivity[i]) || 0}h`,
        isToday: false,
        isFuture: false,
        details: [],
      }));

  const rollingDays = progress.rolling7Days && progress.rolling7Days.length === 7
    ? progress.rolling7Days
    : currentWeekDays;

  const displayDays = activityView === 'rolling' ? rollingDays : currentWeekDays;
  const maxWeeklyHours = Math.max(...displayDays.map(d => d.hours || 0), 2);

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-text)] flex">
        <LearnerSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        <div className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          <DashboardNavbar
            title="Learning Analytics & Progress"
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onMobileMenuClick={() => setIsMobileOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-cyan-500/10 p-6 sm:p-8">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[var(--color-primary)]/10 blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Comprehensive Analytics
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--color-text)]">
                    Quantum Competency Overview
                  </h1>
                  <p className="text-sm text-[var(--color-muted)] max-w-xl">
                    Track your journey across quantum circuits, foundational courses, algorithms, and simulation benchmarks.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-[var(--color-background)]/80 backdrop-blur-md border border-[var(--color-border)] p-4 rounded-2xl">
                  <div className="text-center px-3">
                    <div className="text-2xl font-black font-mono text-[var(--color-primary)]">{progress.overallProgress}%</div>
                    <div className="text-[10px] uppercase font-mono text-[var(--color-muted)]">Overall Completion</div>
                  </div>
                  <div className="h-8 w-px bg-[var(--color-border)]" />
                  <div className="text-center px-3">
                    <div className="text-2xl font-black font-mono text-amber-400 flex items-center justify-center gap-1">
                      <LuFlame size={20} /> {progress.currentStreak}
                    </div>
                    <div className="text-[10px] uppercase font-mono text-[var(--color-muted)]">Day Streak</div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-mono text-[var(--color-muted)]">
                  <span>Overall Curriculum Mastery</span>
                  <span>{progress.overallProgress}%</span>
                </div>
                <div className="h-2.5 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
                    style={{ width: `${progress.overallProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-3 hover:border-[var(--color-primary)]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--color-muted)]">{s.label}</span>
                      <div className={`p-2 rounded-xl bg-[var(--color-border)]/20 ${s.color}`}>
                        <Icon size={18} />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold font-mono text-[var(--color-text)]">
                      {s.value}
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold block">
                      {s.change}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Learning Activity & Detailed Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Activity Chart */}
              <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                      <LuActivity size={20} className="text-cyan-400" />
                      <span>Weekly Learning Activity</span>
                    </h2>
                    <p className="text-xs text-[var(--color-muted)] mt-1">
                      {activityView === 'week'
                        ? 'Track daily focus time across the current Monday–Sunday schedule'
                        : 'Rolling learning time and practice recorded over the past 7 days'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Switcher: Current Week vs Rolling 7 Days */}
                    <div className="inline-flex p-1 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setActivityView('week')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          activityView === 'week'
                            ? 'bg-[var(--color-primary)] text-white shadow-sm font-semibold'
                            : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        This Week
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivityView('rolling')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          activityView === 'rolling'
                            ? 'bg-[var(--color-primary)] text-white shadow-sm font-semibold'
                            : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        Past 7 Days
                      </button>
                    </div>

                    <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full whitespace-nowrap">
                      {activityView === 'week'
                        ? `${progress.weekSummary?.formattedTotalTime || `${progress.weekSummary?.totalHours || 0}h`} this week`
                        : `${progress.weekSummary?.totalRollingHours || 0} hrs past 7 days`}
                    </span>
                  </div>
                </div>

                {/* Bars Grid */}
                <div className="relative pt-6 pb-2">
                  <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-1 sm:px-2">
                    {displayDays.map((item, idx) => {
                      const hrs = item.hours || 0;
                      const heightPct = hrs > 0
                        ? Math.max(12, Math.round((hrs / maxWeeklyHours) * 100))
                        : item.isFuture
                        ? 0
                        : 5;
                      const isHovered = hoveredIndex === idx;

                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer"
                        >
                          {/* Rich Floating Tooltip */}
                          {isHovered && (
                            <div className="absolute -top-16 z-30 px-3 py-2 rounded-xl bg-slate-900/95 text-white border border-cyan-500/40 shadow-xl shadow-cyan-500/10 text-center pointer-events-none whitespace-nowrap backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                              <div className="text-[11px] font-bold font-mono text-cyan-300">
                                {item.fullDay || item.day} {item.formattedDate ? `• ${item.formattedDate}` : ''}
                              </div>
                              <div className="text-xs font-semibold mt-0.5">
                                {item.formattedTime || `${hrs}h`} ({hrs} hrs)
                              </div>
                              {item.details && item.details.length > 0 ? (
                                <div className="text-[10px] text-slate-300 max-w-[200px] truncate mt-0.5">
                                  {item.details.join(', ')}
                                </div>
                              ) : item.isToday ? (
                                <div className="text-[10px] text-cyan-400 mt-0.5">Today&apos;s Active Session</div>
                              ) : item.isFuture ? (
                                <div className="text-[10px] text-slate-400 mt-0.5">Upcoming Day</div>
                              ) : (
                                <div className="text-[10px] text-slate-400 mt-0.5">No logged activity</div>
                              )}
                            </div>
                          )}

                          {/* Time tag above bar */}
                          <span
                            className={`text-[10px] font-mono transition-opacity ${
                              item.isToday
                                ? 'text-cyan-400 font-bold opacity-100'
                                : hrs > 0
                                ? 'text-[var(--color-muted)] group-hover:opacity-100 group-hover:text-[var(--color-text)]'
                                : 'opacity-0'
                            }`}
                          >
                            {item.formattedTime || `${hrs}h`}
                          </span>

                          {/* Bar Container */}
                          <div
                            className={`w-full rounded-xl h-32 flex items-end overflow-hidden p-1 transition-all ${
                              item.isToday
                                ? 'bg-cyan-500/15 border-2 border-cyan-400/80 shadow-md shadow-cyan-500/20'
                                : item.isFuture
                                ? 'bg-[var(--color-border)]/15 border border-dashed border-[var(--color-border)]/40'
                                : 'bg-[var(--color-border)]/30 border border-[var(--color-border)]/30'
                            }`}
                          >
                            <div
                              className={`w-full rounded-lg transition-all duration-500 ${
                                item.isToday
                                  ? 'bg-gradient-to-t from-[var(--color-primary)] via-cyan-400 to-cyan-300 shadow-sm shadow-cyan-400/50'
                                  : hrs > 0
                                  ? 'bg-gradient-to-t from-[var(--color-primary)] to-cyan-400 group-hover:brightness-110'
                                  : item.isFuture
                                  ? 'bg-transparent'
                                  : 'bg-[var(--color-border)]/40'
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>

                          {/* Day & Date Labels */}
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className={`text-xs font-mono font-semibold ${
                                item.isToday
                                  ? 'text-cyan-400'
                                  : item.isFuture
                                  ? 'text-[var(--color-muted)]/60'
                                  : 'text-[var(--color-text)]'
                              }`}
                            >
                              {item.day}
                            </span>
                            {item.formattedDate && (
                              <span className="text-[10px] font-mono text-[var(--color-muted)] whitespace-nowrap">
                                {item.formattedDate.split(' ')[0]}
                              </span>
                            )}
                            {item.isToday && (
                              <span className="mt-0.5 text-[8px] font-mono uppercase tracking-widest font-black text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-1 rounded-sm">
                                Today
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actionable Learning Metrics & Goal Progress Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--color-border)]/60">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-background)]/60 border border-[var(--color-border)]/60">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <LuClock size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-[var(--color-muted)]">Daily Average</div>
                      <div className="text-sm font-bold font-mono text-[var(--color-text)]">
                        {progress.weekSummary?.formattedDailyAverage || '0m'} / day
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-background)]/60 border border-[var(--color-border)]/60">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <LuFlame size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-[var(--color-muted)]">Active Days</div>
                      <div className="text-sm font-bold font-mono text-[var(--color-text)]">
                        {progress.weekSummary?.activeDays || 0} of 7 days logged
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-background)]/60 border border-[var(--color-border)]/60">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <LuTarget size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-[var(--color-muted)]">Weekly Target (5h)</div>
                      <div className="text-sm font-bold font-mono text-[var(--color-text)]">
                        {progress.weekSummary?.targetProgressPct || 0}% reached
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skill & Learning Improvement Advice */}
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-transparent border border-cyan-500/20 text-xs text-[var(--color-muted)]">
                  <LuSparkles size={16} className="text-cyan-400 shrink-0" />
                  <span>
                    <strong className="text-[var(--color-text)] font-semibold">Skill Retention Tip: </strong>
                    {progress.weekSummary?.todayHours > 0
                      ? `Great momentum! You logged ${progress.weekSummary.formattedTodayTime || `${progress.weekSummary.todayHours}h`} today. Studying in consistent daily blocks enhances quantum circuit comprehension and maintains your streak.`
                      : 'Setting aside 30–45 minutes of daily practice keeps your streak alive and accelerates quantum algorithm problem solving.'}
                  </span>
                </div>
              </div>

              {/* Progress Breakdown */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5">
                <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                  <LuChartBar size={20} className="text-violet-400" />
                  <span>Curriculum Breakdown</span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[var(--color-muted)]">Courses</span>
                      <span className="font-semibold text-[var(--color-text)]">{progress.coursesCompleted} / {progress.totalCourses}</span>
                    </div>
                    <div className="h-2 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.round((progress.coursesCompleted / progress.totalCourses) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[var(--color-muted)]">Lessons Completed</span>
                      <span className="font-semibold text-[var(--color-text)]">{progress.lessonsCompleted} / {progress.totalLessons}</span>
                    </div>
                    <div className="h-2 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${Math.round((progress.lessonsCompleted / progress.totalLessons) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[var(--color-muted)]">Challenges Solved</span>
                      <span className="font-semibold text-[var(--color-text)]">{progress.challengesSolved} / {progress.challengesAttempted}</span>
                    </div>
                    <div className="h-2 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.round((progress.challengesSolved / progress.challengesAttempted) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[var(--color-muted)]">Quiz Average</span>
                      <span className="font-semibold text-emerald-400">{progress.quizAvgScore}%</span>
                    </div>
                    <div className="h-2 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${progress.quizAvgScore}%` }} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)]/50 flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
                      <LuBot size={14} className="text-cyan-400" /> AI Tutor Sessions
                    </span>
                    <span className="font-bold text-[var(--color-text)]">{progress.aiInteractions} queried</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Timeline */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
              <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                <LuAward size={20} className="text-cyan-400" />
                <span>Quantum Learning Roadmap</span>
              </h2>

              <div className="space-y-4">
                {(progress.milestones || []).map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--color-primary)]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          m.status === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : m.status === 'In Progress'
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                            : 'bg-[var(--color-border)]/50 text-[var(--color-muted)]'
                        }`}
                      >
                        {m.status === 'Completed' ? <LuCheck size={16} /> : idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[var(--color-text)]">{m.title}</div>
                        <div className="text-[11px] text-[var(--color-muted)] font-mono">{m.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {m.xp && (
                        <span className="text-xs font-mono text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          +{m.xp} XP
                        </span>
                      )}
                      <span
                        className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full ${
                          m.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : m.status === 'In Progress'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-[var(--color-border)]/50 text-[var(--color-muted)] border border-[var(--color-border)]'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
