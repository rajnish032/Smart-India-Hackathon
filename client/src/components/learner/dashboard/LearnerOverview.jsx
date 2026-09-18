"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LuAtom, LuCpu, LuSparkles, LuFlame, LuZap, LuTrophy, LuMedal,
  LuTarget, LuBrain, LuFlaskConical, LuPlay, LuCheck, LuClock,
  LuBookOpen, LuLayers, LuTrendingUp, LuArrowRight, LuChevronRight,
  LuCalendar, LuShield, LuActivity, LuTerminal, LuExternalLink,
  LuRefreshCw, LuBot, LuCircleCheck, LuChevronDown
} from 'react-icons/lu';
import toast from 'react-hot-toast';

// ─── User Quantum Rank Titles ────────────────────────────────────────────────
const getRankTitle = (level = 1) => {
  if (level >= 10) return 'Quantum Grandmaster';
  if (level >= 7) return 'Qubit Architect';
  if (level >= 5) return 'Quantum Researcher';
  if (level >= 3) return 'Circuit Specialist';
  return 'Quantum Explorer';
};

// ─── 1. Refined Modern Welcome Hero ───────────────────────────────────────────
function QuantumHero({ user = {}, currentCourse = {}, quickStats = {} }) {
  const xp = user.xp || 0;
  const nextXp = user.nextLevelXp || 1000;
  const level = user.level || 1;
  const streak = user.streak || 0;
  const rankTitle = getRankTitle(level);
  const xpPct = Math.min(100, Math.max(0, Math.round((xp / nextXp) * 100)));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.name ? user.name.split(' ')[0] : 'Learner';

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-sm transition-all">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Avatar + User Info */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
          
          {/* Avatar with Level Badge */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full rounded-[14px] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-primary)] font-black text-2xl font-mono">
                {firstName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-[10px] font-black font-mono shadow-sm">
              L{level}
            </div>
          </div>

          {/* Details & XP Bar */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/15 px-2.5 py-0.5 rounded-md border border-cyan-500/20 flex items-center gap-1.5">
                <LuAtom size={13} className="text-cyan-500" />
                {rankTitle}
              </span>
              
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono text-rose-500 bg-rose-500/10 dark:bg-rose-500/15 px-2.5 py-0.5 rounded-md border border-rose-500/20">
                  <LuFlame size={13} className="text-rose-500 animate-pulse" />
                  {streak}d streak
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-text)]">
                {greeting}, <span className="text-[var(--color-primary)]">{firstName}</span> 👋
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-0.5">
                {currentCourse?.title && currentCourse.title !== 'No active course' ? (
                  <>Continue mastering <span className="font-semibold text-[var(--color-text)]">{currentCourse.title}</span></>
                ) : (
                  'Ready to explore quantum computing algorithms and simulations?'
                )}
              </p>
            </div>

            {/* XP Progress Indicator */}
            <div className="pt-1 max-w-md space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[var(--color-text)] font-semibold flex items-center gap-1">
                  <LuZap size={12} className="text-amber-500" /> {xp.toLocaleString()} <span className="text-[var(--color-muted)] font-normal">/ {nextXp.toLocaleString()} XP</span>
                </span>
                <span className="text-xs font-bold text-[var(--color-primary)] font-mono">{xpPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-400 transition-all duration-700"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Hub */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between sm:justify-start gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-[var(--color-border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Link
              href="/playground"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              <LuCpu size={15} /> Circuit Sandbox
            </Link>
            <Link
              href="/learn"
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-border)]/50 text-[var(--color-text)] text-xs font-semibold font-mono transition-all flex items-center gap-1.5"
            >
              <LuBookOpen size={14} /> Courses
            </Link>
          </div>

          <div className="text-[11px] font-mono text-[var(--color-muted)] flex items-center gap-1.5">
            <span>Global Rank:</span>
            <span className="font-bold text-[var(--color-text)]">#{quickStats.rank || 1}</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-500 font-semibold">{quickStats.badges || 0} Badges</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 2. Clean Modern Stats Grid ───────────────────────────────────────────────
