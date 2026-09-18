"use client";

import React, { useState } from 'react';
import {
  LuArrowLeft, LuBookOpen, LuUsers, LuClock, LuStar, LuCircleCheck,
  LuFileText, LuFlaskConical, LuZap, LuPencil, LuChevronDown, LuChevronRight
} from 'react-icons/lu';

const TYPE_INFO = {
  lesson: { icon: LuFileText, color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  experiment: { icon: LuFlaskConical, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  quiz: { icon: LuStar, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  challenge: { icon: LuZap, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
};

export default function CoursePreview({ course, courseId, onOpenBuilder, onOpenLesson, onOpenQuiz, onOpenChallenge, onBack }) {
  const [expandedModules, setExpandedModules] = useState({});

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-muted)]">Loading course preview...</p>
      </div>
    );
  }

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleEditLesson = (e, lesson, modId) => {
    e.stopPropagation();
    if (lesson.type === 'quiz' && onOpenQuiz) onOpenQuiz({ courseId: course.id, moduleId: modId, quizId: lesson.id });
    else if (lesson.type === 'challenge' && onOpenChallenge) onOpenChallenge({ courseId: course.id, moduleId: modId, challengeId: lesson.id });
    else if (onOpenLesson) onOpenLesson({ courseId: course.id, moduleId: modId, lessonId: lesson.id });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Back nav & Edit Course Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-violet-400 transition-colors cursor-pointer group"
        >
          <LuArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Courses
        </button>
        <button
          onClick={() => onOpenBuilder(course)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-colors cursor-pointer shadow-lg shadow-violet-500/20"
        >
          <LuPencil size={14} /> Edit Course Structure
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative p-8 rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-background to-background z-0" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {course.category || 'Category'}
            </span>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]">
              {course.difficulty || 'Beginner'}
            </span>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              {course.status || 'Published'}
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="mt-3 text-sm text-[var(--color-muted)] max-w-2xl leading-relaxed">
              {course.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-mono text-[var(--color-muted)]">
            <div className="flex items-center gap-2"><LuClock className="text-cyan-400" /> {course.duration || '0 hrs'}</div>
            <div className="flex items-center gap-2"><LuBookOpen className="text-amber-400" /> {course.totalLessons || 0} Lessons</div>
            <div className="flex items-center gap-2"><LuUsers className="text-violet-400" /> {course.enrolledStudents || 0} Enrolled</div>
            {course.rating && <div className="flex items-center gap-2"><LuStar className="text-amber-400" /> {course.rating}</div>}
          </div>
        </div>
      </div>

      {/* Grid Layout for Content & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Syllabus */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            Course Syllabus <span className="text-xs font-mono text-[var(--color-muted)] font-normal ml-2">(Student Preview)</span>
          </h2>

          <div className="space-y-3">
            {(!course.modules || course.modules.length === 0) ? (
              <div className="p-8 text-center border border-dashed border-[var(--color-border)] rounded-2xl">
                <p className="text-sm text-[var(--color-muted)]">No modules found.</p>
                <button onClick={() => onOpenBuilder(course)} className="mt-3 text-xs text-violet-400 hover:underline">Add your first module in the Builder</button>
              </div>
            ) : (
              course.modules.map((mod, mIdx) => {
                const isExpanded = expandedModules[mod.id] ?? true; // expanded by default
                return (
                  <div key={mod.id} className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden transition-all hover:border-violet-500/30">
                    {/* Module Header */}
                    <div 
                      onClick={() => toggleModule(mod.id)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 text-xs font-bold shrink-0">
                          {mIdx + 1}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-text)]">{mod.title}</h3>
                          <p className="text-xs text-[var(--color-muted)] flex items-center gap-2 mt-0.5">
                            <span>{mod.lessons?.length || 0} Items</span>
                            {mod.completionRule && <span className="px-1.5 py-0.5 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-[9px] uppercase tracking-wider">{mod.completionRule}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); onOpenBuilder(course); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-violet-500/20 text-violet-400 transition-all text-xs font-bold flex items-center gap-1.5">
                          <LuPencil size={12} /> Edit Module
                        </button>
                        {isExpanded ? <LuChevronDown className="text-[var(--color-muted)]" /> : <LuChevronRight className="text-[var(--color-muted)]" />}
                      </div>
                    </div>

                    {/* Module Lessons */}
                    {isExpanded && (
                      <div className="border-t border-[var(--color-border)] bg-[var(--color-background)]/50 divide-y divide-[var(--color-border)]/50">
                        {mod.lessons?.length > 0 ? mod.lessons.map((lesson, lIdx) => {
                          const typeData = TYPE_INFO[lesson.type] || TYPE_INFO.lesson;
                          const Icon = typeData.icon;
                          return (
                            <div key={lesson.id} className="flex items-center justify-between p-3 pl-14 hover:bg-[var(--color-surface)] transition-colors group/lesson">
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg border ${typeData.color}`}><Icon size={14} /></div>
                                <div>
                                  <div className="text-sm font-semibold text-[var(--color-text)]">{lesson.title}</div>
                                  <div className="text-xs text-[var(--color-muted)] font-mono mt-0.5">{lesson.duration || '0 min'}</div>
                                </div>
                              </div>
                              <button 
                                onClick={(e) => handleEditLesson(e, lesson, mod.id)}
                                className="opacity-0 group-hover/lesson:opacity-100 px-3 py-1.5 rounded-lg border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-all text-xs font-bold flex items-center gap-1.5"
                              >
                                <LuPencil size={12} /> Edit
                              </button>
                            </div>
                          );
                        }) : (
                          <div className="p-4 pl-14 text-xs text-[var(--color-muted)] italic">No lessons in this module.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Objectives</h3>
            <ul className="space-y-3">
              {course.objectives?.length > 0 ? course.objectives.map((obj, i) => (
                <li key={i} className="flex gap-2 text-sm text-[var(--color-text)]">
                  <LuCircleCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{obj}</span>
                </li>
              )) : <li className="text-xs text-[var(--color-muted)]">No objectives listed.</li>}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Prerequisites</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--color-muted)]">
              {course.prerequisites?.length > 0 ? course.prerequisites.map((pre, i) => (
                <li key={i}>{pre}</li>
              )) : <li className="text-xs">None required.</li>}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
