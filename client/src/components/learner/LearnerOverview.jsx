"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LuGraduationCap,
  LuTrophy,
  LuSparkles,
  LuBookOpen,
  LuArrowRight,
  LuFlame,
  LuPlay,
  LuCircleCheckBig,
  LuClock,
  LuTarget,
  LuBot,
  LuZap,
  LuStar,
  LuActivity,
  LuCpu,
  LuBrain,
  LuChevronRight,
  LuCheck,
  LuCircle,
  LuFlaskConical,
  LuMessageSquare,
  LuSave,
  LuTrendingUp,
  LuCalendar,
  LuShield,
} from 'react-icons/lu';

function WelcomeCard({ user = {}, currentCourse = {} }) {
  const xpPct = Math.round((user.xp / user.nextLevelXp) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/20 via-[var(--color-surface)] to-[var(--color-secondary)]/10 p-6 sm:p-8 shadow-lg">
      {/* Background orbs */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[var(--color-primary)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[var(--color-secondary)]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar + Level */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {(user.name || 'L')[0]}
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
            Lvl {user.level}
          </span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--color-text)]">
                Welcome back, {user.name?.split(' ')[0]}!
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <LuFlame size={13} />
                {user.streak}-day streak
              </span>
            </div>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Currently in <span className="text-[var(--color-text)] font-medium">{currentCourse.title}</span>
            </p>
          </div>

          {/* XP Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-[var(--color-muted)]">
              <span>{user.xp.toLocaleString()} XP</span>
              <span>Level {user.level + 1}: {user.nextLevelXp.toLocaleString()} XP</span>
            </div>
            <div className="w-full h-2 bg-[var(--color-border)]/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <div className="text-[10px] text-[var(--color-muted)]">{xpPct}% to next level</div>
          </div>
        </div>

        {/* Overall progress ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="rotate-[-90deg] w-20 h-20">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-border)" strokeWidth="6" opacity="0.4" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="url(#progressGrad)" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - currentCourse.progress / 100)}`}
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold font-mono text-[var(--color-text)]">{currentCourse.progress}%</span>
            </div>
          </div>
          <span className="text-[10px] text-[var(--color-muted)] text-center">Course<br/>Progress</span>
        </div>
      </div>
    </div>
  );
}

function ContinueLearning({ currentCourse = {} }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-[var(--color-primary)]/40 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
        <LuPlay size={22} className="text-[var(--color-primary)] ml-0.5" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Continue Learning</div>
        <div className="text-base font-semibold text-[var(--color-text)] truncate">{currentCourse.title}</div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-[var(--color-border)]/30 font-mono">{currentCourse.module}</span>
          <LuChevronRight size={12} />
          <span>{currentCourse.lesson}</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-1.5 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${currentCourse.progress}%` }} />
          </div>
          <span className="text-[11px] font-mono text-[var(--color-muted)]">{currentCourse.progress}%</span>
        </div>
      </div>
      <Link
        href="/learn"
        className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-[var(--color-primary)]/20"
      >
        <span>Resume</span>
        <LuArrowRight size={15} />
      </Link>
    </div>
  );
}

function TodaysGoals({ goals = [] }) {
  const [checked, setChecked] = useState(goals.map(g => g.done));
  const donePct = Math.round((checked.filter(Boolean).length / (checked.length || 1)) * 100);

  const getGoalIcon = (g) => {
    if (g.icon && typeof g.icon !== 'string') return g.icon;
    if (g.type === 'challenge') return LuTrophy;
    if (g.type === 'simulation') return LuFlaskConical;
    if (g.type === 'quiz') return LuBrain;
    return LuBookOpen;
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base text-[var(--color-text)]">Today's Goals</h2>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">{checked.filter(Boolean).length} of {goals.length} completed</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold font-mono text-[var(--color-primary)]">{donePct}%</div>
          <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">Done</div>
        </div>
      </div>
      <div className="w-full h-1.5 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-500" style={{ width: `${donePct}%` }} />
      </div>
      <ul className="space-y-2.5">
        {goals.map((goal, i) => {
          const Icon = getGoalIcon(goal);
          return (
            <li key={goal.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                checked[i]
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-[var(--color-background)] border-[var(--color-border)]/50 hover:border-[var(--color-primary)]/30'
              }`}
              onClick={() => setChecked(prev => { const n=[...prev]; n[i]=!n[i]; return n; })}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                checked[i] ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--color-border)]'
              }`}>
                {checked[i] && <LuCheck size={11} className="text-white" />}
              </div>
              <Icon size={18} className={checked[i] ? 'text-emerald-400' : 'text-[var(--color-muted)]'} />
              <span className={`text-sm flex-1 ${checked[i] ? 'line-through text-[var(--color-muted)]' : 'text-[var(--color-text)]'}`}>
                {goal.label}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md capitalize ${
                goal.type === 'lesson' ? 'bg-blue-500/10 text-blue-400' :
                goal.type === 'challenge' ? 'bg-amber-500/10 text-amber-400' :
                goal.type === 'simulation' ? 'bg-cyan-500/10 text-cyan-400' :
                'bg-violet-500/10 text-violet-400'
              }`}>{goal.type}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProgressOverview({ stats = { courses: {}, lessons: {}, challenges: {} } }) {
  const items = [
    { label: 'Courses', value: `${stats.courses.completed} / ${stats.courses.enrolled} Completed`, pct: Math.round((stats.courses.completed / (stats.courses.enrolled || 1)) * 100), color: 'bg-blue-500', icon: LuBookOpen },
    { label: 'Lessons', value: `${stats.lessons.completed} / ${stats.lessons.total}`, pct: Math.round((stats.lessons.completed / (stats.lessons.total || 1)) * 100), color: 'bg-[var(--color-primary)]', icon: LuGraduationCap },
    { label: 'Challenges', value: `${stats.challenges.solved} / ${stats.challenges.attempted} Solved`, pct: Math.round((stats.challenges.solved / (stats.challenges.attempted || 1)) * 100), color: 'bg-amber-500', icon: LuTrophy },
    { label: 'Quiz Performance', value: `${stats.quizScore}% Avg`, pct: stats.quizScore, color: 'bg-emerald-500', icon: LuBrain },
    { label: 'Learning Hours', value: `${stats.learningHours} hrs`, pct: Math.min(100, Math.round((stats.learningHours / 50) * 100)), color: 'bg-violet-500', icon: LuClock },
  ];

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-base text-[var(--color-text)]">Progress Overview</h2>
        <Link href="/progress" className="text-xs text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
          Full details <LuArrowRight size={12} />
        </Link>
      </div>
      <div className="space-y-3">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[var(--color-muted)]">
                  <Icon size={13} />
                  {item.label}
                </span>
                <span className="font-mono font-semibold text-[var(--color-text)]">{item.value}</span>
              </div>
              <div className="h-1.5 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActivity({ activities = [] }) {
  const getActivityIcon = (a) => {
    if (a.icon && typeof a.icon !== 'string') return a.icon;
    if (a.type === 'simulation') return LuFlaskConical;
    if (a.type === 'circuit') return LuSave;
    if (a.type === 'ai') return LuBot;
    return LuCircleCheckBig;
  };

  const getActivityColor = (a) => {
    if (a.color) return a.color;
    if (a.type === 'simulation') return 'text-cyan-400';
    if (a.type === 'circuit') return 'text-violet-400';
    if (a.type === 'ai') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-base text-[var(--color-text)]">Recent Activity</h2>
        <Link href="/progress" className="text-xs text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
          View all <LuArrowRight size={12} />
        </Link>
      </div>
      <ul className="space-y-2">
        {activities.map(a => {
          const Icon = getActivityIcon(a);
          const color = getActivityColor(a);
          return (
            <li key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-background)] transition-all">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-background)] flex items-center justify-center flex-shrink-0">
                <Icon size={18} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[var(--color-text)] truncate">{a.label}</div>
              </div>
              <div className="text-[10px] text-[var(--color-muted)] font-mono whitespace-nowrap">{a.time}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AIRecommended({ rec = {} }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-secondary)]/30 bg-gradient-to-br from-cyan-500/5 via-[var(--color-surface)] to-violet-500/5 p-6 space-y-4">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
      <div className="relative z-10 flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <LuSparkles size={20} className="text-cyan-400" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">AI Recommended Next</div>
          <h3 className="font-bold text-base text-[var(--color-text)]">{rec.title}</h3>
          <p className="text-xs text-[var(--color-muted)] leading-relaxed">{rec.reason}</p>
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--color-border)]/30 text-[var(--color-muted)]">{rec.module}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400">{rec.difficulty}</span>
            <span className="text-[10px] font-mono text-[var(--color-muted)] flex items-center gap-1"><LuClock size={10} /> {rec.duration}</span>
          </div>
        </div>
      </div>
      <Link
        href="/learn"
        className="relative z-10 mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg"
      >
        <LuZap size={14} />
        Start this lesson
      </Link>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function LearnerOverview({ user, hubData }) {
  const mergedUser = {
    name: hubData?.user?.name || user?.name || 'Learner',
    level: hubData?.level || 1,
    xp: hubData?.xp || 0,
    nextLevelXp: hubData?.nextLevelXp || 1000,
    streak: hubData?.streak || 0,
  };

  const currentCourse = hubData?.currentCourse || { title: 'Welcome to Quantum Platform', module: 'Getting Started', lesson: 'Introduction', progress: 0 };
  const todaysGoals = hubData?.todayGoals || hubData?.todaysGoals || [];
  const stats = hubData?.stats || { courses: {}, lessons: {}, challenges: {}, quizScore: 0, learningHours: 0 };
  const recentActivity = hubData?.recentActivity || [];
  const recommendation = hubData?.recommendation || { title: 'Start Exploring', reason: 'Check out our courses.', module: 'General', difficulty: 'Beginner', duration: '5 min' };
  const quickStats = hubData?.quickStats || { rank: 0, badges: 0, daysActive: 0, xpThisWeek: 0 };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Card */}
      <WelcomeCard user={mergedUser} currentCourse={currentCourse} />

      {/* 2. Continue Learning */}
      <ContinueLearning currentCourse={currentCourse} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3. Today's Goals */}
          <TodaysGoals goals={todaysGoals} />
          {/* 4. Progress Overview */}
          <ProgressOverview stats={stats} />
          {/* 5. Recent Activity */}
          <RecentActivity activities={recentActivity} />
        </div>

        {/* Right col (1/3) */}
        <div className="space-y-6">
          {/* 6. AI Recommended Next */}
          <AIRecommended rec={recommendation} />

          {/* Quick stats */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Global Rank', value: `#${quickStats.rank || 1}`, icon: LuTrendingUp, color: 'text-emerald-400', href: '/achievement#global-leaderboard' },
                { label: 'Badges Earned', value: `${quickStats.badges || 0}`, icon: LuStar, color: 'text-amber-400', href: '/achievement' },
                { label: 'Days Active', value: `${quickStats.daysActive || 0} ${quickStats.daysActive === 1 ? 'day' : 'days'}`, icon: LuCalendar, color: 'text-cyan-400' },
                { label: 'XP This Week', value: `+${quickStats.xpThisWeek || 0}`, icon: LuZap, color: 'text-violet-400' },
              ].map(item => {
                const Icon = item.icon;
                const inner = (
                  <div className={`flex items-center justify-between p-1.5 -mx-1.5 rounded-xl transition-all ${item.href ? 'hover:bg-[var(--color-background)]/60 cursor-pointer group' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className={`${item.color} ${item.href ? 'group-hover:scale-110 transition-transform' : ''}`} />
                      <span className={`text-xs text-[var(--color-muted)] ${item.href ? 'group-hover:text-[var(--color-text)]' : ''}`}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold font-mono text-[var(--color-text)]">{item.value}</span>
                      {item.href && <span className="text-xs text-[var(--color-muted)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
                    </div>
                  </div>
                );

                return item.href ? (
                  <Link key={item.label} href={item.href} className="block no-underline">
                    {inner}
                  </Link>
                ) : (
                  <div key={item.label}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
