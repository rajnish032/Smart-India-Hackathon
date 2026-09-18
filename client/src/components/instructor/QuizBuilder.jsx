"use client";

import React, { useState } from 'react';
import {
  LuStar, LuPlus, LuTrash2, LuGrip, LuArrowUp, LuArrowDown,
  LuCheck, LuX, LuSave, LuEye, LuSettings, LuCode, LuCpu,
  LuChevronDown, LuChevronRight, LuCircleCheck, LuArrowLeft,
} from 'react-icons/lu';
import { apiFetch } from '../../services/api';

const QUESTION_TYPES = [
  { type: 'mcq', label: 'Multiple Choice', icon: LuCircleCheck },
  { type: 'code', label: 'Code Answer', icon: LuCode },
  { type: 'circuit', label: 'Circuit Answer', icon: LuCpu },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function QuestionCard({ q, idx, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState('');

  const updateOption = (i, val) => onUpdate({ ...q, options: q.options.map((o, j) => j === i ? val : o) });
  const addOption = () => { if (q.options.length < 6) onUpdate({ ...q, options: [...q.options, ''] }); };
  const removeOption = (i) => {
    const newOpts = q.options.filter((_, j) => j !== i);
    const newCorrect = q.correct >= newOpts.length ? 0 : (q.correct > i ? q.correct - 1 : q.correct);
    onUpdate({ ...q, options: newOpts, correct: newCorrect });
  };

  return (
    <div className="rounded-2xl bg-[var(--color-surface)]/60 backdrop-blur-md border border-[var(--color-border)] hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-4 text-left cursor-pointer hover:bg-violet-500/5 transition-colors">
        <LuGrip size={13} className="text-[var(--color-muted)] shrink-0" />
        {expanded ? <LuChevronDown size={13} className="text-violet-400 shrink-0" /> : <LuChevronRight size={13} className="text-[var(--color-muted)] shrink-0" />}
        <span className="text-[10px] font-mono font-bold text-violet-400 px-2 py-0.5 rounded-lg bg-violet-500/10 shrink-0">Q{idx + 1}</span>
        <span className="flex-1 text-sm font-semibold text-[var(--color-text)] truncate">{q.text || 'Untitled question'}</span>
        <span className="text-[10px] font-mono font-medium px-2 py-1 rounded bg-[var(--color-background)] text-[var(--color-muted)] shrink-0">{q.marks} pts · {q.difficulty}</span>
        <div className="flex items-center gap-1 shrink-0">
          {!isFirst && <button onClick={e => { e.stopPropagation(); onMoveUp(); }} className="p-1 hover:text-violet-400 text-[var(--color-muted)] cursor-pointer"><LuArrowUp size={11} /></button>}
          {!isLast && <button onClick={e => { e.stopPropagation(); onMoveDown(); }} className="p-1 hover:text-violet-400 text-[var(--color-muted)] cursor-pointer"><LuArrowDown size={11} /></button>}
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 hover:text-rose-400 text-[var(--color-muted)] cursor-pointer"><LuTrash2 size={11} /></button>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--color-border)]">
          {/* Question type + meta */}
          <div className="flex flex-wrap gap-3 pt-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Type</label>
              <select value={q.type} onChange={e => onUpdate({ ...q, type: e.target.value })}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                {QUESTION_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Marks</label>
              <input type="number" min={1} max={20} value={q.marks}
                onChange={e => onUpdate({ ...q, marks: Number(e.target.value) })}
                className="w-16 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Difficulty</label>
              <select value={q.difficulty} onChange={e => onUpdate({ ...q, difficulty: e.target.value })}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Question Text *</label>
            <textarea rows={2} value={q.text} onChange={e => onUpdate({ ...q, text: e.target.value })}
              placeholder="Enter the question..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)] resize-none"
            />
          </div>

          {/* MCQ Options */}
          {q.type === 'mcq' && (
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Answer Options</label>
              {q.options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${q.correct === i ? 'bg-emerald-500/5 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-[var(--color-background)] border-[var(--color-border)] hover:border-violet-500/30'}`}>
                  <button onClick={() => onUpdate({ ...q, correct: i })}
                    className={`w-5 h-5 rounded-full border-2 shrink-0 transition-all flex items-center justify-center cursor-pointer ${q.correct === i ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-[var(--color-muted)] hover:border-emerald-500/50'}`}>
                    {q.correct === i && <LuCheck size={12} className="text-white" />}
                  </button>
                  <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-transparent text-xs text-[var(--color-text)] focus:outline-none placeholder:text-[var(--color-muted)]"
                  />
                  {q.options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="text-[var(--color-muted)] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg p-1.5 transition-colors cursor-pointer"><LuX size={14} /></button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <button onClick={addOption} className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1.5 cursor-pointer mt-2"><LuPlus size={14} /> Add another option</button>
              )}
              <p className="text-[10px] text-[var(--color-muted)]">Click the circle to mark the correct answer.</p>
            </div>
          )}

          {/* Code/Circuit answer */}
          {(q.type === 'code' || q.type === 'circuit') && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Starter Code</label>
                <textarea rows={4} value={q.starterCode || ''} onChange={e => onUpdate({ ...q, starterCode: e.target.value })}
                  placeholder="from qiskit import QuantumCircuit\n..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[var(--color-border)] text-xs text-emerald-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Expected Output / Solution</label>
                <textarea rows={4} value={q.solution || ''} onChange={e => onUpdate({ ...q, solution: e.target.value })}
                  placeholder="Model solution or expected output..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[var(--color-border)] text-xs text-cyan-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono"
                />
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Explanation (shown after answer)</label>
            <textarea rows={2} value={q.explanation || ''} onChange={e => onUpdate({ ...q, explanation: e.target.value })}
              placeholder="Explain why this answer is correct..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)] resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizBuilder({ courseId, moduleId, quizId, onBack }) {
  const [title, setTitle] = useState('Module 1 — Quantum Fundamentals Quiz');
  const [settings, setSettings] = useState({ timeLimit: 15, passScore: 70, attempts: 1, shuffle: true, difficulty: 'Beginner' });
  const [questions, setQuestions] = useState([
    {
      id: 'qq1', type: 'mcq', text: 'Which property allows a qubit to exist in multiple states simultaneously?',
      options: ['Entanglement', 'Superposition', 'Interference', 'Measurement'],
      correct: 1, explanation: 'Superposition allows a qubit to exist in |0⟩ and |1⟩ simultaneously.',
      marks: 2, difficulty: 'Easy',
    },
    {
      id: 'qq2', type: 'mcq', text: 'What does the Hadamard gate do to a |0⟩ state?',
      options: ['Flips to |1⟩', 'Creates equal superposition', 'Adds phase π', 'Entangles with another qubit'],
      correct: 1, explanation: 'H|0⟩ = (|0⟩ + |1⟩)/√2',
      marks: 2, difficulty: 'Easy',
    },
    {
      id: 'qq3', type: 'mcq', text: 'What is the probability of measuring |1⟩ if a qubit is in state (3|0⟩ + 4|1⟩)/5?',
      options: ['3/5', '4/5', '9/25', '16/25'],
      correct: 3, explanation: 'Probability = |amplitude|² = (4/5)² = 16/25.',
      marks: 3, difficulty: 'Medium',
    },
  ]);
  const [status, setStatus] = useState('Draft');
  const [saved, setSaved] = useState(false);

  const addQuestion = () => {
    setQuestions(qs => [...qs, {
      id: `qq_${Date.now()}`, type: 'mcq', text: '', options: ['', '', '', ''],
      correct: 0, explanation: '', marks: 2, difficulty: 'Easy',
    }]);
  };
  const updateQuestion = (id, updated) => setQuestions(qs => qs.map(q => q.id === id ? updated : q));
  const deleteQuestion = (id) => setQuestions(qs => qs.filter(q => q.id !== id));
  const moveQuestion = (idx, dir) => {
    const arr = [...questions];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setQuestions(arr);
  };

  const totalMarks = questions.reduce((a, q) => a + (q.marks || 0), 0);

  const handleSave = async () => {
    try {
      if (quizId) {
        await apiFetch(`/instructor/quizzes/${quizId}`, {
          method: 'PUT',
          body: JSON.stringify({ title, ...settings, questions, moduleId, courseId }),
        });
      } else {
        await apiFetch('/instructor/quizzes', {
          method: 'POST',
          body: JSON.stringify({ title, ...settings, questions, moduleId, courseId }),
        });
      }
    } catch { /* optimistic */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back nav */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-violet-400 transition-colors cursor-pointer group"
        >
          <LuArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Course Builder
        </button>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LuStar size={15} className="text-amber-400" />
            <span className="text-xs text-[var(--color-muted)] font-mono">Quiz Builder</span>
          </div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="text-xl font-bold bg-transparent text-[var(--color-text)] focus:outline-none border-b border-transparent focus:border-violet-500 transition-colors w-full" />
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button onClick={handleSave} className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${saved ? 'bg-emerald-600 text-white' : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
            {saved ? <><LuCheck size={13} /> Saved</> : <><LuSave size={13} /> Save</>}
          </button>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer">
            <option>Draft</option><option>Review</option><option>Published</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Questions */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-[var(--color-text)]">{questions.length} Question{questions.length !== 1 ? 's' : ''} <span className="text-[var(--color-muted)] text-sm font-normal ml-2">· {totalMarks} total marks</span></h3>
            <button onClick={addQuestion} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5">
              <LuPlus size={14} /> Add Question
            </button>
          </div>

          {questions.map((q, i) => (
            <QuestionCard key={q.id} q={q} idx={i}
              onUpdate={(updated) => updateQuestion(q.id, updated)}
              onDelete={() => deleteQuestion(q.id)}
              onMoveUp={() => moveQuestion(i, -1)}
              onMoveDown={() => moveQuestion(i, 1)}
              isFirst={i === 0} isLast={i === questions.length - 1}
            />
          ))}

          <button onClick={addQuestion} className="w-full py-4 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/30 text-sm font-semibold text-[var(--color-muted)] hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2">
            <LuPlus size={18} /> Add Another Question
          </button>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[var(--color-surface)]/60 backdrop-blur-xl border border-[var(--color-border)] shadow-xl space-y-5">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2"><LuSettings size={14} className="text-amber-400" /> Quiz Settings</h4>
            {[
              { label: 'Time Limit (min)', key: 'timeLimit', type: 'number' },
              { label: 'Pass Score (%)', key: 'passScore', type: 'number' },
              { label: 'Max Attempts', key: 'attempts', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">{label}</label>
                <input type={type} value={settings[key]} onChange={e => setSettings(s => ({ ...s, [key]: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Difficulty</label>
              <select value={settings.difficulty} onChange={e => setSettings(s => ({ ...s, difficulty: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settings.shuffle} onChange={e => setSettings(s => ({ ...s, shuffle: e.target.checked }))}
                className="rounded accent-violet-500" />
              <span className="text-xs text-[var(--color-text)]">Shuffle questions</span>
            </label>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--color-surface)]/60 backdrop-blur-xl border border-[var(--color-border)] shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Summary</h4>
            {[
              { label: 'Questions', value: questions.length },
              { label: 'Total Marks', value: totalMarks, color: 'text-amber-400' },
              { label: 'Pass Score', value: `${Math.ceil(totalMarks * settings.passScore / 100)} / ${totalMarks}`, color: 'text-emerald-400' },
              { label: 'Est. Duration', value: `${settings.timeLimit} min` },
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
