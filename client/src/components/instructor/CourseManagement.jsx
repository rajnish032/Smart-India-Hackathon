"use client";

import React, { useState } from 'react';
import {
  LuBookOpen, LuPlus, LuSearch, LuFilter, LuPencil, LuCopy, LuTrash2,
  LuEye, LuArchive, LuUpload, LuDownload, LuUsers, LuStar,
  LuCircleCheck, LuClock, LuEllipsisVertical, LuX, LuCheck,
  LuGlobe, LuFlaskConical, LuGraduationCap,
} from 'react-icons/lu';
import { apiFetch } from '../../services/api';

const DIFFICULTY_COLORS = {
  Beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Advanced: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

const STATUS_COLORS = {
  Published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Draft: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  Review: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Archived: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const CATEGORIES = ['All', 'Foundations', 'Algorithms', 'QML', 'Cryptography', 'Error Correction', 'Quantum Chemistry'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const STATUSES = ['All', 'Published', 'Draft', 'Review', 'Archived'];

function CourseCard({ course, onAction, onOpenPreview }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const actions = [
    { label: 'Edit Course', icon: LuPencil, action: 'edit' },
    { label: 'Course Builder', icon: LuFlaskConical, action: 'builder' },
    { label: 'Duplicate', icon: LuCopy, action: 'duplicate' },
    { label: course.status === 'Published' ? 'Unpublish' : 'Publish', icon: course.status === 'Published' ? LuDownload : LuUpload, action: 'togglePublish' },
    { label: 'Archive', icon: LuArchive, action: 'archive' },
    { label: 'Delete', icon: LuTrash2, action: 'delete', danger: true },
  ];

  return (
    <div 
      onClick={() => onOpenPreview && onOpenPreview(course)}
      className="group p-5 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] hover:border-violet-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/5 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header badges */}
          <div className="flex items-center flex-wrap gap-2">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.Beginner}`}>
              {course.difficulty}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[course.status] || STATUS_COLORS.Draft}`}>
              {course.status}
            </span>
            <span className="text-[10px] font-mono text-[var(--color-muted)] px-2 py-0.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
              {course.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-[var(--color-text)] leading-snug group-hover:text-violet-300 transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-[11px] text-[var(--color-muted)] leading-relaxed line-clamp-2">{course.description}</p>

          {/* Stats row */}
          <div className="flex items-center flex-wrap gap-4 text-[11px] font-mono text-[var(--color-muted)]">
            <span className="flex items-center gap-1"><LuUsers size={12} className="text-violet-400" />{course.enrolledStudents} enrolled</span>
            <span className="flex items-center gap-1"><LuClock size={12} className="text-cyan-400" />{course.duration}</span>
            <span className="flex items-center gap-1"><LuBookOpen size={12} className="text-amber-400" />{course.publishedLessons}/{course.totalLessons} lessons</span>
            {course.rating && <span className="flex items-center gap-1"><LuStar size={12} className="text-amber-400" />{course.rating}</span>}
          </div>

          {/* Progress bar */}
          {course.enrolledStudents > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[var(--color-muted)] font-mono">
                <span>Avg. completion</span>
                <span className="text-violet-400 font-bold">{course.completionRate}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-surface)]">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500" style={{ width: `${course.completionRate}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Build CTA + Action menu */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAction('builder', course); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[10px] font-bold shadow-md shadow-violet-500/20 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          >
            <LuFlaskConical size={11} /> Build →
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-2 rounded-xl hover:bg-[var(--color-surface)] transition-colors text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer"
            >
              <LuEllipsisVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-50 w-44 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl shadow-black/30 overflow-hidden">
                {actions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.action}
                      onClick={(e) => { e.stopPropagation(); onAction(act.action, course); setMenuOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs hover:bg-[var(--color-background)] transition-colors cursor-pointer ${act.danger ? 'text-rose-400 hover:text-rose-300' : 'text-[var(--color-text)]'}`}
                    >
                      <Icon size={13} />
                      {act.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateCourseModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', difficulty: 'Beginner', category: 'Foundations',
    duration: '', objectives: [''], prerequisites: [''],
  });
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const updateList = (field, idx, value) => setForm(f => ({
    ...f, [field]: f[field].map((v, i) => i === idx ? value : v)
  }));
  const addListItem = (field) => setForm(f => ({ ...f, [field]: [...f[field], ''] }));
  const removeListItem = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch('/instructor/courses', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          objectives: form.objectives.filter(Boolean),
          prerequisites: form.prerequisites.filter(Boolean),
        }),
      });
      if (res?.success) onCreated(res.data.course);
      else onCreated({ id: `new_${Date.now()}`, ...form, status: 'Draft', enrolledStudents: 0, completionRate: 0 });
    } catch (e) {
      console.warn('Create course failed:', e);
      // Still redirect with a temp course object so the flow works offline
      onCreated({ id: `new_${Date.now()}`, ...form, status: 'Draft', enrolledStudents: 0, completionRate: 0 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl shadow-black/40"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)] rounded-t-3xl">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
              <LuBookOpen size={18} className="text-violet-400" /> Create New Course
            </h2>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">Fill in the course details to get started.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-background)] text-[var(--color-muted)] transition-colors cursor-pointer"><LuX size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Course Title *</label>
            <input
              type="text" placeholder="e.g. Quantum Error Correction & Surface Codes"
              value={form.title} onChange={e => updateField('title', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Description *</label>
            <textarea
              rows={3} placeholder="Describe what students will learn..."
              value={form.description} onChange={e => updateField('description', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)] resize-none"
            />
          </div>

          {/* Row: Difficulty, Category, Duration */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Difficulty', field: 'difficulty', options: ['Beginner', 'Intermediate', 'Advanced'] },
              { label: 'Category', field: 'category', options: ['Foundations', 'Algorithms', 'QML', 'Cryptography', 'Error Correction', 'Quantum Chemistry'] },
            ].map(({ label, field, options }) => (
              <div key={field} className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">{label}</label>
                <select
                  value={form[field]} onChange={e => updateField(field, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Duration</label>
              <input
                type="text" placeholder="e.g. 12 hrs"
                value={form.duration} onChange={e => updateField('duration', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
              />
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Learning Objectives</label>
            {form.objectives.map((obj, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text" placeholder={`Objective ${i + 1}`}
                  value={obj} onChange={e => updateList('objectives', i, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
                />
                {form.objectives.length > 1 && (
                  <button onClick={() => removeListItem('objectives', i)} className="p-2 text-rose-400 hover:text-rose-300 cursor-pointer"><LuX size={14} /></button>
                )}
              </div>
            ))}
            <button onClick={() => addListItem('objectives')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer">
              <LuPlus size={13} /> Add objective
            </button>
          </div>

          {/* Prerequisites */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Prerequisites</label>
            {form.prerequisites.map((pre, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text" placeholder={`Prerequisite ${i + 1}`}
                  value={pre} onChange={e => updateList('prerequisites', i, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
                />
                {form.prerequisites.length > 1 && (
                  <button onClick={() => removeListItem('prerequisites', i)} className="p-2 text-rose-400 hover:text-rose-300 cursor-pointer"><LuX size={14} /></button>
                )}
              </div>
            ))}
            <button onClick={() => addListItem('prerequisites')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer">
              <LuPlus size={13} /> Add prerequisite
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] rounded-b-3xl">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit} disabled={saving || !form.title.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {saving ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <LuCheck size={14} />}
            {saving ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseManagement({ onOpenBuilder, onOpenPreview, onTabChange }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/instructor/courses');
        if (res?.success) setCourses(res.data.courses || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = courses.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || c.category === filterCategory;
    const matchDiff = filterDifficulty === 'All' || c.difficulty === filterDifficulty;
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchSearch && matchCat && matchDiff && matchStatus;
  });

  const handleAction = async (action, course) => {
    switch (action) {
      case 'builder':
        if (onOpenBuilder) onOpenBuilder(course);
        break;
      case 'duplicate':
        try {
          const res = await apiFetch(`/instructor/courses/${course.id}/duplicate`, { method: 'POST' });
          if (res?.success) setCourses(c => [res.data.course, ...c]);
        } catch { setCourses(c => [{ ...course, id: `copy_${Date.now()}`, title: `${course.title} (Copy)`, status: 'Draft', enrolledStudents: 0 }, ...c]); }
        break;
      case 'togglePublish': {
        const newStatus = course.status === 'Published' ? 'Draft' : 'Published';
        try {
          await apiFetch(`/instructor/courses/${course.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
        } catch { /* optimistic */ }
        setCourses(c => c.map(x => x.id === course.id ? { ...x, status: newStatus } : x));
        break;
      }
      case 'archive':
        setCourses(c => c.map(x => x.id === course.id ? { ...x, status: 'Archived' } : x));
        break;
      case 'delete':
        if (window.confirm(`Delete "${course.title}"?`)) {
          setCourses(c => c.filter(x => x.id !== course.id));
        }
        break;
    }
  };

  const handleCreated = (course) => {
    setCourses(c => [course, ...c]);
    setShowCreate(false);
    // Redirect into Course Builder immediately after creation
    if (onOpenBuilder) onOpenBuilder(course);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <LuBookOpen size={20} className="text-violet-400" /> Course Management
          </h2>
          <p className="text-xs text-[var(--color-muted)] mt-1">{courses.length} courses · {courses.filter(c => c.status === 'Published').length} published</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-500/20 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <LuPlus size={15} /> New Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="text" placeholder="Search courses..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
          />
        </div>
        {[
          { label: 'Category', value: filterCategory, options: CATEGORIES, set: setFilterCategory },
          { label: 'Difficulty', value: filterDifficulty, options: DIFFICULTIES, set: setFilterDifficulty },
          { label: 'Status', value: filterStatus, options: STATUSES, set: setFilterStatus },
        ].map(({ label, value, options, set }) => (
          <select
            key={label} value={value} onChange={e => set(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            {options.map(o => <option key={o} value={o}>{label}: {o}</option>)}
          </select>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Courses', value: courses.length, color: 'text-violet-400' },
          { label: 'Published', value: courses.filter(c => c.status === 'Published').length, color: 'text-emerald-400' },
          { label: 'Draft', value: courses.filter(c => c.status === 'Draft').length, color: 'text-amber-400' },
          { label: 'Total Students', value: courses.reduce((a, c) => a + c.enrolledStudents, 0), color: 'text-cyan-400' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
            <div className={`text-xl font-bold font-heading ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-[var(--color-muted)] font-mono mt-1 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--color-muted)]">Loading courses...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <LuBookOpen size={32} className="mx-auto text-[var(--color-muted)]" />
          <p className="text-sm text-[var(--color-muted)]">No courses match your filters</p>
          <button onClick={() => { setSearch(''); setFilterCategory('All'); setFilterDifficulty('All'); setFilterStatus('All'); }} className="text-xs text-violet-400 hover:text-violet-300 cursor-pointer">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} onAction={handleAction} onOpenPreview={onOpenPreview} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && <CreateCourseModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  );
}
