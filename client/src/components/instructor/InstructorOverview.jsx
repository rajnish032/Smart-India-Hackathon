"use client";

import React, { useState } from 'react';
import {
  LuUsers, LuBookOpen, LuFileText, LuTrendingUp, LuStar, LuCircleCheck,
  LuPlus, LuTriangleAlert, LuInfo, LuBell, LuZap, LuActivity,
  LuGraduationCap, LuChartBar, LuClock, LuArrowUp, LuArrowRight,
} from 'react-icons/lu';

const KPI_CARDS = [
  { key: 'totalStudents', label: 'Total Students', icon: LuUsers, color: 'from-violet-500/20 to-violet-600/10', iconColor: 'text-violet-500', border: 'border-violet-500/20', suffix: '', fallback: 142 },
  { key: 'activeStudents', label: 'Active Students', icon: LuActivity, color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-500', border: 'border-emerald-500/20', suffix: '', fallback: 118 },
  { key: 'totalCourses', label: 'Total Courses', icon: LuBookOpen, color: 'from-cyan-500/20 to-cyan-600/10', iconColor: 'text-cyan-500', border: 'border-cyan-500/20', suffix: '', fallback: 3 },
  { key: 'publishedLessons', label: 'Published Lessons', icon: LuFileText, color: 'from-amber-500/20 to-amber-600/10', iconColor: 'text-amber-500', border: 'border-amber-500/20', suffix: '', fallback: 62 },
  { key: 'avgScore', label: 'Average Score', icon: LuStar, color: 'from-pink-500/20 to-pink-600/10', iconColor: 'text-pink-500', border: 'border-pink-500/20', suffix: '%', fallback: 86 },
  { key: 'completionRate', label: 'Completion Rate', icon: LuCircleCheck, color: 'from-teal-500/20 to-teal-600/10', iconColor: 'text-teal-500', border: 'border-teal-500/20', suffix: '%', fallback: 67 },
];

const ACTIVITY_ICONS = {
  submission: LuFileText,
  completion: LuCircleCheck,
  enrollment: LuUsers,
  atrisk: LuTriangleAlert,
  quiz: LuStar,
};

const ACTIVITY_COLORS = {
  submission: 'text-violet-400 bg-violet-500/10',
  completion: 'text-emerald-400 bg-emerald-500/10',
  enrollment: 'text-cyan-400 bg-cyan-500/10',
  atrisk: 'text-rose-400 bg-rose-500/10',
  quiz: 'text-amber-400 bg-amber-500/10',
};

const ALERT_STYLES = {
  warning: { bg: 'bg-amber-500/10 border-amber-500/30', icon: LuTriangleAlert, iconColor: 'text-amber-400', btnColor: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300' },
  info: { bg: 'bg-cyan-500/10 border-cyan-500/30', icon: LuInfo, iconColor: 'text-cyan-400', btnColor: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300' },
  success: { bg: 'bg-emerald-500/10 border-emerald-500/30', icon: LuCircleCheck, iconColor: 'text-emerald-400', btnColor: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300' },
};

const QUICK_ACTIONS = [
  { label: 'New Course', icon: LuBookOpen, tab: 'courses', color: 'from-violet-600 to-violet-700', shadow: 'shadow-violet-500/20' },
  { label: 'New Lesson', icon: LuFileText, tab: 'lesson-builder', color: 'from-cyan-600 to-cyan-700', shadow: 'shadow-cyan-500/20' },
  { label: 'New Quiz', icon: LuStar, tab: 'quiz-builder', color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
  { label: 'New Challenge', icon: LuZap, tab: 'challenge-builder', color: 'from-pink-600 to-pink-700', shadow: 'shadow-pink-500/20' },
];

// Map alert action labels to handler keys
const ALERT_ACTION_HANDLERS = {
  'Grade Now': 'grading',
  'View Students': 'students',
  'Review': 'courseBuilder',
};

export default function InstructorOverview({ user, portalData, onTabChange, onOpenBuilder, onOpenLesson, onOpenQuiz, onOpenChallenge, onOpenStudents }) {
  const data = portalData || {};
  const recentActivity = data.recentActivity || [];
  const alerts = data.alerts || [];

  // Helper to extract course count safely
  const getCourseCount = () => {
    if (typeof data.totalCourses === 'number') return data.totalCourses;
    if (typeof data.assignedCourses === 'number') return data.assignedCourses;
    if (Array.isArray(data.assignedCourses)) return data.assignedCourses.length;
    if (Array.isArray(data.courses)) return data.courses.length;
    return 3;
  };

  const courseCount = getCourseCount();
  const totalStudents = data.totalStudents ?? 142;
  const avgScore = typeof data.avgScore === 'number' ? Math.round(data.avgScore) : (data.avgScore ?? 86);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-violet-500/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20">
              <LuGraduationCap size={13} />
              <span>Instructor Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[var(--color-text)]">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">{user?.name?.split(' ')[0] || 'Dr. Eleanor'}</span>
            </h1>
            <p className="text-sm text-[var(--color-muted)] max-w-lg leading-relaxed">
              Manage your quantum curriculum, monitor student performance, and publish engaging content — all from one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center p-4 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] min-w-[90px]">
              <div className="text-2xl font-bold font-heading text-violet-400">{totalStudents}</div>
              <div className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider mt-0.5">Students</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] min-w-[90px]">
              <div className="text-2xl font-bold font-heading text-emerald-400">{courseCount}</div>
              <div className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider mt-0.5">Courses</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] min-w-[90px]">
              <div className="text-2xl font-bold font-heading text-cyan-400">{avgScore}%</div>
              <div className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider mt-0.5">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          let value = data[card.key];
          if (card.key === 'totalCourses') {
            value = courseCount;
          } else if (value === undefined || value === null) {
            value = card.fallback;
          } else if (Array.isArray(value)) {
            value = value.length;
          } else if (typeof value === 'number') {
            value = Number.isInteger(value) ? value : Math.round(value);
          }

          return (
            <div key={card.key} className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border ${card.border} space-y-3 group hover:scale-[1.02] transition-transform duration-200`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-muted)]">{card.label}</span>
                <Icon size={16} className={card.iconColor} />
              </div>
              <div className="text-2xl font-heading font-bold text-[var(--color-text)]">
                {value}{card.suffix}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <LuArrowUp size={10} />
                <span>+5.2% this week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions + Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
            <LuZap size={16} className="text-violet-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              const handleQuickAction = () => {
                if (action.label === 'New Course') {
                  onTabChange && onTabChange('courses');
                } else if (action.label === 'New Lesson' && onOpenLesson) {
                  onOpenLesson({});
                } else if (action.label === 'New Quiz' && onOpenQuiz) {
                  onOpenQuiz({});
                } else if (action.label === 'New Challenge' && onOpenChallenge) {
                  onOpenChallenge({});
                } else {
                  onTabChange && onTabChange(action.tab);
                }
              };
              return (
                <button
                  key={action.label}
                  onClick={handleQuickAction}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg ${action.shadow} hover:opacity-90 hover:scale-[1.03] transition-all duration-200 text-left space-y-2 cursor-pointer`}
                >
                  <Icon size={18} />
                  <div className="text-xs font-bold">{action.label}</div>
                </button>
              );
            })}
          </div>

          {/* Stats mini */}
          <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
            <div className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">This Month</div>
            {[
              { label: 'New enrollments', value: '+28', color: 'text-emerald-400' },
              { label: 'Lessons published', value: '8', color: 'text-violet-400' },
              { label: 'Submissions graded', value: '34', color: 'text-cyan-400' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted)]">{stat.label}</span>
                <span className={`text-xs font-bold font-mono ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
            <LuBell size={16} className="text-amber-400" />
            Alerts & Notifications
          </h3>
          <div className="space-y-3">
            {(alerts.length > 0 ? alerts : [
              { id: 'al1', type: 'warning', title: '2 At-Risk Students', message: 'Rohan Kumar and Anjali Rao have low activity and scores. Consider reaching out.', action: 'View Students' },
              { id: 'al2', type: 'info', title: '3 Pending Submissions', message: 'You have 3 submissions awaiting grading.', action: 'Grade Now' },
              { id: 'al3', type: 'success', title: 'Module Ready to Publish', message: 'Phase Estimation module is drafted and ready.', action: 'Review' },
            ]).map((alert) => {
              const style = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
              const AlertIcon = style.icon;
              return (
                <div key={alert.id} className={`p-4 rounded-2xl border ${style.bg} space-y-2`}>
                  <div className="flex items-start gap-2">
                    <AlertIcon size={15} className={`${style.iconColor} mt-0.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[var(--color-text)]">{alert.title}</div>
                      <div className="text-[11px] text-[var(--color-muted)] mt-0.5 leading-relaxed">{alert.message}</div>
                    </div>
                  </div>
                  {alert.action && (
                    <button
                      onClick={() => {
                        const action = alert.action;
                        if (action === 'Grade Now' && onOpenStudents) {
                          onOpenStudents({ focusGrading: true });
                        } else if (action === 'View Students' && onOpenStudents) {
                          onOpenStudents({});
                        } else if (action === 'Review' && onTabChange) {
                          onTabChange('course-builder');
                        } else if (onTabChange) {
                          onTabChange('students');
                        }
                      }}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${style.btnColor} transition-colors cursor-pointer`}
                    >
                      {alert.action} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
            <LuActivity size={16} className="text-cyan-400" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {(recentActivity.length > 0 ? recentActivity : [
              { id: 'ra1', type: 'submission', student: 'Arjun Sharma', action: "submitted Grover's Oracle challenge", time: '2h ago' },
              { id: 'ra2', type: 'completion', student: 'Vikram Singh', action: 'completed the course with 94% avg', time: '2d ago' },
              { id: 'ra3', type: 'enrollment', student: 'Karan Malhotra', action: 'enrolled in Advanced Algorithms', time: '3d ago' },
              { id: 'ra4', type: 'atrisk', student: 'Anjali Rao', action: 'has been inactive for 7 days', time: '7d ago' },
              { id: 'ra5', type: 'quiz', student: 'Sneha Patel', action: 'scored 88% on Module 3 Quiz', time: '1d ago' },
            ]).map((event) => {
              const Icon = ACTIVITY_ICONS[event.type] || LuActivity;
              const colorClass = ACTIVITY_COLORS[event.type] || 'text-violet-400 bg-violet-500/10';
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--color-surface)] transition-colors">
                  <div className={`p-1.5 rounded-lg ${colorClass} shrink-0 mt-0.5`}>
                    <Icon size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[var(--color-text)]">
                      <span className="font-semibold">{event.student}</span>
                      {' '}<span className="text-[var(--color-muted)]">{event.action}</span>
                    </div>
                    <div className="text-[10px] text-[var(--color-muted)] font-mono mt-0.5">{event.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion Bar Row */}
      <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
            <LuChartBar size={16} className="text-violet-400" />
            Course Performance Overview
          </h3>
          <button
            onClick={() => onTabChange && onTabChange('analytics')}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            Full Analytics <LuArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Quantum Fundamentals', completion: 68, students: 98, color: 'bg-violet-500' },
            { label: 'Advanced Algorithms', completion: 42, students: 44, color: 'bg-cyan-500' },
            { label: 'Quantum ML', completion: 0, students: 0, color: 'bg-amber-500' },
          ].map(course => (
            <div key={course.label} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text)] font-medium truncate pr-2">{course.label}</span>
                <span className="text-[var(--color-muted)] font-mono shrink-0">{course.students} students</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-background)]">
                <div
                  className={`h-2 rounded-full ${course.color} transition-all duration-700`}
                  style={{ width: `${course.completion}%` }}
                />
              </div>
              <div className="text-right text-[10px] font-mono text-[var(--color-muted)]">{course.completion}% completion</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
