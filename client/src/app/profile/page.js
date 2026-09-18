"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { LearnerSidebar } from '../../components/sidebar';
import DashboardNavbar from '../../components/navbar/DashboardNavbar';
import { useAuthStore } from '../../store/useAuthStore';
import { apiFetch } from '../../services/api';
import {
  LuUser, LuMail, LuCalendar, LuPencil, LuSave, LuX,
  LuTrophy, LuBookOpen, LuFlame, LuZap, LuTarget,
  LuClock, LuActivity, LuGraduationCap, LuCheck,
  LuShield, LuSparkles, LuCircleCheck, LuAward,
  LuCompass, LuDownload, LuPhone, LuGithub, LuLinkedin,
  LuExternalLink, LuLoader,
} from 'react-icons/lu';

/**
 * Generate and download a verified Certificate of Completion document
 */
function downloadCertificate(cert, learnerName) {
  const certId = `QC-${Math.abs((cert.title || '').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).toUpperCase()}`;
  const certHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate of Completion - ${cert.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #090d16;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px;
    }
    .cert-card {
      width: 100%;
      max-width: 850px;
      padding: 60px 50px;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%);
      border: 2px solid #6366f1;
      border-radius: 28px;
      box-shadow: 0 25px 60px -15px rgba(99, 102, 241, 0.35);
      text-align: center;
      position: relative;
    }
    .badge-icon { font-size: 52px; margin-bottom: 12px; }
    .org-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #a5b4fc;
      margin-bottom: 6px;
    }
    .cert-type {
      font-size: 13px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 35px;
    }
    .certify-text { font-size: 15px; color: #cbd5e1; margin-bottom: 14px; }
    .recipient-name {
      font-size: 38px;
      font-weight: 800;
      color: #ffffff;
      padding-bottom: 10px;
      border-bottom: 2px solid #6366f1;
      display: inline-block;
      margin-bottom: 25px;
    }
    .reason-text { font-size: 14px; color: #94a3b8; margin-bottom: 10px; }
    .course-title {
      font-size: 26px;
      font-weight: 700;
      color: #38bdf8;
      margin-bottom: 40px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      padding-top: 25px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }
    .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 4px; }
    .meta-value { font-size: 13px; font-weight: 600; color: #e2e8f0; font-family: monospace; }
    .footer-seal {
      margin-top: 30px;
      font-size: 11px;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    @media print {
      body { background: white; color: black; padding: 0; }
      .cert-card { box-shadow: none; border: 2px solid #333; }
    }
  </style>
</head>
<body>
  <div class="cert-card">
    <div class="badge-icon">🎓</div>
    <div class="org-title">Quantum Learning Academy</div>
    <div class="cert-type">Verified Certificate of Quantum Proficiency</div>
    <div class="certify-text">This certifies that</div>
    <div class="recipient-name">${learnerName || 'Quantum Explorer'}</div>
    <div class="reason-text">has successfully completed all modules, laboratories, and curriculum requirements for</div>
    <div class="course-title">${cert.title}</div>
    <div class="meta-grid">
      <div>
        <div class="meta-label">Completion Date</div>
        <div class="meta-value">${cert.date || 'Recent'}</div>
      </div>
      <div>
        <div class="meta-label">Credential ID</div>
        <div class="meta-value">${certId}</div>
      </div>
      <div>
        <div class="meta-label">Verification Status</div>
        <div class="meta-value" style="color: #34d399;">✓ Cryptographically Verified</div>
      </div>
    </div>
    <div class="footer-seal">National Quantum Mission · Ministry of Electronics & IT · Educational Initiative</div>
  </div>
</body>
</html>`;

  const blob = new Blob([certHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(cert.title || 'Course').replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Dynamic 52-Week Activity Heatmap Calendar with true Sunday-to-Saturday grid layout,
 * time-spent progressive color darkening, today highlighter, and interactive tooltips.
 */
function HeatmapCalendar({ heatmapData = [], summary = {} }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Group 364 days into 52 columns of 7 days (Sunday = Row 0, Saturday = Row 6)
  const { weeks, monthLabels } = useMemo(() => {
    const totalDays = 52 * 7;
    const days = [...(heatmapData || [])];

    while (days.length < totalDays) {
      days.unshift({ date: '', count: 0, minutes: 0, hours: 0, value: 0, isToday: false, isFuture: false });
    }

    const calculatedWeeks = [];
    const labels = [];

    for (let w = 0; w < 52; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const item = days[w * 7 + d] || {
          date: '',
          count: 0,
          minutes: 0,
          hours: 0,
          value: 0,
          isToday: false,
          isFuture: false,
          dayOfWeek: d,
        };
        week.push(item);
      }
      calculatedWeeks.push(week);
    }

    // Place month labels directly at the exact week column where each month begins (day 1)
    let firstMonthCol = -1;
    for (let w = 0; w < 52; w++) {
      for (let d = 0; d < 7; d++) {
        const item = calculatedWeeks[w][d];
        if (item.date && !item.isFuture) {
          const dObj = new Date(item.date + 'T00:00:00');
          if (dObj.getDate() === 1) {
            firstMonthCol = w;
            break;
          }
        }
      }
      if (firstMonthCol !== -1) break;
    }

    // If the 52-week grid has at least 3 weeks of the initial month before the next month starts, label week 0
    if (firstMonthCol >= 3 && calculatedWeeks[0][0]?.date) {
      const dObj = new Date(calculatedWeeks[0][0].date + 'T00:00:00');
      labels.push({ col: 0, label: MONTH_NAMES[dObj.getMonth()] });
    }

    // Place every subsequent month at the exact column containing day 1 of that month
    for (let w = 0; w < 52; w++) {
      for (let d = 0; d < 7; d++) {
        const item = calculatedWeeks[w][d];
        if (item.date && !item.isFuture) {
          const dObj = new Date(item.date + 'T00:00:00');
          if (dObj.getDate() === 1) {
            labels.push({ col: w, label: MONTH_NAMES[dObj.getMonth()] });
            break;
          }
        }
      }
    }

    return { weeks: calculatedWeeks, monthLabels: labels };
  }, [heatmapData]);

  // Initial theme-aligned colorMap (restored exactly as requested)
  const colorMap = [
    'bg-[var(--color-border)]/20 hover:bg-[var(--color-border)]/40',
    'bg-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/35',
    'bg-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/65',
    'bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)]/90',
    'bg-[var(--color-primary)] hover:brightness-110 shadow-sm shadow-[var(--color-primary)]/40',
  ];

  return (
    <div className="space-y-4">
      {/* Live Today Learning Banner */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/10 via-[var(--color-primary)]/5 to-transparent border border-[var(--color-primary)]/20 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-pulse shadow-sm shadow-[var(--color-primary)]" />
          <span className="font-semibold text-[var(--color-text)]">Today's Learning:</span>
          <span className="text-[var(--color-primary)] font-bold">
            {summary.todayMinutes > 0 ? (
              <>
                {summary.todayHours >= 1 ? `${summary.todayHours}h ` : ''}
                {summary.todayMinutes % 60 > 0 || summary.todayHours < 1 ? `${summary.todayMinutes % 60}m ` : ''}
                spent
              </>
            ) : (
              '0m logged today'
            )}
          </span>
          <span className="text-[var(--color-muted)]">
            ({summary.todayActivities || 0} activities completed)
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
          <span>Heatmap intensity scales with daily study time</span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-3 pt-1">
        <div className="flex items-start gap-2.5 min-w-max">
          {/* Day of week labels column (Sun through Sat fully represented, Mon/Wed/Fri highlighted) */}
          <div className="flex flex-col flex-shrink-0 select-none">
            {/* Top spacer precisely matching the month labels header height (h-5 + mb-1.5) */}
            <div className="h-5 mb-1.5" />
            <div className="flex flex-col gap-1 text-[9px] font-mono w-7 text-right">
              {[
                { key: 'Sun', label: 'Sun', highlight: false },
                { key: 'Mon', label: 'Mon', highlight: true },
                { key: 'Tue', label: 'Tue', highlight: false },
                { key: 'Wed', label: 'Wed', highlight: true },
                { key: 'Thu', label: 'Thu', highlight: false },
                { key: 'Fri', label: 'Fri', highlight: true },
                { key: 'Sat', label: 'Sat', highlight: false },
              ].map((d) => (
                <span
                  key={d.key}
                  className={`h-3.5 leading-[14px] flex items-center justify-end pr-1 text-[9px] transition-colors ${
                    d.highlight
                      ? 'font-bold text-[var(--color-text)]'
                      : 'font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>

          {/* Heatmap Grid with Month Header directly above the columns */}
          <div className="flex flex-col flex-1 min-w-max" style={{ width: `${52 * 18 - 4}px` }}>
            {/* Month labels aligned with column width (14px) + gap (4px) = 18px per week */}
            <div className="h-5 mb-1.5 relative text-[10px] font-mono text-[var(--color-muted)] select-none w-full">
              {monthLabels.map((item, i) => (
                <span
                  key={i}
                  style={{ left: `${item.col * 18}px` }}
                  className="absolute top-0 text-[10px] text-[var(--color-muted)] font-semibold whitespace-nowrap hover:text-[var(--color-text)] transition-colors"
                >
                  {item.label}
                </span>
              ))}
            </div>

            {/* 52 Week Columns */}
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1 w-3.5">
                  {week.map((day, di) => {
                    const hasActivity = day.count > 0;
                    const formattedDate = day.date
                      ? new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'No date';

                    const isToday = !!day.isToday;
                    const isFuture = !!day.isFuture;

                    return (
                      <div
                        key={di}
                        onMouseEnter={(e) => {
                          if (isFuture) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            date: formattedDate,
                            count: day.count,
                            minutes: day.minutes || 0,
                            hours: day.hours || 0,
                            isToday,
                            details: day.details || [],
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 relative ${
                          isFuture
                            ? 'border border-dashed border-[var(--color-border)]/20 opacity-20 pointer-events-none bg-transparent'
                            : isToday
                            ? `${colorMap[day.value] || colorMap[0]} ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-[var(--color-surface)] shadow-md shadow-[var(--color-primary)]/40 scale-105 z-10 cursor-pointer`
                            : `${colorMap[day.value] || colorMap[0]} cursor-pointer ${
                                hasActivity ? 'ring-1 ring-white/10' : ''
                              }`
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-2 rounded-xl bg-[#0d1117]/95 backdrop-blur-md text-white text-xs font-mono shadow-2xl border border-[var(--color-border)] whitespace-nowrap space-y-1"
            style={{ left: `${hoveredDay.x}px`, top: `${hoveredDay.y}px` }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-white flex items-center gap-1.5">
                {hoveredDay.isToday && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse inline-block" />
                )}
                {hoveredDay.isToday ? 'Today' : hoveredDay.date.split(',')[0]}
              </span>
              <span className="text-[10px] text-slate-400">{hoveredDay.date}</span>
            </div>
            <div className="text-cyan-300 font-bold flex items-center gap-1">
              <LuClock size={12} />
              {hoveredDay.minutes > 0 ? (
                <>
                  {hoveredDay.hours >= 1 ? `${hoveredDay.hours}h ` : ''}
                  {hoveredDay.minutes % 60 > 0 || hoveredDay.hours < 1 ? `${hoveredDay.minutes % 60}m ` : ''}
                  spent
                </>
              ) : (
                'No time logged'
              )}
            </div>
            <div className="text-[10px] text-slate-300">
              {hoveredDay.count === 0
                ? 'No quantum activity'
                : `${hoveredDay.count} ${hoveredDay.count === 1 ? 'activity completed' : 'activities completed'}`}
            </div>
            {hoveredDay.details?.length > 0 && (
              <div className="text-[9px] text-slate-400 border-t border-slate-700/50 pt-1 mt-1 max-w-[220px] truncate">
                {hoveredDay.details.join(' · ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Heatmap Footer: Summary badges & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[var(--color-border)]/40 text-xs">
        <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--color-muted)] font-mono">
          <span className="flex items-center gap-1.5 text-[var(--color-text)]">
            <LuClock size={13} className="text-cyan-400" />
            <strong className="text-cyan-400">{summary.totalHours || 0}h</strong> total study time
          </span>
          <span className="flex items-center gap-1.5 text-[var(--color-text)]">
            <LuActivity size={13} className="text-[var(--color-primary)]" />
            <strong className="text-[var(--color-primary)]">{summary.totalActivities || 0}</strong> actions
          </span>
          <span className="flex items-center gap-1.5">
            <LuCalendar size={13} className="text-emerald-400" />
            <strong>{summary.activeDays || 0}</strong> active days
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <LuFlame size={13} />
            <strong>{summary.currentStreak || 0}</strong> day streak
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <LuAward size={13} />
            <strong>{summary.longestStreak || 0}</strong> day record
          </span>
        </div>

        {/* Initial Theme-Matched Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted)] font-mono">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-[var(--color-border)]/20" title="0 mins" />
          <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]/20" title="1 - 25 mins" />
          <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]/50" title="26 - 55 mins" />
          <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]/80" title="56 - 110 mins" />
          <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]/30" title="111+ mins" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [bio, setBio] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    institution: '',
    bio: '',
    github: '',
    linkedin: '',
  });

  const fetchProfile = useCallback(() => {
    let tz = 'UTC';
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (e) {}
    apiFetch(`/learner/profile?tz=${encodeURIComponent(tz)}`)
      .then((res) => {
        if (res?.success && res.data) {
          setApiData(res.data);
          if (res.data.bio !== undefined) {
            setBio(res.data.bio);
          }
        }
      })
      .catch((err) => {
        console.warn('Profile fetch error:', err.message);
      });
  }, []);

  // Fetch on mount, on tab focus, on activity broadcast, and on cross-tab storage sync
  useEffect(() => {
    fetchProfile();
    const handleStorage = (e) => {
      if (e.key === 'learner_activity_sync') {
        fetchProfile();
      }
    };
    window.addEventListener('focus', fetchProfile);
    window.addEventListener('learner:activity-updated', fetchProfile);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('focus', fetchProfile);
      window.removeEventListener('learner:activity-updated', fetchProfile);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchProfile]);

  function triggerToast(message) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }

  // Dynamic stats calculated purely from real user data (starts at zero for new learners)
  const profileStats = apiData?.stats || {
    xp: 0,
    lessons: 0,
    streak: 0,
    challenges: 0,
    hours: 0,
    rank: 1,
  };

  const level = apiData?.level || Math.max(1, Math.floor((profileStats.xp || 0) / 500) + 1);
  const xpInCurrentLevel = (profileStats.xp || 0) % 500;
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));

  const profileData = {
    name: apiData?.user?.name || user?.name || 'Quantum Learner',
    email: apiData?.user?.email || user?.email || '',
    phone: apiData?.phone || apiData?.mobile || '',
    github: apiData?.github || apiData?.socialLinks?.github || '',
    linkedin: apiData?.linkedin || apiData?.socialLinks?.linkedin || '',
    joined: apiData?.joined || (user?.createdAt ? new Date(user.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Recently'),
    institution: apiData?.institution || '',
    level,
    xp: profileStats.xp || 0,
    streak: profileStats.streak || 0,
    rank: `#${profileStats.rank || 1}`,
  };

  const enrolledCourses = apiData?.enrolledCourses || [];
  const certificates = apiData?.certificates || [];

  const stats = [
    {
      label: 'XP Earned',
      value: (profileStats.xp ?? 0).toLocaleString(),
      icon: LuZap,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      sub: `${levelProgressPct}% to Level ${level + 1}`,
      href: '/achievement',
    },
    {
      label: 'Lessons Done',
      value: `${profileStats.lessons ?? 0}`,
      icon: LuBookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      sub: 'Verified completions',
      href: '/learn',
    },
    {
      label: 'Day Streak',
      value: `${profileStats.streak ?? 0} Days`,
      icon: LuFlame,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      sub: 'Consecutive active days',
      href: '/achievement',
    },
    {
      label: 'Challenges',
      value: `${profileStats.challenges ?? 0} Solved`,
      icon: LuTrophy,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      sub: 'Quantum puzzles',
      href: '/challenges',
    },
    {
      label: 'Hours Spent',
      value: (() => {
        const h = Number(profileStats.hours || 0);
        if (h <= 0) return '0h';
        if (h < 0.1) {
          const mins = Math.max(1, Math.round(h * 60));
          return `${mins}m (${h.toFixed(2)}h)`;
        }
        return `${h.toFixed(1)}h`;
      })(),
      icon: LuClock,
      color: 'text-violet-400',
      bg: 'bg-violet-400/10',
      sub: (profileStats.hours || 0) > 0
        ? `${Math.round((profileStats.hours || 0) * 60)} mins active study`
        : 'Live active study tracker',
    },
    {
      label: 'Global Rank',
      value: profileData.rank,
      icon: LuTarget,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      sub: 'View Leaderboard →',
      href: '/achievement#global-leaderboard',
    },
  ];

  function openEditModal() {
    setEditForm({
      name: profileData.name || '',
      phone: profileData.phone || '',
      institution: profileData.institution || '',
      bio: bio || '',
      github: profileData.github || '',
      linkedin: profileData.linkedin || '',
    });
    setIsEditModalOpen(true);
  }

  async function handleSaveProfile(e) {
    if (e) e.preventDefault();
    if (!editForm.name.trim()) {
      triggerToast('Full Name cannot be empty.');
      return;
    }
    setIsSaving(true);
    try {
      let tz = 'UTC';
      try {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      } catch (e) {}

      const res = await apiFetch(`/learner/profile?tz=${encodeURIComponent(tz)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          institution: editForm.institution.trim(),
          bio: editForm.bio.trim(),
          github: editForm.github.trim(),
          linkedin: editForm.linkedin.trim(),
        }),
      });

      if (res?.success && res.data) {
        setApiData(res.data);
        if (res.data.bio !== undefined) {
          setBio(res.data.bio || '');
        }
        if (editForm.name.trim() && useAuthStore.getState().user) {
          useAuthStore.setState((state) => ({
            user: { ...state.user, name: editForm.name.trim() },
          }));
        }
        triggerToast('Profile, mobile & social details updated successfully!');
        setIsEditModalOpen(false);
      } else {
        throw new Error(res?.error || 'Failed to update profile');
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-text)] flex">
        <LearnerSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        <div
          className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 ${
            isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          <DashboardNavbar
            title="Learner Profile"
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onMobileMenuClick={() => setIsMobileOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            {toastMessage && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[var(--color-surface)] to-cyan-500/15 border border-emerald-500/30 flex items-center justify-between gap-4 animate-slideDown shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <LuCircleCheck size={18} />
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {toastMessage}
                  </span>
                </div>
                <button
                  onClick={() => setToastMessage(null)}
                  className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  <LuX size={16} />
                </button>
              </div>
            )}

            {/* Profile Header Card */}
            <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/15 via-[var(--color-surface)] to-[var(--color-secondary)]/10 p-6 sm:p-8 shadow-lg">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[var(--color-primary)]/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[var(--color-secondary)]/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                    {profileData.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] font-mono font-bold text-amber-400 shadow-md">
                    Lvl {profileData.level}
                  </div>
                </div>

                {/* Main Learner Info */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--color-text)]">
                        {profileData.name}
                      </h1>
                      <span className="px-3 py-1 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] text-xs font-semibold border border-[var(--color-primary)]/30 inline-flex items-center gap-1.5">
                        <LuSparkles size={12} /> Level {profileData.level} Quantum Scholar
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20 inline-flex items-center gap-1">
                        <LuFlame size={12} /> {profileStats.streak} Day Streak
                      </span>
                    </div>

                    {/* Email, Mobile & Institution */}
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-[var(--color-muted)] mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <LuMail size={13} />
                        {profileData.email}
                      </span>
                      {profileData.phone && (
                        <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
                          <LuPhone size={13} />
                          {profileData.phone}
                        </span>
                      )}
                      {profileData.institution && (
                        <span className="flex items-center gap-1.5">
                          <LuGraduationCap size={13} />
                          {profileData.institution}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <LuCalendar size={13} />
                        Joined {profileData.joined}
                      </span>
                    </div>

                    {/* Dynamic Social Links (GitHub, LinkedIn) */}
                    <div className="flex items-center gap-2 flex-wrap pt-2">
                      {profileData.github && (
                        <a
                          href={profileData.github.startsWith('http') ? profileData.github : `https://github.com/${profileData.github.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-slate-400 hover:text-white text-xs font-mono transition-all shadow-sm group"
                        >
                          <LuGithub size={13} className="text-slate-300 group-hover:text-white" />
                          <span>{profileData.github.replace(/^https?:\/\/(www\.)?github\.com\/?/, '') || 'GitHub'}</span>
                          <LuExternalLink size={10} className="opacity-50" />
                        </a>
                      )}
                      {profileData.linkedin && (
                        <a
                          href={profileData.linkedin.startsWith('http') ? profileData.linkedin : `https://linkedin.com/in/${profileData.linkedin.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 hover:bg-blue-500/20 text-xs font-mono transition-all shadow-sm"
                        >
                          <LuLinkedin size={13} />
                          <span>LinkedIn</span>
                          <LuExternalLink size={10} className="opacity-50" />
                        </a>
                      )}
                      {!profileData.github && !profileData.linkedin && (
                        <button
                          type="button"
                          onClick={openEditModal}
                          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] font-mono transition-colors cursor-pointer"
                        >
                          <LuSparkles size={11} className="text-amber-400" />
                          <span>+ Add Social Links (GitHub, LinkedIn)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Level progress bar */}
                  <div className="space-y-1.5 max-w-md pt-1">
                    <div className="flex justify-between text-xs font-mono text-[var(--color-muted)]">
                      <span>Level {profileData.level}</span>
                      <span>
                        {xpInCurrentLevel} / 500 XP to Level {profileData.level + 1}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--color-border)]/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700 shadow-sm"
                        style={{ width: `${levelProgressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="flex items-start gap-2 group pt-1">
                    <p className="text-sm text-[var(--color-muted)] italic leading-relaxed flex-1">
                      {bio || 'No bio provided yet. Click "Edit Profile" to introduce yourself!'}
                    </p>
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[var(--color-border)]/30 text-[var(--color-muted)] transition-all flex-shrink-0 cursor-pointer"
                      title="Edit profile"
                    >
                      <LuPencil size={13} />
                    </button>
                  </div>
                </div>

                {/* Edit profile button */}
                <button
                  type="button"
                  onClick={openEditModal}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface)]/80 transition-all shadow-sm cursor-pointer"
                >
                  <LuPencil size={14} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* 6 Core Dynamic Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.map((s) => {
                const Icon = s.icon;
                const card = (
                  <div
                    className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2 text-center hover:-translate-y-1 hover:shadow-lg transition-all h-full flex flex-col justify-between group ${
                      s.href
                        ? 'cursor-pointer hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)]/90'
                        : 'hover:border-[var(--color-primary)]/30'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mx-auto transition-transform group-hover:scale-110`}>
                      <Icon size={18} className={s.color} />
                    </div>
                    <div>
                      <div className="text-xl font-bold font-mono text-[var(--color-text)]">{s.value}</div>
                      <div className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider leading-tight mt-0.5">
                        {s.label}
                      </div>
                    </div>
                    <div className={`text-[9px] font-mono truncate ${s.href ? 'text-[var(--color-primary)] font-semibold group-hover:underline' : 'text-[var(--color-muted)]'}`}>
                      {s.sub}
                    </div>
                  </div>
                );

                return s.href ? (
                  <Link key={s.label} href={s.href} className="block no-underline">
                    {card}
                  </Link>
                ) : (
                  <div key={s.label}>
                    {card}
                  </div>
                );
              })}
            </div>

            {/* Dynamic Activity Heatmap */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-base text-[var(--color-text)]">
                    Activity Heatmap
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                    Live Dynamic Tracking
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  Automatically records every lesson completed, course graduated, challenge solved, and quantum simulation run.
                </p>
              </div>

              <HeatmapCalendar
                heatmapData={apiData?.activityHeatmap || []}
                summary={
                  apiData?.heatmapSummary || {
                    totalActivities: 0,
                    activeDays: 0,
                    totalHours: 0,
                    todayHours: 0,
                    todayMinutes: 0,
                    todayActivities: 0,
                    currentStreak: profileStats.streak || 0,
                    longestStreak: 0,
                  }
                }
              />
            </div>

            {/* Enrolled Courses + Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enrolled Courses */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-base text-[var(--color-text)]">
                    Enrolled Courses
                  </h2>
                  <span className="text-xs font-mono text-[var(--color-muted)]">
                    {enrolledCourses.length} active
                  </span>
                </div>
                {enrolledCourses.length === 0 ? (
                  <div className="py-8 px-4 text-center rounded-xl bg-[var(--color-background)]/60 border border-dashed border-[var(--color-border)] space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto">
                      <LuBookOpen size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-[var(--color-text)]">No courses enrolled yet</div>
                      <p className="text-xs text-[var(--color-muted)] max-w-sm mx-auto">
                        Begin your quantum journey today by exploring our curriculum of foundational and advanced courses.
                      </p>
                    </div>
                    <a
                      href="/learn"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
                    >
                      <LuCompass size={14} /> Explore Courses
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrolledCourses.map((c) => (
                      <div key={c.id || c.title} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-[var(--color-text)] truncate pr-4">
                            {c.title}
                          </div>
                          <span className="text-xs font-mono text-[var(--color-muted)] flex-shrink-0 font-semibold">
                            {c.progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              c.progress === 100
                                ? 'bg-emerald-500'
                                : 'bg-gradient-to-r from-[var(--color-primary)] to-cyan-400'
                            }`}
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-[var(--color-muted)] font-mono">
                          <span>{c.modules} modules</span>
                          <span>{c.progress === 100 ? 'Completed 🎓' : 'In Progress'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certificates */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-base text-[var(--color-text)]">
                    Certificates Earned
                  </h2>
                  <span className="text-xs font-mono text-amber-400 font-semibold">
                    {certificates.length} verified
                  </span>
                </div>
                {certificates.length === 0 ? (
                  <div className="py-8 px-4 text-center rounded-xl bg-[var(--color-background)]/60 border border-dashed border-[var(--color-border)] space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                      <LuAward size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-[var(--color-text)]">No certificates earned yet</div>
                      <p className="text-xs text-[var(--color-muted)] max-w-sm mx-auto">
                        Complete 100% of any enrolled course curriculum to graduate and unlock your verified certificate.
                      </p>
                    </div>
                    <a
                      href="/learn"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] text-xs font-semibold hover:border-[var(--color-primary)] transition-all"
                    >
                      Start Learning
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <div
                        key={cert.title}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-[var(--color-surface)] to-[var(--color-surface)] border border-amber-500/20 hover:border-amber-500/40 hover:shadow-md transition-all"
                      >
                        <span className="text-3xl">{cert.icon || '🎓'}</span>
                        <div>
                          <div className="font-semibold text-sm text-[var(--color-text)]">
                            {cert.title}
                          </div>
                          <div className="text-xs text-[var(--color-muted)]">
                            Issued {cert.date || 'Recent'} · Quantum Learning Academy
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            downloadCertificate(cert, profileData.name);
                            triggerToast(`Downloaded verified certificate for ${cert.title}`);
                          }}
                          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 text-xs font-semibold transition-all flex-shrink-0 cursor-pointer"
                        >
                          <LuDownload size={13} /> Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-[var(--color-muted)] text-center py-2">
                  Complete 100% of any enrolled course curriculum to automatically earn and unlock verified credentials.
                </div>
              </div>
            </div>

            {/* Account & Security Information */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <LuShield size={16} className="text-emerald-400" />
                <h2 className="font-semibold text-base text-[var(--color-text)]">Account & Security</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Email', value: profileData.email, icon: LuMail },
                  { label: 'Mobile Phone', value: profileData.phone || 'Not configured', icon: LuPhone },
                  { label: 'Social & Git', value: [profileData.github && 'GitHub', profileData.linkedin && 'LinkedIn'].filter(Boolean).join(' · ') || 'Not connected', icon: LuGithub },
                  { label: 'Account Role', value: 'Learner (Student)', icon: LuUser },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]/50"
                    >
                      <Icon size={16} className="text-[var(--color-muted)] flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-mono">
                          {item.label}
                        </div>
                        <div className="text-sm text-[var(--color-text)] font-medium truncate">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>

        {/* Edit Profile Modal Dialog */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div
              className="w-full max-w-xl rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative top accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--color-primary)] via-cyan-400 to-[var(--color-secondary)]" />

              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center">
                    <LuPencil size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-heading text-[var(--color-text)]">
                      Edit Learner Profile
                    </h2>
                    <p className="text-xs text-[var(--color-muted)]">
                      Update your full name, contact number, bio, and social developer links.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/20 transition-colors cursor-pointer"
                >
                  <LuX size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider font-mono">
                      Full Name *
                    </label>
                    <div className="relative">
                      <LuUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="e.g. Anjali Singh"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Mobile No. */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider font-mono">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <LuPhone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:border-[var(--color-primary)] transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Institution */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider font-mono">
                    Institution / Affiliation
                  </label>
                  <div className="relative">
                    <LuGraduationCap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                      type="text"
                      value={editForm.institution}
                      onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                      placeholder="e.g. IIT Bombay, Stanford, or Independent Quantum Researcher"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider font-mono">
                      Bio / About Me
                    </label>
                    <span className="text-[10px] font-mono text-[var(--color-muted)]">
                      {editForm.bio.length} / 300 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell the quantum community about your research interests, learning goals, or background..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:border-[var(--color-primary)] resize-none transition-colors"
                  />
                </div>

                {/* Social Links (GitHub, LinkedIn) */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold text-[var(--color-text)] font-heading flex items-center gap-1.5">
                    <LuSparkles size={13} className="text-amber-400" />
                    Developer & Social Profiles
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* GitHub */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider font-mono">
                        GitHub Profile
                      </label>
                      <div className="relative">
                        <LuGithub size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                        <input
                          type="text"
                          value={editForm.github}
                          onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                          placeholder="username or github.com/..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:border-[var(--color-primary)] transition-colors font-mono"
                        />
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider font-mono">
                        LinkedIn Profile
                      </label>
                      <div className="relative">
                        <LuLinkedin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                        <input
                          type="text"
                          value={editForm.linkedin}
                          onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                          placeholder="username or linkedin.com/in/..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]/60 focus:outline-none focus:border-[var(--color-primary)] transition-colors font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]/50">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-xs font-semibold hover:opacity-95 shadow-md shadow-[var(--color-primary)]/30 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <LuLoader size={14} className="animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <LuSave size={14} />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
