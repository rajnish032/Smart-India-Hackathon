"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/api';
import {
  LuX, LuBookOpen, LuFlaskConical, LuBrain, LuTrophy, LuCheck,
  LuLock, LuChevronDown, LuChevronRight, LuPlay, LuArrowRight,
  LuClock, LuUsers, LuStar, LuGraduationCap, LuTarget, LuZap,
} from 'react-icons/lu';


const TYPE_STYLES = {
  lesson: { icon: LuBookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Lesson' },
  experiment: { icon: LuFlaskConical, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Lab' },
  quiz: { icon: LuBrain, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Quiz' },
  challenge: { icon: LuTrophy, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Challenge' },
};

function CurriculumItem({ item, onSelectLesson }) {
  const style = TYPE_STYLES[item.type] || TYPE_STYLES.lesson;
  const Icon = style.icon;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all cursor-pointer group ${
        item.completed
          ? 'bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/30'
          : 'bg-[var(--color-background)] border-[var(--color-border)]/40 hover:border-[var(--color-primary)]/30'
      }`}
      onClick={() => onSelectLesson && onSelectLesson(item)}
    >
      <div className={`w-7 h-7 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={13} className={style.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)] transition-colors">
          {item.title}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)] font-mono mt-0.5">
          <span className={`px-1.5 py-0.5 rounded ${style.bg} ${style.color} font-semibold`}>{style.label}</span>
          <LuClock size={9} /><span>{item.duration}</span>
        </div>
      </div>
      {item.completed ? (
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <LuCheck size={11} className="text-white" />
        </div>
      ) : (
        <LuChevronRight size={14} className="text-[var(--color-muted)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}

function ModuleSection({ module, onSelectLesson }) {
  const [open, setOpen] = useState(!module.locked && module.progress > 0);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      module.locked ? 'border-[var(--color-border)]/30 opacity-60' : 'border-[var(--color-border)]'
    }`}>
      <button
        className="w-full flex items-center gap-3 px-5 py-4 bg-[var(--color-surface)] hover:bg-[var(--color-border)]/10 transition-colors text-left"
        onClick={() => !module.locked && setOpen(o => !o)}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          module.completed ? 'bg-emerald-500' : module.locked ? 'bg-[var(--color-border)]' : 'bg-[var(--color-primary)]/10'
        }`}>
          {module.completed ? (
            <LuCheck size={15} className="text-white" />
          ) : module.locked ? (
            <LuLock size={13} className="text-[var(--color-muted)]" />
          ) : (
            <span className="text-xs font-bold text-[var(--color-primary)]">{module.progress}%</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[var(--color-text)] truncate">{module.title}</div>
          <div className="text-[10px] text-[var(--color-muted)] font-mono mt-0.5">
            {module.items.length} items · {module.items.filter(i => i.completed).length} completed
          </div>
        </div>
        {!module.locked && (
          open ? <LuChevronDown size={16} className="text-[var(--color-muted)] flex-shrink-0" />
               : <LuChevronRight size={16} className="text-[var(--color-muted)] flex-shrink-0" />
        )}
      </button>

      {!module.locked && open && (
        <div className="px-4 py-3 space-y-2 bg-[var(--color-background)]">
          {/* Progress bar */}
          {module.progress > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${module.completed ? 'bg-emerald-500' : 'bg-[var(--color-primary)]'}`}
                  style={{ width: `${module.progress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[var(--color-muted)]">{module.progress}%</span>
            </div>
          )}
          {module.items.map(item => (
            <CurriculumItem key={item.id} item={item} onSelectLesson={onSelectLesson} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourseDetail({ course: initialCourse, onClose, onSelectLesson }) {
  const [course, setCourse] = useState(initialCourse);
  const [loading, setLoading] = useState(!initialCourse?.curriculum);

  useEffect(() => {
    let mounted = true;
    if (initialCourse && !initialCourse.curriculum) {
      setLoading(true);
      apiFetch(`/learner/courses/${initialCourse.id}`)
        .then(res => {
          if (mounted && res?.data?.course) {
            setCourse({ ...res.data.course, curriculum: res.data.curriculum });
          }
        })
        .catch(err => console.warn('Failed to fetch course detail:', err))
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setCourse(initialCourse);
    }
    return () => { mounted = false; };
  }, [initialCourse]);

  if (!course) return null;

  const curriculumData = course.curriculum || [];
  const totalItems = curriculumData.reduce((s, m) => s + (m.items?.length || 0), 0);
  const completedItems = curriculumData.reduce((s, m) => s + (m.items || []).filter(i => i.completed).length, 0);
  const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Find next incomplete item
  let nextItem = null;
  for (const mod of curriculumData) {
    for (const item of (mod.items || [])) {
      if (!item.completed && !mod.locked) { nextItem = item; break; }
    }
    if (nextItem) break;
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/15 via-[var(--color-surface)] to-[var(--color-secondary)]/10 p-6 sm:p-8">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[var(--color-primary)]/10 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--color-background)]/60 hover:bg-[var(--color-border)]/50 transition-colors text-[var(--color-muted)]"
        >
          <LuX size={18} />
        </button>

        <div className="relative z-10 space-y-4 pr-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
              course.difficulty === 'Advanced' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
              course.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>{course.difficulty}</span>
            <span className="text-[10px] font-mono text-[var(--color-muted)] flex items-center gap-1"><LuClock size={10} />{course.duration}</span>
            <span className="text-[10px] font-mono text-[var(--color-muted)] flex items-center gap-1"><LuUsers size={10} />{course.studentsEnrolled || '1,240'} learners</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--color-text)]">{course.title}</h2>
            <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed max-w-2xl">{course.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-xs font-bold">
              {course.instructor?.[0] || 'I'}
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--color-text)]">{course.instructor}</div>
              <div className="text-[10px] text-[var(--color-muted)]">Instructor</div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-[var(--color-muted)]">
              <span>{completedItems} / {totalItems} items completed</span>
              <span className="font-bold text-[var(--color-primary)]">{overallPct}%</span>
            </div>
            <div className="h-2 bg-[var(--color-border)]/40 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            {nextItem && (
              <button
                onClick={() => onSelectLesson && onSelectLesson(nextItem)}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/20"
              >
                <LuPlay size={14} className="ml-0.5" />
                {overallPct > 0 ? 'Continue Course' : 'Start Course'}
              </button>
            )}
            <button className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all flex items-center gap-2">
              <LuTarget size={14} /> Set Goal
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Tree */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base text-[var(--color-text)]">Course Curriculum</h3>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[var(--color-muted)]">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] animate-spin mb-3"></div>
            <p className="text-sm">Loading modules...</p>
          </div>
        ) : (
          curriculumData.map(module => (
            <ModuleSection key={module.id} module={module} onSelectLesson={onSelectLesson} />
          ))
        )}
      </div>
    </div>
  );
}
