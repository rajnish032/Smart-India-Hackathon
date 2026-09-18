"use client";

import React, { useState } from 'react';
import {
  LuBookOpen, LuPlus, LuGrip, LuTrash2, LuPencil, LuCheck, LuX,
  LuEye, LuUpload, LuDownload, LuChevronRight, LuChevronDown,
  LuFileText, LuFlaskConical, LuStar, LuZap, LuSettings, LuArrowUp, LuArrowDown,
  LuGlobe, LuArchive, LuSave, LuPlay, LuCircleCheck, LuArrowLeft, LuExternalLink,
} from 'react-icons/lu';
import { apiFetch } from '../../services/api';

const LESSON_TYPES = [
  { type: 'lesson', label: 'Lesson', icon: LuFileText, color: 'text-violet-400 bg-violet-500/10' },
  { type: 'experiment', label: 'Experiment', icon: LuFlaskConical, color: 'text-cyan-400 bg-cyan-500/10' },
  { type: 'quiz', label: 'Quiz', icon: LuStar, color: 'text-amber-400 bg-amber-500/10' },
  { type: 'challenge', label: 'Challenge', icon: LuZap, color: 'text-pink-400 bg-pink-500/10' },
];

const TYPE_INFO = Object.fromEntries(LESSON_TYPES.map(t => [t.type, t]));

const STATUS_CHIP = {
  Draft: 'bg-slate-500/15 text-slate-400',
  Published: 'bg-emerald-500/15 text-emerald-400',
  Review: 'bg-amber-500/15 text-amber-400',
};

function LessonItem({ lesson, onDelete, onMoveUp, onMoveDown, isFirst, isLast, courseId, moduleId, onOpenLesson, onOpenQuiz, onOpenChallenge }) {
  const info = TYPE_INFO[lesson.type] || TYPE_INFO.lesson;
  const Icon = info.icon;

  const handleEdit = () => {
    if (lesson.type === 'quiz' && onOpenQuiz) {
      onOpenQuiz({ courseId, moduleId, quizId: lesson.id });
    } else if (lesson.type === 'challenge' && onOpenChallenge) {
      onOpenChallenge({ courseId, moduleId, challengeId: lesson.id });
    } else if (onOpenLesson) {
      onOpenLesson({ courseId, moduleId, lessonId: lesson.id });
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] group hover:border-violet-500/30 transition-all`}>
      <LuGrip size={14} className="text-[var(--color-muted)] cursor-grab shrink-0" />
      <div className={`p-1.5 rounded-lg ${info.color} shrink-0`}><Icon size={13} /></div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-[var(--color-text)] truncate">{lesson.title}</div>
        <div className="text-[10px] text-[var(--color-muted)] font-mono">{lesson.type} · {lesson.duration}</div>
      </div>
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${STATUS_CHIP[lesson.status] || STATUS_CHIP.Draft}`}>{lesson.status}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isFirst && <button onClick={onMoveUp} className="p-1 hover:text-violet-400 text-[var(--color-muted)] cursor-pointer transition-colors"><LuArrowUp size={12} /></button>}
        {!isLast && <button onClick={onMoveDown} className="p-1 hover:text-violet-400 text-[var(--color-muted)] cursor-pointer transition-colors"><LuArrowDown size={12} /></button>}
        <button onClick={handleEdit} title="Edit in builder" className="p-1 hover:text-cyan-400 text-[var(--color-muted)] cursor-pointer transition-colors"><LuExternalLink size={12} /></button>
        <button onClick={onDelete} className="p-1 hover:text-rose-400 text-[var(--color-muted)] cursor-pointer transition-colors"><LuTrash2 size={12} /></button>
      </div>
    </div>
  );
}

