"use client";

import React, { useState, useEffect } from 'react';
import {
  LuUsers, LuSearch, LuFilter, LuX, LuChevronRight, LuClock,
  LuActivity, LuBrain, LuStar, LuZap, LuTriangleAlert,
  LuCircleCheck, LuMessageSquare, LuArrowLeft, LuTrendingUp, LuTrendingDown,
  LuChartBar,
} from 'react-icons/lu';
import { apiFetch } from '../../services/api';

const STATUS_STYLES = {
  Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Completed: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'At Risk': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

const AVATAR_COLORS = [
  'from-violet-500 to-violet-600', 'from-cyan-500 to-cyan-600',
  'from-emerald-500 to-emerald-600', 'from-pink-500 to-pink-600',
  'from-amber-500 to-amber-600', 'from-teal-500 to-teal-600',
];

function MiniBar({ value, max = 100, color = 'bg-violet-500' }) {
  return (
    <div className="h-1.5 rounded-full bg-[var(--color-background)] w-24">
      <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

function StudentDetailPanel({ student, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg h-full overflow-y-auto bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl shadow-black/40 p-6 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[student.id?.charCodeAt(1) % AVATAR_COLORS.length || 0]} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
              {student.avatar}
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text)]">{student.name}</h3>
              <p className="text-xs text-[var(--color-muted)]">{student.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[student.status]}`}>{student.status}</span>
                <span className="text-[10px] text-[var(--color-muted)] font-mono">Last active: {student.lastActive}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-background)] text-[var(--color-muted)] cursor-pointer"><LuX size={18} /></button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Progress', value: `${student.progress}%`, color: 'text-violet-400' },
            { label: 'Quiz Avg', value: `${student.quizAvg}%`, color: 'text-amber-400' },
            { label: 'Time Spent', value: student.timeSpent, color: 'text-cyan-400' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-center">
              <div className={`text-lg font-bold font-heading ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-mono text-[var(--color-muted)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Module Progress */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
            <LuChartBar size={13} className="text-violet-400" /> Module Progress
          </h4>
          {(student.moduleProgress || []).map((m, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text)] truncate pr-2">{m.module}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {m.score !== null && <span className="font-mono text-amber-400">{m.score}%</span>}
                  <span className="font-mono text-[var(--color-muted)]">{m.progress}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-background)]">
                <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all" style={{ width: `${m.progress}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Quiz Scores Chart */}
        {(student.quizScores || []).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <LuStar size={13} className="text-amber-400" /> Quiz Scores
            </h4>
            <div className="flex items-end gap-2 h-16">
              {student.quizScores.map((score, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 transition-all" style={{ height: `${(score / 100) * 56}px` }} />
                  <span className="text-[9px] font-mono text-[var(--color-muted)]">{score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concepts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <LuTrendingUp size={12} /> Strong
            </h4>
            <div className="space-y-1">
              {(student.strongConcepts || []).map((c, i) => (
                <div key={i} className="text-[11px] text-emerald-300 px-2 py-1 rounded-lg bg-emerald-500/10">{c}</div>
              ))}
              {!student.strongConcepts?.length && <div className="text-[11px] text-[var(--color-muted)] italic">None identified yet</div>}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <LuTrendingDown size={12} /> Weak
            </h4>
            <div className="space-y-1">
              {(student.weakConcepts || []).map((c, i) => (
                <div key={i} className="text-[11px] text-rose-300 px-2 py-1 rounded-lg bg-rose-500/10">{c}</div>
              ))}
              {!student.weakConcepts?.length && <div className="text-[11px] text-emerald-400 italic">No weak areas!</div>}
            </div>
          </div>
        </div>

        {/* AI Usage */}
        <div className="p-4 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5"><LuMessageSquare size={13} className="text-pink-400" /> AI Tutor Usage</span>
            <span className="text-sm font-bold text-pink-400 font-mono">{student.aiUsage} sessions</span>
          </div>
          {student.status === 'At Risk' && (
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
              <LuTriangleAlert size={10} /> High AI usage may indicate comprehension difficulty
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
            <LuActivity size={13} className="text-cyan-400" /> Recent Activity
          </h4>
          {(student.recentActivity || []).map((act, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
              <div className="flex-1 text-xs text-[var(--color-text)]">{act.label}</div>
              <span className="text-[10px] text-[var(--color-muted)] font-mono shrink-0">{act.time}</span>
            </div>
          ))}
        </div>

        {/* Support button */}
        {student.status === 'At Risk' && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
              <LuTriangleAlert size={14} /> This student may need support
            </div>
            <button className="w-full py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer transition-colors flex items-center justify-center gap-2">
              <LuMessageSquare size={13} /> Contact Student
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const SAMPLE_STUDENTS = [
  { id: 's1', name: 'Arjun Sharma', email: 'arjun@iit.ac.in', avatar: 'AS', enrolledCourse: 'Quantum Fundamentals', courseId: 'ic1', progress: 62, quizAvg: 84, challengeAvg: 78, lastActive: '2h ago', status: 'Active', timeSpent: '24h 30m', aiUsage: 12, lessonsCompleted: 14, totalLessons: 24, moduleProgress: [{ module: 'Quantum Fundamentals', progress: 100, score: 88 }, { module: 'Quantum Gates', progress: 100, score: 92 }, { module: "Grover's Search", progress: 40, score: 76 }, { module: 'Phase Estimation', progress: 0, score: null }], quizScores: [88, 92, 76, 85, 79], strongConcepts: ['Superposition', 'Entanglement', 'Hadamard Gate'], weakConcepts: ['Phase Kickback', 'Amplitude Amplification'], recentActivity: [{ type: 'lesson', label: 'Completed: Diffusion Operator', time: '2h ago' }, { type: 'quiz', label: 'Quiz: Grover Module — 76%', time: '1d ago' }] },
  { id: 's2', name: 'Priya Mehta', email: 'priya@iit.ac.in', avatar: 'PM', enrolledCourse: 'Quantum Algorithms', courseId: 'ic2', progress: 91, quizAvg: 96, challengeAvg: 94, lastActive: '1d ago', status: 'Active', timeSpent: '41h 15m', aiUsage: 5, lessonsCompleted: 34, totalLessons: 38, moduleProgress: [{ module: 'Quantum Fundamentals', progress: 100, score: 98 }, { module: 'Quantum Gates', progress: 100, score: 95 }, { module: "Grover's Search", progress: 100, score: 96 }, { module: 'Phase Estimation', progress: 80, score: 94 }], quizScores: [98, 95, 96, 94, 97], strongConcepts: ['All Topics', 'Algorithm Design', 'Circuit Optimization'], weakConcepts: [], recentActivity: [{ type: 'lesson', label: 'Completed: QPE Circuit', time: '1d ago' }] },
  { id: 's3', name: 'Rohan Kumar', email: 'rohan@iit.ac.in', avatar: 'RK', enrolledCourse: 'Quantum Fundamentals', courseId: 'ic1', progress: 34, quizAvg: 72, challengeAvg: 65, lastActive: '3d ago', status: 'At Risk', timeSpent: '12h 00m', aiUsage: 28, lessonsCompleted: 8, totalLessons: 24, moduleProgress: [{ module: 'Quantum Fundamentals', progress: 100, score: 72 }, { module: 'Quantum Gates', progress: 50, score: 68 }, { module: "Grover's Search", progress: 0, score: null }], quizScores: [72, 68, 70, 75], strongConcepts: ['Basic Qubit Concept'], weakConcepts: ['Gate Operations', 'Circuit Design', 'Superposition Math', 'Measurement'], recentActivity: [{ type: 'lesson', label: 'Started: CNOT & Entanglement', time: '3d ago' }] },
  { id: 's4', name: 'Sneha Patel', email: 'sneha@iit.ac.in', avatar: 'SP', enrolledCourse: 'Quantum Algorithms', courseId: 'ic2', progress: 78, quizAvg: 88, challengeAvg: 85, lastActive: '5h ago', status: 'Active', timeSpent: '32h 45m', aiUsage: 8, lessonsCompleted: 29, totalLessons: 38, moduleProgress: [{ module: 'Quantum Fundamentals', progress: 100, score: 90 }, { module: 'Quantum Gates', progress: 100, score: 88 }, { module: "Grover's Search", progress: 90, score: 86 }, { module: 'Phase Estimation', progress: 30, score: 88 }], quizScores: [90, 88, 86, 88], strongConcepts: ['Gate Operations', 'Oracle Design', 'Entanglement'], weakConcepts: ['QPE Math', 'Controlled Unitaries'], recentActivity: [{ type: 'lesson', label: 'Completed: Controlled Unitary Ops', time: '5h ago' }] },
  { id: 's5', name: 'Vikram Singh', email: 'vikram@iit.ac.in', avatar: 'VS', enrolledCourse: 'Quantum Fundamentals', courseId: 'ic1', progress: 100, quizAvg: 94, challengeAvg: 96, lastActive: '2d ago', status: 'Completed', timeSpent: '48h 10m', aiUsage: 3, lessonsCompleted: 24, totalLessons: 24, moduleProgress: [{ module: 'Quantum Fundamentals', progress: 100, score: 95 }, { module: 'Quantum Gates', progress: 100, score: 93 }, { module: "Grover's Search", progress: 100, score: 96 }, { module: 'Phase Estimation', progress: 100, score: 92 }], quizScores: [95, 93, 96, 92, 94], strongConcepts: ['All Topics', 'Error Analysis', 'Optimization'], weakConcepts: [], recentActivity: [{ type: 'lesson', label: 'Completed all modules!', time: '2d ago' }] },
  { id: 's6', name: 'Anjali Rao', email: 'anjali@iit.ac.in', avatar: 'AR', enrolledCourse: 'Quantum Fundamentals', courseId: 'ic1', progress: 15, quizAvg: 60, challengeAvg: 55, lastActive: '7d ago', status: 'At Risk', timeSpent: '6h 20m', aiUsage: 35, lessonsCompleted: 4, totalLessons: 24, moduleProgress: [{ module: 'Quantum Fundamentals', progress: 60, score: 60 }, { module: 'Quantum Gates', progress: 0, score: null }], quizScores: [60, 62, 58], strongConcepts: ['Classical Bits Analogy'], weakConcepts: ['Qubit Measurement', 'Complex Amplitudes', 'Bloch Sphere', 'Gate Matrix Math'], recentActivity: [{ type: 'ai', label: 'AI Help: What is superposition?', time: '7d ago' }] },
  { id: 's7', name: 'Karan Malhotra', email: 'karan@iit.ac.in', avatar: 'KM', enrolledCourse: 'Quantum Algorithms', courseId: 'ic2', progress: 55, quizAvg: 80, challengeAvg: 74, lastActive: '12h ago', status: 'Active', timeSpent: '22h 00m', aiUsage: 18, lessonsCompleted: 21, totalLessons: 38, moduleProgress: [{ module: 'Quantum Fundamentals', progress: 100, score: 82 }, { module: 'Quantum Gates', progress: 100, score: 79 }, { module: "Grover's Search", progress: 60, score: 78 }], quizScores: [82, 79, 78, 80], strongConcepts: ['Circuit Building', 'Entanglement'], weakConcepts: ['Oracle Complexity', 'Amplitude Analysis'], recentActivity: [{ type: 'lesson', label: 'Completed: Amplitude Amplification', time: '12h ago' }] },
  { id: 's8', name: 'Deepa Nair', email: 'deepa@iit.ac.in', avatar: 'DN', enrolledCourse: 'Quantum Algorithms', courseId: 'ic2', progress: 88, quizAvg: 91, challengeAvg: 89, lastActive: '3h ago', status: 'Active', timeSpent: '38h 30m', aiUsage: 7, lessonsCompleted: 33, totalLessons: 38, moduleProgress: [{ module: 'Quantum Fundamentals', progress: 100, score: 93 }, { module: 'Quantum Gates', progress: 100, score: 90 }, { module: "Grover's Search", progress: 100, score: 92 }, { module: 'Phase Estimation', progress: 60, score: 88 }], quizScores: [93, 90, 92, 88, 92], strongConcepts: ['Algorithm Design', 'Gate Optimization', 'Grover Oracle'], weakConcepts: ['Phase Estimation Setup'], recentActivity: [{ type: 'lesson', label: 'Completed: QPE Theory', time: '3h ago' }] },
];

export default function StudentManagement({ focusGrading = false }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await apiFetch('/instructor/students');
        if (res?.success && res.data.students?.length > 0) {
          setStudents(res.data.students);
        } else {
          setStudents(SAMPLE_STUDENTS);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setStudents(SAMPLE_STUDENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  // If focusGrading, auto-filter to At Risk students so instructor sees who needs attention
  const [filterStatus, setFilterStatus] = useState(focusGrading ? 'At Risk' : 'All');
  const [sortBy, setSortBy] = useState('name');

  const filtered = students
    .filter(s => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
      const matchCourse = filterCourse === 'All' || s.enrolledCourse.includes(filterCourse);
      const matchStatus = filterStatus === 'All' || s.status === filterStatus;
      return matchSearch && matchCourse && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'quiz') return b.quizAvg - a.quizAvg;
      if (sortBy === 'activity') return a.lastActive.localeCompare(b.lastActive);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2"><LuUsers size={20} className="text-violet-400" /> Student Management</h2>
          <p className="text-xs text-[var(--color-muted)] mt-1">{students.length} students enrolled · {students.filter(s => s.status === 'At Risk').length} at risk</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]" />
        </div>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className="px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option value="All">All Courses</option>
          <option value="Fundamentals">Quantum Fundamentals</option>
          <option value="Algorithms">Quantum Algorithms</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option value="All">All Status</option>
          <option>Active</option><option>At Risk</option><option>Completed</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          <option value="name">Sort: Name</option>
          <option value="progress">Sort: Progress</option>
          <option value="quiz">Sort: Quiz Score</option>
          <option value="activity">Sort: Activity</option>
        </select>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: students.length, color: 'text-violet-400' },
          { label: 'Active', value: students.filter(s => s.status === 'Active').length, color: 'text-emerald-400' },
          { label: 'At Risk', value: students.filter(s => s.status === 'At Risk').length, color: 'text-rose-400' },
          { label: 'Completed', value: students.filter(s => s.status === 'Completed').length, color: 'text-cyan-400' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
            <div className={`text-xl font-bold font-heading ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-[var(--color-muted)] font-mono mt-1 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Student Table */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--color-muted)]">Loading students...</p>
        </div>
      ) : (
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
            <tr>
              <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Student</th>
              <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Course</th>
              <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Progress</th>
              <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Quiz Avg</th>
              <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Last Active</th>
              <th className="px-5 py-3.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Status</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/50">
            {filtered.map((s, i) => (
              <tr key={s.id} className="hover:bg-[var(--color-background)]/50 transition-colors cursor-pointer" onClick={() => setSelected(s)}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                      {s.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-text)]">{s.name}</div>
                      <div className="text-[10px] text-[var(--color-muted)] font-mono">{s.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[var(--color-muted)] max-w-32 truncate">{s.enrolledCourse}</td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[var(--color-muted)]">{s.lessonsCompleted}/{s.totalLessons} lessons</span>
                      <span className="text-violet-400 font-mono font-bold">{s.progress}%</span>
                    </div>
                    <MiniBar value={s.progress} color="bg-gradient-to-r from-violet-500 to-cyan-500" />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`font-mono font-bold ${s.quizAvg >= 85 ? 'text-emerald-400' : s.quizAvg >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>{s.quizAvg}%</span>
                </td>
                <td className="px-5 py-4 text-[var(--color-muted)] font-mono">{s.lastActive}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                </td>
                <td className="px-5 py-4">
                  <LuChevronRight size={14} className="text-[var(--color-muted)]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--color-muted)]">No students match your filters</div>
        )}
      </div>
      )}

      {/* Detail panel */}
      {selected && <StudentDetailPanel student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