function QuantumMetricsGrid({ stats = {}, quickStats = {} }) {
  const cards = [
    {
      title: 'Active Courses',
      value: stats.courses?.enrolled || 0,
      sub: `${stats.courses?.completed || 0} completed`,
      icon: LuBookOpen,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      pillText: stats.courses?.enrolled ? `${Math.round((stats.courses.completed / stats.courses.enrolled) * 100)}% done` : 'Enrolled',
      pillColor: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Lessons Completed',
      value: stats.lessons?.completed || 0,
      sub: `of ${stats.lessons?.total || 0} total units`,
      icon: LuLayers,
      iconColor: 'text-indigo-500',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      pillText: `${stats.lessons?.total ? Math.round((stats.lessons.completed / stats.lessons.total) * 100) : 0}% progress`,
      pillColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Circuits Simulated',
      value: stats.simulations?.total || 0,
      sub: `${stats.simulations?.thisWeek || 0} this week`,
      icon: LuFlaskConical,
      iconColor: 'text-cyan-500',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      pillText: 'Aer Simulator',
      pillColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Badges & Honors',
      value: quickStats.badges || 0,
      sub: `Rank #${quickStats.rank || '—'} Global`,
      icon: LuTrophy,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      pillText: 'Top 10%',
      pillColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm hover:border-[var(--color-primary)]/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.iconBg} ${c.iconColor} group-hover:scale-105 transition-transform`}>
                <Icon size={20} />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${c.pillColor}`}>
                {c.pillText}
              </span>
            </div>

            <div className="mt-4 space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[var(--color-text)]">
                {typeof c.value === 'number' ? c.value.toLocaleString() : c.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[var(--color-text)]">{c.title}</div>
              <div className="text-[11px] text-[var(--color-muted)] font-mono">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}



// ─── 3. Dynamic "Continue Learning" Quantum Station ───────────────────────────
function ContinueLearningStation({ currentCourse = {} }) {
  const hasCourse = currentCourse?.title && currentCourse.title !== 'No active course';

  if (!hasCourse) {
    return (
      <div className="rounded-3xl border border-dashed border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-[var(--color-surface)] to-cyan-500/5 p-6 sm:p-8 text-center transition-all hover:border-indigo-500/50">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <LuAtom size={28} className="animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">Begin Your Quantum Journey</h3>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Explore foundational quantum mechanics, Superposition, Entanglement, and Quantum Logic Gates with interactive simulations.
            </p>
          </div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            Explore Courses Catalog <LuArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const progress = currentCourse.progress || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <LuPlay size={24} className="ml-1" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                Active Pathway
              </span>
              {currentCourse.difficulty && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {currentCourse.difficulty}
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-[var(--color-text)] truncate">
              {currentCourse.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] flex-wrap">
              <span className="font-mono text-[11px] text-[var(--color-text)] font-medium">
                {currentCourse.module || 'Module 1'}
              </span>
              <LuChevronRight size={12} className="text-[var(--color-muted)]" />
              <span className="truncate">{currentCourse.lesson || 'Current Lesson'}</span>
            </div>

            {/* Progress line */}
            <div className="flex items-center gap-3 pt-1 max-w-lg">
              <div className="flex-1 h-2 bg-slate-800/20 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-[var(--color-text)]">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <Link
            href="/learn"
            className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold tracking-wide uppercase font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:gap-3"
          >
            Resume Lesson <LuArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── 4. Daily Quantum Protocol & Missions (Today's Goals) ──────────────────────
function DailyQuantumProtocol({ goals = [] }) {
  const [goalStates, setGoalStates] = useState(goals.map(g => !!g.done));
  const completedCount = goalStates.filter(Boolean).length;
  const total = goals.length || 1;
  const progressPct = Math.round((completedCount / total) * 100);

  const toggleGoal = (idx) => {
    setGoalStates(prev => {
      const updated = [...prev];
      const nextState = !updated[idx];
      updated[idx] = nextState;
      if (nextState) {
        toast.success(`Objective marked complete! +${goals[idx]?.xp || 50} XP`);
      }
      return updated;
    });
  };

  const getGoalIcon = (type) => {
    switch (type) {
      case 'simulation': return LuFlaskConical;
      case 'challenge': return LuTrophy;
      case 'quiz': return LuBrain;
      case 'circuit': return LuCpu;
      default: return LuBookOpen;
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <LuTarget size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)]">Daily Quantum Protocol</h3>
            <p className="text-xs text-[var(--color-muted)]">
              {completedCount} of {goals.length} objectives accomplished
            </p>
          </div>
        </div>

        {/* Completion Pill */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-sm font-mono font-black text-amber-400">{progressPct}%</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-amber-500/30 flex items-center justify-center relative">
            <svg className="w-8 h-8 rotate-[-90deg]">
              <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-slate-700/30" />
              <circle
                cx="16" cy="16" r="13"
                stroke="currentColor" strokeWidth="2.5" fill="none"
                strokeDasharray={`${2 * Math.PI * 13}`}
                strokeDashoffset={`${2 * Math.PI * 13 * (1 - progressPct / 100)}`}
                strokeLinecap="round"
                className="text-amber-400 transition-all duration-700"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Goal Check List */}
      <div className="space-y-2.5">
        {goals.map((g, idx) => {
          const isDone = goalStates[idx];
          const Icon = getGoalIcon(g.type);

          return (
            <div
              key={g.id || idx}
              onClick={() => toggleGoal(idx)}
              className={`group flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                isDone
                  ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400'
                  : 'bg-[var(--color-background)]/60 border-[var(--color-border)] hover:border-indigo-500/40 hover:bg-indigo-500/5'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-[var(--color-border)] group-hover:border-indigo-400'
                  }`}
                >
                  {isDone && <LuCheck size={14} className="stroke-[3]" />}
                </div>

                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon size={16} className={isDone ? 'text-emerald-400' : 'text-slate-400 group-hover:text-indigo-400'} />
                  <span className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-[var(--color-text)]'}`}>
                    {g.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  +{g.xp || 50} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {completedCount === goals.length && goals.length > 0 && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
          <LuSparkles size={16} /> All daily quantum protocols fulfilled! +150 Bonus XP awarded.
        </div>
      )}
    </div>
  );
}

// ─── 5. AI Quantum Tutor Spotlight ───────────────────────────────────────────
function AIQuantumCopilot({ rec = {} }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-[var(--color-surface)] to-indigo-500/10 p-6 space-y-4 shadow-lg shadow-cyan-500/5">
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <LuBot size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              AI Quantum Tutor
            </span>
            <h4 className="text-xs font-bold text-[var(--color-text)]">Adaptive Recommendation</h4>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          Personalized
        </span>
      </div>

      <div className="space-y-2 bg-[var(--color-background)]/80 p-4 rounded-2xl border border-[var(--color-border)]">
        <div className="text-xs font-bold text-[var(--color-text)]">{rec.title || 'Superposition & Hadamard Transform'}</div>
        <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
          {rec.reason || 'Based on your recent simulation history, master single-qubit rotations and statevector visualization next.'}
        </p>
        
        <div className="flex items-center gap-2 pt-2 flex-wrap text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-cyan-500/20">
            {rec.module || 'Core Principles'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {rec.difficulty || 'Intermediate'}
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <LuClock size={11} /> {rec.duration || '12 min'}
          </span>
        </div>
      </div>

      <Link
        href="/learn"
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold font-mono tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
      >
        <LuZap size={14} /> Start Recommended Unit
      </Link>
    </div>
  );
}

// ─── 6. Quantum Circuit Sandbox Quick-Launcher ────────────────────────────────
function CircuitLabTeaser() {
  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[#0c0f2b] to-[#141238] p-6 text-white space-y-4 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <LuCpu size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Interactive Lab</h4>
            <p className="text-[11px] text-slate-400">Quantum Circuit Builder</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
          v2.0 Online
        </span>
      </div>

      {/* Mini Circuit Schematic Preview */}
      <div className="bg-[#080a1c] p-3 rounded-2xl border border-white/10 font-mono text-[11px] space-y-1.5 text-slate-300">
        <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-white/5 pb-1">
          <span>q[0]: |0⟩ ─[ H ]─●─[ M ]</span>
          <span className="text-cyan-400">Bell State |Φ+⟩</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>q[1]: |0⟩ ────┼─[ M ]</span>
          <span className="text-emerald-400">P(|00⟩)=50% P(|11⟩)=50%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/playground"
          className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
        >
          <LuPlay size={13} /> Open Canvas
        </Link>
        <Link
          href="/challenges"
          className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono text-center transition-all flex items-center justify-center gap-1.5 border border-white/10"
        >
          <LuTrophy size={13} className="text-amber-400" /> Challenges
        </Link>
      </div>
    </div>
  );
}

// ─── 7. Recent Quantum Telemetry & Activity Feed ──────────────────────────────
function QuantumActivityFeed({ activities = [] }) {
  const getActivityMeta = (type) => {
    switch (type) {
      case 'simulation':
        return { icon: LuFlaskConical, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' };
      case 'circuit':
        return { icon: LuCpu, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' };
      case 'course':
        return { icon: LuCircleCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      case 'ai':
        return { icon: LuBot, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20' };
      default:
        return { icon: LuActivity, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <LuActivity size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)]">Recent Telemetry & Activity</h3>
            <p className="text-xs text-[var(--color-muted)]">Live execution trace and course completions</p>
          </div>
        </div>
        <Link
          href="/progress"
          className="text-xs font-mono text-indigo-500 hover:text-indigo-400 flex items-center gap-1 font-semibold"
        >
          View Full Log <LuChevronRight size={13} />
        </Link>
      </div>

      {!activities.length ? (
        <div className="py-8 text-center text-slate-400 text-xs font-mono">
          No experiments recorded yet. Simulate your first circuit in the playground!
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border)]/50">
          {activities.slice(0, 5).map((act, i) => {
            const meta = getActivityMeta(act.type);
            const Icon = meta.icon;

            return (
              <div key={act.id || i} className="py-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[var(--color-text)] truncate group-hover:text-indigo-400 transition-colors">
                      {act.label}
                    </div>
                    {act.meta && (
                      <div className="text-[11px] text-[var(--color-muted)] font-mono">{act.meta}</div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[var(--color-muted)] flex-shrink-0">
                  {act.time || 'recently'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 8. Badges Shelf & Honors ────────────────────────────────────────────────
function QuantumBadgesShelf({ badgeList = [], total = 0 }) {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <LuMedal size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider font-mono">
              Badges & Honors
            </h4>
            <p className="text-[11px] text-[var(--color-muted)]">{total} Unlocked</p>
          </div>
        </div>
        <Link href="/achievement" className="text-xs text-amber-500 hover:underline font-semibold font-mono">
          All Badges
        </Link>
      </div>

      {!badgeList.length ? (
        <div className="py-6 text-center text-xs text-[var(--color-muted)]">
          Complete courses and circuit challenges to unlock rare badges!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {badgeList.slice(0, 4).map((b, i) => (
            <div
              key={i}
              className="p-3 rounded-2xl bg-[var(--color-background)]/70 border border-[var(--color-border)] flex items-center gap-2.5 hover:border-amber-500/40 transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{b.icon || '🏅'}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--color-text)] truncate">{b.title}</div>
                <div className="text-[10px] font-mono text-amber-400">+{b.xp || 50} XP</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 9. Quantum Quick Shortcuts Grid ──────────────────────────────────────────
function QuantumShortcuts() {
  const links = [
    { title: 'AI Copilot', desc: 'Ask quantum queries', href: '/ai-tutor', icon: LuBrain, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
    { title: 'Challenges', desc: 'Solve circuit puzzles', href: '/challenges', icon: LuTrophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Leaderboard', desc: 'View global rankings', href: '/achievement', icon: LuTrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { title: 'My Profile', desc: 'Manage credentials', href: '/profile', icon: LuShield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {links.map((l, i) => {
        const Icon = l.icon;
        return (
          <Link
            key={i}
            href={l.href}
            className={`p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-indigo-500/40 hover:shadow-md transition-all group flex flex-col gap-1.5`}
          >
            <div className={`w-8 h-8 rounded-xl ${l.bg} flex items-center justify-center ${l.color} group-hover:scale-110 transition-transform`}>
              <Icon size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--color-text)] group-hover:text-indigo-400 transition-colors">
                {l.title}
              </div>
              <div className="text-[10px] text-[var(--color-muted)]">{l.desc}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function LearnerOverview({ user, hubData }) {
  const mergedUser = {
    name: hubData?.user?.name || user?.name || 'Learner',
    level: hubData?.level || 1,
    xp: hubData?.xp || 0,
    nextLevelXp: hubData?.nextLevelXp || 1000,
    streak: hubData?.streak || 0,
    longestStreak: hubData?.longestStreak || 0,
  };

  const currentCourse = hubData?.currentCourse || {
    title: 'No active course',
    module: '—',
    lesson: '—',
    progress: 0,
  };

  const todaysGoals = hubData?.todayGoals || [
    { id: 1, label: 'Run 1 Quantum Circuit in Playground', type: 'simulation', done: false, xp: 50 },
    { id: 2, label: 'Complete Daily Theory Unit', type: 'course', done: false, xp: 75 },
    { id: 3, label: 'Ask AI Copilot 1 Quantum question', type: 'quiz', done: false, xp: 25 },
  ];

  const stats = hubData?.stats || {
    courses: { enrolled: 0, completed: 0 },
    lessons: { completed: 0, total: 0 },
    simulations: { total: 0, thisWeek: 0 },
  };

  const recentActivity = hubData?.recentActivity || [];
  const recommendation = hubData?.recommendation || {
    title: 'Introduction to Superposition & Hadamard',
    reason: 'Master how qubits exist in multiple basis states simultaneously before advancing to entanglement.',
    module: 'Quantum Fundamentals',
    difficulty: 'Beginner',
    duration: '8 min',
  };

  const quickStats = hubData?.quickStats || {
    rank: 14,
    badges: 3,
    badgeList: [
      { title: 'Superposition Pioneer', icon: '🌌', xp: 100 },
      { title: 'First Qubit Run', icon: '⚛️', xp: 50 },
      { title: 'Entanglement Master', icon: '🔗', xp: 150 },
    ],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Futuristic Hero Bento Header */}
      <QuantumHero
        user={mergedUser}
        currentCourse={currentCourse}
        quickStats={quickStats}
      />

      {/* 2. Quantum Metrics Telemetry Grid */}
      <QuantumMetricsGrid stats={stats} quickStats={quickStats} />

      {/* 3. Continue Learning Quantum Station */}
      <ContinueLearningStation currentCourse={currentCourse} />

      {/* 4. Bento Grid: Protocol, AI Copilot, Labs & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <DailyQuantumProtocol goals={todaysGoals} />
          <QuantumActivityFeed activities={recentActivity} />
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          <AIQuantumCopilot rec={recommendation} />
          <CircuitLabTeaser />
          <QuantumBadgesShelf badgeList={quickStats.badgeList} total={quickStats.badges} />
          <QuantumShortcuts />
        </div>

      </div>
    </div>
  );
}