function AddLessonPanel({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lesson');
  const [duration, setDuration] = useState('15 min');

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({ id: `les_${Date.now()}`, title, type, duration, status: 'Draft', order: 0, blocks: [] });
    setTitle(''); setType('lesson'); setDuration('15 min'); setOpen(false);
  };

  return (
    <div className="space-y-2">
      {!open ? (
        <button onClick={() => setOpen(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:text-violet-400 hover:border-violet-500/40 transition-all cursor-pointer">
          <LuPlus size={14} /> Add Content
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-[var(--color-background)] border border-violet-500/30 space-y-3">
          <input
            autoFocus type="text" placeholder="Content title..."
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
          />
          <div className="grid grid-cols-2 gap-2">
            {LESSON_TYPES.map(lt => {
              const Icon = lt.icon;
              return (
                <button key={lt.type} onClick={() => setType(lt.type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-all cursor-pointer ${type === lt.type ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-violet-500/30'}`}>
                  <Icon size={12} />{lt.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text" placeholder="Duration (e.g. 15 min)"
              value={duration} onChange={e => setDuration(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
            />
            <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer">Cancel</button>
            <button onClick={handleAdd} disabled={!title.trim()} className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-violet-500 cursor-pointer transition-colors">Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleBlock({ module, isActive, onSelect, onUpdate, onDeleteModule, courseId, onOpenLesson, onOpenQuiz, onOpenChallenge }) {
  const [expanded, setExpanded] = useState(isActive);
  const [lessons, setLessons] = useState(module.lessons || []);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [completionRule, setCompletionRule] = useState(module.completionRule || 'All lessons');

  const updateLessons = (newLessons) => {
    setLessons(newLessons);
    onUpdate({ ...module, title, completionRule, lessons: newLessons });
  };

  const addLesson = (lesson) => updateLessons([...lessons, { ...lesson, order: lessons.length + 1 }]);
  const deleteLesson = (id) => updateLessons(lessons.filter(x => x.id !== id));
  const moveLesson = (idx, dir) => {
    const arr = [...lessons];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    updateLessons(arr);
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 ${isActive ? 'border-violet-500/50 bg-violet-500/5' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>
      <button onClick={() => { setExpanded(!expanded); onSelect(); }} className="w-full flex items-center gap-3 p-4 text-left cursor-pointer">
        <LuGrip size={14} className="text-[var(--color-muted)] shrink-0" />
        {expanded ? <LuChevronDown size={14} className="text-violet-400 shrink-0" /> : <LuChevronRight size={14} className="text-[var(--color-muted)] shrink-0" />}
        {editing ? (
          <input
            autoFocus value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => { setEditing(false); onUpdate({ ...module, title, completionRule }); }}
            className="flex-1 bg-transparent text-xs font-bold text-[var(--color-text)] focus:outline-none border-b border-violet-500"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-xs font-bold text-[var(--color-text)] truncate">{title}</span>
        )}
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${STATUS_CHIP[module.status] || STATUS_CHIP.Draft}`}>{module.status}</span>
        {editing ? (
          <select
            value={completionRule}
            onChange={e => setCompletionRule(e.target.value)}
            onClick={e => e.stopPropagation()}
            onBlur={() => { setEditing(false); onUpdate({ ...module, title, completionRule }); }}
            className="text-[10px] bg-[var(--color-background)] border border-[var(--color-border)] rounded px-1 py-0.5"
          >
            <option>All lessons</option>
            <option>All lessons + quiz</option>
            <option>All lessons + challenge</option>
            <option>All lessons + quiz + challenge</option>
            <option>At least 80% of lessons</option>
          </select>
        ) : (
          <span className="text-[10px] font-mono text-[var(--color-muted)]">{lessons.length} items</span>
        )}
        <button onClick={e => { e.stopPropagation(); setEditing(true); }} className="p-1 hover:text-violet-400 text-[var(--color-muted)] cursor-pointer transition-colors"><LuPencil size={12} /></button>
        <button onClick={e => { e.stopPropagation(); onDeleteModule(module.id); }} className="p-1 hover:text-rose-400 text-[var(--color-muted)] cursor-pointer transition-colors"><LuTrash2 size={12} /></button>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {lessons.map((lesson, i) => (
            <LessonItem
              key={lesson.id} lesson={lesson}
              onDelete={() => deleteLesson(lesson.id)}
              onMoveUp={() => moveLesson(i, -1)}
              onMoveDown={() => moveLesson(i, 1)}
              isFirst={i === 0} isLast={i === lessons.length - 1}
              courseId={courseId}
              moduleId={module.id}
              onOpenLesson={onOpenLesson}
              onOpenQuiz={onOpenQuiz}
              onOpenChallenge={onOpenChallenge}
            />
          ))}
          <AddLessonPanel onAdd={addLesson} />
        </div>
      )}
    </div>
  );
}

function AddModulePanel({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', completionRule: 'All lessons' });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    onAdd({
      id: `mod_${Date.now()}`, ...form, status: 'Draft', order: 0,
      lessonsCount: 0, lessons: [],
      objectives: [],
    });
    setForm({ title: '', description: '', completionRule: 'All lessons' });
    setOpen(false);
  };

  return !open ? (
    <button onClick={() => setOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:text-violet-400 hover:border-violet-500/40 transition-all cursor-pointer">
      <LuPlus size={14} /> Add Module
    </button>
  ) : (
    <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-violet-500/30 space-y-3">
      <input
        autoFocus type="text" placeholder="Module title..."
        value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
      />
      <input
        type="text" placeholder="Description (optional)"
        value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
      />
      <select
        value={form.completionRule} onChange={e => setForm(f => ({ ...f, completionRule: e.target.value }))}
        className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      >
        <option>All lessons</option>
        <option>All lessons + quiz</option>
        <option>All lessons + challenge</option>
        <option>All lessons + quiz + challenge</option>
        <option>At least 80% of lessons</option>
      </select>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer">Cancel</button>
        <button onClick={handleAdd} disabled={!form.title.trim()} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-violet-500 cursor-pointer transition-colors">Add Module</button>
      </div>
    </div>
  );
}

export default function CourseBuilder({ course: initialCourse, courseId, onBack, onOpenLesson, onOpenQuiz, onOpenChallenge, onOpenPreview }) {
  const course = initialCourse || {
    id: courseId || 'ic1', title: 'Quantum Fundamentals: From Bits to Qubits',
    status: 'Published', difficulty: 'Beginner',
    modules: [
      {
        id: 'mod1', title: 'Module 1: Quantum Fundamentals', status: 'Published',
        lessons: [
          { id: 'l1', title: 'What is a Qubit?', type: 'lesson', duration: '12 min', status: 'Published' },
          { id: 'l2', title: 'Superposition & Bloch Sphere', type: 'lesson', duration: '18 min', status: 'Published' },
          { id: 'l3', title: 'Lab: Visualize a Qubit State', type: 'experiment', duration: '20 min', status: 'Published' },
          { id: 'l4', title: 'Module 1 Quiz', type: 'quiz', duration: '8 min', status: 'Published' },
        ],
        completionRule: 'All lessons + quiz',
      },
      {
        id: 'mod2', title: 'Module 2: Quantum Gates & Circuits', status: 'Published',
        lessons: [
          { id: 'l5', title: 'Pauli Gates: X, Y, Z', type: 'lesson', duration: '15 min', status: 'Published' },
          { id: 'l6', title: 'Hadamard & Phase Gates', type: 'lesson', duration: '20 min', status: 'Published' },
          { id: 'l7', title: 'CNOT & Entanglement', type: 'lesson', duration: '22 min', status: 'Published' },
          { id: 'l8', title: 'Lab: Build a Bell State', type: 'experiment', duration: '25 min', status: 'Published' },
          { id: 'l9', title: 'Challenge: Multi-qubit Circuit', type: 'challenge', duration: '30 min', status: 'Published' },
        ],
        completionRule: 'All lessons + challenge',
      },
      {
        id: 'mod3', title: "Module 3: Grover's Search Algorithm", status: 'Published',
        lessons: [
          { id: 'l10', title: 'Oracle Construction', type: 'lesson', duration: '20 min', status: 'Published' },
          { id: 'l11', title: 'Amplitude Amplification', type: 'lesson', duration: '25 min', status: 'Published' },
          { id: 'l12', title: 'Diffusion Operator', type: 'lesson', duration: '20 min', status: 'Published' },
          { id: 'l13', title: "Lab: Grover on 3 Qubits", type: 'experiment', duration: '35 min', status: 'Published' },
          { id: 'l14', title: 'Module 3 Quiz', type: 'quiz', duration: '10 min', status: 'Published' },
          { id: 'l15', title: 'Challenge: Optimize Oracle Depth', type: 'challenge', duration: '45 min', status: 'Published' },
        ],
        completionRule: 'All lessons + quiz + challenge',
      },
      {
        id: 'mod4', title: 'Module 4: Quantum Phase Estimation', status: 'Draft',
        lessons: [
          { id: 'l16', title: 'Phase Kickback Intuition', type: 'lesson', duration: '18 min', status: 'Draft' },
          { id: 'l17', title: 'Controlled Unitary Operations', type: 'lesson', duration: '22 min', status: 'Draft' },
          { id: 'l18', title: 'Lab: QPE Circuit', type: 'experiment', duration: '40 min', status: 'Draft' },
        ],
        completionRule: 'All lessons',
      },
    ],
  };

  const [courseData, setCourseData] = useState(course);
  const [modules, setModules] = useState(course.modules || []);
  const [activeModuleId, setActiveModuleId] = useState(modules[0]?.id);
  const [courseStatus, setCourseStatus] = useState(course.status || 'Draft');
  const [completionReq, setCompletionReq] = useState('Complete all modules');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (course.id && !course.id.startsWith('ic')) {
        await apiFetch(`/instructor/courses/${course.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...courseData, status: courseStatus, modules }),
        });
      }
    } catch (e) {
      console.warn('Save course failed (offline?):', e);
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const totalLessons = modules.reduce((a, m) => a + (m.lessons?.length || 0), 0);
  const publishedCount = modules.reduce((a, m) => a + (m.lessons?.filter(l => l.status === 'Published').length || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back nav */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-violet-400 transition-colors cursor-pointer group"
        >
          <LuArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Courses
        </button>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 w-full max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <LuBookOpen size={16} className="text-violet-400" />
            <span className="text-xs text-[var(--color-muted)] font-mono">Course Builder</span>
          </div>
          <input 
            type="text" 
            value={courseData.title} 
            onChange={e => setCourseData({ ...courseData, title: e.target.value })}
            placeholder="Course Title"
            className="text-xl font-bold bg-transparent text-[var(--color-text)] focus:outline-none border-b border-transparent focus:border-violet-500 transition-colors w-full" 
          />
          <input 
            type="text" 
            value={courseData.description || ''} 
            onChange={e => setCourseData({ ...courseData, description: e.target.value })}
            placeholder="Short description..."
            className="text-xs mt-1 bg-transparent text-[var(--color-muted)] focus:outline-none border-b border-transparent focus:border-violet-500 transition-colors w-full" 
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button onClick={() => onOpenPreview && onOpenPreview({ ...courseData, modules })} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer flex items-center gap-1.5">
            <LuEye size={13} /> Preview
          </button>
          <button onClick={handleSave} className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
          {saving ? <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : saved ? <><LuCheck size={13} /> Saved!</> : <><LuSave size={13} /> Save Draft</>}
          </button>
          <select
            value={courseStatus}
            onChange={e => setCourseStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
          >
            <option value="Draft">Draft</option>
            <option value="Review">Send for Review</option>
            <option value="Published">Publish</option>
            <option value="Archived">Archive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module List (sidebar) */}
        <div className="lg:col-span-3 space-y-3">
          {modules.map((mod) => (
            <ModuleBlock
              key={mod.id} module={mod}
              isActive={activeModuleId === mod.id}
              onSelect={() => setActiveModuleId(mod.id)}
              onUpdate={(updated) => setModules(ms => ms.map(m => m.id === updated.id ? updated : m))}
              onDeleteModule={(id) => setModules(ms => ms.filter(m => m.id !== id))}
              courseId={course.id}
              onOpenLesson={onOpenLesson}
              onOpenQuiz={onOpenQuiz}
              onOpenChallenge={onOpenChallenge}
            />
          ))}
          <AddModulePanel onAdd={(mod) => setModules(ms => [...ms, mod])} />
        </div>

        {/* Right Panel: Course Settings */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <LuSettings size={13} className="text-violet-400" /> Course Settings
            </h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">Category</label>
                <select
                  value={courseData.category || 'Foundations'} onChange={e => setCourseData({ ...courseData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <option>Foundations</option><option>Algorithms</option><option>QML</option><option>Cryptography</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">Difficulty</label>
                <select
                  value={courseData.difficulty || 'Beginner'} onChange={e => setCourseData({ ...courseData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">Status</label>
                <div className={`text-xs font-bold px-3 py-1.5 rounded-lg ${STATUS_CHIP[courseStatus] || STATUS_CHIP.Draft}`}>{courseStatus}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">Completion Requirement</label>
                <select
                  value={completionReq} onChange={e => setCompletionReq(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <option>Complete all modules</option>
                  <option>Complete 80% of modules</option>
                  <option>Complete all + pass final quiz</option>
                  <option>Complete all + pass all quizzes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Structure Summary</h4>
            {[
              { label: 'Modules', value: modules.length },
              { label: 'Total Lessons', value: totalLessons },
              { label: 'Published', value: publishedCount, color: 'text-emerald-400' },
              { label: 'Experiments', value: modules.reduce((a, m) => a + (m.lessons?.filter(l => l.type === 'experiment').length || 0), 0), color: 'text-cyan-400' },
              { label: 'Quizzes', value: modules.reduce((a, m) => a + (m.lessons?.filter(l => l.type === 'quiz').length || 0), 0), color: 'text-amber-400' },
              { label: 'Challenges', value: modules.reduce((a, m) => a + (m.lessons?.filter(l => l.type === 'challenge').length || 0), 0), color: 'text-pink-400' },
            ].map(stat => (
              <div key={stat.label} className="flex justify-between items-center text-xs">
                <span className="text-[var(--color-muted)]">{stat.label}</span>
                <span className={`font-bold font-mono ${stat.color || 'text-[var(--color-text)]'}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
