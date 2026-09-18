"use client";

import React, { useState } from 'react';
import {
  LuFolderOpen, LuBookOpen, LuFileText, LuStar, LuZap, LuFlaskConical,
  LuLayers, LuSearch, LuFilter, LuArrowRight, LuCheck, LuX,
  LuEye, LuPencil, LuTrash2, LuArchive, LuUpload, LuDownload,
  LuClock, LuEllipsisVertical, LuExternalLink,
} from 'react-icons/lu';
import { apiFetch } from '../../services/api';

const CONTENT_TYPES = ['All', 'Course', 'Module', 'Lesson', 'Experiment', 'Quiz', 'Challenge'];
const STATUSES = ['All', 'Draft', 'Review', 'Published', 'Archived'];

const STATUS_STYLES = {
  Draft: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  Review: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Archived: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const STATUS_FLOW = { Draft: ['Review', 'Published'], Review: ['Draft', 'Published'], Published: ['Draft', 'Archived'], Archived: ['Draft'] };

const TYPE_ICONS = {
  Course: LuBookOpen, Module: LuLayers, Lesson: LuFileText,
  Experiment: LuFlaskConical, Quiz: LuStar, Challenge: LuZap,
};
const TYPE_COLORS = {
  Course: 'text-violet-400 bg-violet-500/10', Module: 'text-cyan-400 bg-cyan-500/10',
  Lesson: 'text-blue-400 bg-blue-500/10', Experiment: 'text-teal-400 bg-teal-500/10',
  Quiz: 'text-amber-400 bg-amber-500/10', Challenge: 'text-pink-400 bg-pink-500/10',
};

const INITIAL_CONTENT = [
  { id: 'cm1', type: 'Course', title: 'Quantum Fundamentals: From Bits to Qubits', status: 'Published', lastModified: '2 days ago' },
  { id: 'cm2', type: 'Course', title: 'Advanced Quantum Algorithms: Shor, Grover & QPE', status: 'Published', lastModified: '5 days ago' },
  { id: 'cm3', type: 'Course', title: 'Quantum Machine Learning Fundamentals', status: 'Draft', lastModified: '1 day ago' },
  { id: 'cm4', type: 'Module', title: 'Module 4: Quantum Phase Estimation', status: 'Draft', lastModified: '1 day ago' },
  { id: 'cm5', type: 'Lesson', title: 'Phase Kickback Intuition', status: 'Draft', lastModified: '1 day ago' },
  { id: 'cm6', type: 'Lesson', title: 'What is a Qubit?', status: 'Published', lastModified: '5 days ago' },
  { id: 'cm7', type: 'Lesson', title: 'Superposition & Bloch Sphere', status: 'Published', lastModified: '5 days ago' },
  { id: 'cm8', type: 'Experiment', title: 'Lab: Visualize a Qubit State', status: 'Published', lastModified: '5 days ago' },
  { id: 'cm9', type: 'Experiment', title: 'Lab: Build a Bell State', status: 'Published', lastModified: '4 days ago' },
  { id: 'cm10', type: 'Quiz', title: 'Module 1 — Quantum Fundamentals Quiz', status: 'Published', lastModified: '5 days ago' },
  { id: 'cm11', type: 'Quiz', title: "Grover's Algorithm Assessment", status: 'Published', lastModified: '3 days ago' },
  { id: 'cm12', type: 'Challenge', title: 'Bell State Circuit Challenge', status: 'Published', lastModified: '4 days ago' },
  { id: 'cm13', type: 'Challenge', title: "Grover's Oracle Optimization", status: 'Published', lastModified: '3 days ago' },
  { id: 'cm14', type: 'Lesson', title: 'Variational Quantum Circuits Intro', status: 'Review', lastModified: 'Just now' },
  { id: 'cm15', type: 'Experiment', title: 'Lab: VQC Training Simulation', status: 'Draft', lastModified: '2 hours ago' },
];

function ContentRow({ item, onStatusChange, onDelete, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = TYPE_ICONS[item.type] || LuFileText;
  const typeColor = TYPE_COLORS[item.type] || TYPE_COLORS.Lesson;
  const nextStatuses = STATUS_FLOW[item.status] || [];

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--color-background)]/50 transition-colors group border-b border-[var(--color-border)]/50 last:border-0">
      <div className={`p-2 rounded-lg ${typeColor} shrink-0`}><Icon size={14} /></div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-[var(--color-text)] truncate">{item.title}</div>
        <div className="text-[10px] text-[var(--color-muted)] font-mono mt-0.5 flex items-center gap-2">
          <span>{item.type}</span>
          <span>·</span>
          <LuClock size={10} /><span>{item.lastModified}</span>
        </div>
      </div>
      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[item.status]}`}>{item.status}</span>

      {/* Quick status transitions + edit */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {nextStatuses.map(ns => (
          <button
            key={ns}
            onClick={() => onStatusChange(item.id, ns)}
            title={`Move to ${ns}`}
            className={`text-[9px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors ${STATUS_STYLES[ns].replace('/30', '/20')} hover:opacity-80`}
          >
            → {ns}
          </button>
        ))}
        {onEdit && ['Lesson', 'Experiment', 'Quiz', 'Challenge', 'Course'].includes(item.type) && (
          <button
            onClick={() => onEdit(item)}
            title="Open in Builder"
            className="p-1 hover:text-cyan-400 text-[var(--color-muted)] cursor-pointer"
          >
            <LuExternalLink size={12} />
          </button>
        )}
        <button onClick={() => onDelete(item.id)} className="p-1 hover:text-rose-400 text-[var(--color-muted)] cursor-pointer"><LuTrash2 size={12} /></button>
      </div>
    </div>
  );
}

export default function ContentManagement({ initialFilterType = 'All', onOpenLesson, onOpenQuiz, onOpenChallenge, onOpenBuilder }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await apiFetch('/instructor/content');
        if (res?.success && res.data.items?.length > 0) {
          setContent(res.data.items);
        } else {
          // Fall back to local demo data when API returns empty
          setContent(INITIAL_CONTENT);
        }
      } catch (err) {
        console.error('Failed to fetch content:', err);
        setContent(INITIAL_CONTENT);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);
  const [filterType, setFilterType] = useState(initialFilterType);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = content.filter(c => {
    const matchType = filterType === 'All' || c.type === filterType;
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const handleStatusChange = async (id, newStatus) => {
    const item = content.find(c => c.id === id);
    if (!item) return;
    try {
      await apiFetch(`/instructor/content/${item.type}/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
    } catch { /* optimistic */ }
    setContent(c => c.map(x => x.id === id ? { ...x, status: newStatus, lastModified: 'Just now' } : x));
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this content item?')) {
      setContent(c => c.filter(x => x.id !== id));
    }
  };

  const handleEdit = (item) => {
    const t = item.type;
    if (t === 'Lesson' || t === 'Experiment') {
      onOpenLesson && onOpenLesson({ lessonId: item.id });
    } else if (t === 'Quiz') {
      onOpenQuiz && onOpenQuiz({ quizId: item.id });
    } else if (t === 'Challenge') {
      onOpenChallenge && onOpenChallenge({ challengeId: item.id });
    } else if (t === 'Course') {
      onOpenBuilder && onOpenBuilder({ id: item.id, title: item.title });
    }
  };

  const stats = {
    total: content.length,
    published: content.filter(c => c.status === 'Published').length,
    draft: content.filter(c => c.status === 'Draft').length,
    review: content.filter(c => c.status === 'Review').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <LuFolderOpen size={20} className="text-violet-400" /> Content Management
        </h2>
        <p className="text-xs text-[var(--color-muted)] mt-1">Manage all your courses, modules, lessons, experiments, quizzes, and challenges through the content lifecycle.</p>
      </div>

      {/* Lifecycle legend */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-muted)] overflow-x-auto scrollbar-none">
        {['Draft', '→', 'Review', '→', 'Published', '→', 'Archived'].map((s, i) => (
          <span key={i} className={s === '→' ? 'text-[var(--color-border)]' : `font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[s] || ''}`}>{s}</span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: stats.total, color: 'text-violet-400' },
          { label: 'Published', value: stats.published, color: 'text-emerald-400' },
          { label: 'Draft', value: stats.draft, color: 'text-slate-400' },
          { label: 'Under Review', value: stats.review, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
            <div className={`text-xl font-bold font-heading ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-[var(--color-muted)] font-mono mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {CONTENT_TYPES.map(t => {
          const Icon = TYPE_ICONS[t];
          return (
            <button key={t} onClick={() => setFilterType(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${filterType === t ? 'bg-violet-600 text-white' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
              {Icon && <Icon size={12} />}{t}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <LuSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input type="text" placeholder="Search content..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50">
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Content list */}
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[var(--color-muted)]">Loading content...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <LuFolderOpen size={28} className="mx-auto text-[var(--color-muted)]" />
            <p className="text-sm text-[var(--color-muted)]">No content matches your filters</p>
          </div>
        ) : (
          filtered.map(item => (
            <ContentRow key={item.id} item={item} onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={handleEdit} />
          ))
        )}
      </div>

      <p className="text-[10px] text-[var(--color-muted)] text-center font-mono">
        Hover a row to see lifecycle transition buttons. Click → to promote or demote content status.
      </p>
    </div>
  );
}
