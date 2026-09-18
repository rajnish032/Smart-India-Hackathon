"use client";

import React, { useState } from 'react';
import {
  LuFileText, LuPlus, LuTrash2, LuGrip, LuArrowUp, LuArrowDown,
  LuEye, LuSave, LuCheck, LuX, LuCode, LuImage, LuVideo,
  LuCpu, LuZap, LuStar, LuFlaskConical, LuMessageSquare, LuType,
  LuHeading, LuActivity, LuPlay, LuMonitor, LuArrowLeft,
} from 'react-icons/lu';
import { apiFetch } from '../../services/api';

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: LuHeading, color: 'text-violet-400 bg-violet-500/10' },
  { type: 'text', label: 'Text', icon: LuType, color: 'text-slate-400 bg-slate-500/10' },
  { type: 'image', label: 'Image', icon: LuImage, color: 'text-emerald-400 bg-emerald-500/10' },
  { type: 'video', label: 'Video', icon: LuVideo, color: 'text-red-400 bg-red-500/10' },
  { type: 'code', label: 'Code Block', icon: LuCode, color: 'text-cyan-400 bg-cyan-500/10' },
  { type: 'circuit', label: 'Circuit', icon: LuCpu, color: 'text-amber-400 bg-amber-500/10' },
  { type: 'simulation', label: 'Simulation', icon: LuActivity, color: 'text-teal-400 bg-teal-500/10' },
  { type: 'visualization', label: 'Visualization', icon: LuMonitor, color: 'text-blue-400 bg-blue-500/10' },
  { type: 'ai', label: 'AI Explanation', icon: LuMessageSquare, color: 'text-pink-400 bg-pink-500/10' },
  { type: 'quiz', label: 'Quiz Embed', icon: LuStar, color: 'text-orange-400 bg-orange-500/10' },
  { type: 'challenge', label: 'Challenge Embed', icon: LuZap, color: 'text-rose-400 bg-rose-500/10' },
];

const TYPE_MAP = Object.fromEntries(BLOCK_TYPES.map(b => [b.type, b]));

function ContentBlock({ block, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast, previewMode }) {
  const info = TYPE_MAP[block.type] || TYPE_MAP.text;
  const Icon = info.icon;
  const [editing, setEditing] = useState(false);

  if (previewMode) {
    // Simplified preview render
    return (
      <div className="py-3">
        {block.type === 'heading' && <h2 className="text-xl font-bold text-[var(--color-text)]">{block.content || 'Heading'}</h2>}
        {block.type === 'text' && <p className="text-sm text-[var(--color-text)] leading-relaxed">{block.content || 'Text content...'}</p>}
        {block.type === 'code' && <pre className="p-4 rounded-xl bg-[#0d1117] text-emerald-400 text-xs font-mono overflow-x-auto">{block.content || '# Code here'}</pre>}
        {block.type === 'image' && <div className="h-48 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] text-xs"><LuImage size={24} className="opacity-30 mr-2" />{block.content || 'Image placeholder'}</div>}
        {block.type === 'video' && <div className="h-48 rounded-2xl bg-[#0d1117] flex items-center justify-center"><LuPlay size={32} className="text-white opacity-60" /></div>}
        {block.type === 'circuit' && <div className="h-32 rounded-2xl bg-[#0d1117] border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs"><LuCpu size={20} className="mr-2" />Interactive Circuit Simulator</div>}
        {block.type === 'simulation' && <div className="h-32 rounded-2xl bg-[#0d1117] border border-teal-500/20 flex items-center justify-center text-teal-400 text-xs"><LuActivity size={20} className="mr-2" />Quantum Simulation Panel</div>}
        {block.type === 'visualization' && <div className="h-32 rounded-2xl bg-[#0d1117] border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs"><LuMonitor size={20} className="mr-2" />Visualization Widget</div>}
        {block.type === 'ai' && <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-sm"><LuMessageSquare size={16} className="inline mr-2" />{block.content || 'AI Explanation: Ask the AI tutor to explain this concept.'}</div>}
        {block.type === 'quiz' && <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm"><LuStar size={16} className="inline mr-2" />Quiz embedded here</div>}
        {block.type === 'challenge' && <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm"><LuZap size={16} className="inline mr-2" />Challenge embedded here</div>}
      </div>
    );
  }

  return (
    <div className="group flex items-stretch gap-3">
      {/* Side controls */}
      <div className="flex flex-col items-center gap-1 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <LuGrip size={13} className="text-[var(--color-muted)] cursor-grab" />
        {!isFirst && <button onClick={onMoveUp} className="p-0.5 hover:text-violet-400 text-[var(--color-muted)] cursor-pointer"><LuArrowUp size={11} /></button>}
        {!isLast && <button onClick={onMoveDown} className="p-0.5 hover:text-violet-400 text-[var(--color-muted)] cursor-pointer"><LuArrowDown size={11} /></button>}
        <button onClick={onDelete} className="p-0.5 hover:text-rose-400 text-[var(--color-muted)] cursor-pointer"><LuTrash2 size={11} /></button>
      </div>

      <div className="flex-1 p-4 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] group-hover:border-violet-500/30 transition-all space-y-3">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 text-xs font-semibold ${info.color.split(' ')[0]}`}>
            <div className={`p-1.5 rounded-lg ${info.color}`}><Icon size={12} /></div>
            {info.label}
          </div>
          <button onClick={() => setEditing(!editing)} className="text-[10px] text-[var(--color-muted)] hover:text-violet-400 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10">
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>

        {/* Block editor */}
        {editing ? (
          <div>
            {(block.type === 'text' || block.type === 'heading' || block.type === 'ai') && (
              <textarea
                rows={block.type === 'heading' ? 1 : 4}
                value={block.content || ''}
                onChange={e => onUpdate({ ...block, content: e.target.value })}
                placeholder={`Enter ${info.label.toLowerCase()} content...`}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)] resize-none font-mono"
              />
            )}
            {block.type === 'code' && (
              <textarea
                rows={6}
                value={block.content || ''}
                onChange={e => onUpdate({ ...block, content: e.target.value })}
                placeholder="# Enter code here..."
                className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[var(--color-border)] text-xs text-emerald-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono"
              />
            )}
            {(block.type === 'image' || block.type === 'video') && (
              <input
                type="text"
                value={block.content || ''}
                onChange={e => onUpdate({ ...block, content: e.target.value })}
                placeholder={`${info.label} URL or caption...`}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
              />
            )}
            {(block.type === 'circuit' || block.type === 'simulation' || block.type === 'visualization') && (
              <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-muted)] text-center">
                Interactive {info.label} — configured in simulator settings
              </div>
            )}
            {(block.type === 'quiz' || block.type === 'challenge') && (
              <input
                type="text"
                value={block.content || ''}
                onChange={e => onUpdate({ ...block, content: e.target.value })}
                placeholder={`${info.label} ID to embed...`}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]"
              />
            )}
          </div>
        ) : (
          <div className="text-xs text-[var(--color-muted)] italic min-h-6">
            {block.content ? (
              <span className="text-[var(--color-text)] not-italic line-clamp-2">{block.content}</span>
            ) : (
              <span>Click "Edit" to add content...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LessonBuilder({ courseId, moduleId, lessonId, onBack }) {
  const [lessonTitle, setLessonTitle] = useState('Quantum Interference & Phase');
  const [blocks, setBlocks] = useState([
    { id: 'b1', type: 'heading', content: 'Understanding Quantum Interference' },
    { id: 'b2', type: 'text', content: 'Quantum interference is one of the most fundamental phenomena in quantum mechanics. When quantum amplitudes combine, they can add constructively or cancel destructively, providing the basis for quantum advantage.' },
    { id: 'b3', type: 'code', content: 'from qiskit import QuantumCircuit\nimport numpy as np\n\n# Create a simple interference circuit\nqc = QuantumCircuit(1)\nqc.h(0)  # Create superposition\nqc.z(0)  # Apply phase\nqc.h(0)  # Interfere\nprint(qc)' },
    { id: 'b4', type: 'simulation', content: '' },
    { id: 'b5', type: 'ai', content: 'Ask the AI tutor: What is quantum interference and how does it differ from classical wave interference?' },
  ]);
  const [previewMode, setPreviewMode] = useState(false);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('Draft');

  const addBlock = (type) => {
    setBlocks(b => [...b, { id: `b_${Date.now()}`, type, content: '' }]);
    setShowBlockPicker(false);
  };
  const updateBlock = (id, updated) => setBlocks(b => b.map(x => x.id === id ? updated : x));
  const deleteBlock = (id) => setBlocks(b => b.filter(x => x.id !== id));
  const moveBlock = (idx, dir) => {
    const arr = [...blocks];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setBlocks(arr);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title: lessonTitle, status, blocks, moduleId, courseId };
      if (lessonId) {
        await apiFetch(`/instructor/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else if (moduleId) {
        await apiFetch(`/instructor/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(payload) });
      }
    } catch (e) {
      console.warn('Save lesson failed (offline?):', e);
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
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
            <LuFileText size={15} className="text-violet-400" />
            <span className="text-xs text-[var(--color-muted)] font-mono">Lesson Builder</span>
          </div>
          <input
            type="text" value={lessonTitle}
            onChange={e => setLessonTitle(e.target.value)}
            className="text-xl font-bold bg-transparent text-[var(--color-text)] focus:outline-none border-b border-transparent focus:border-violet-500 transition-colors w-full"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all ${previewMode ? 'bg-violet-600 text-white' : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
          >
            <LuEye size={13} /> {previewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button onClick={handleSave} disabled={saving} className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-60 ${saved ? 'bg-emerald-600 text-white' : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
            {saving ? <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : saved ? <><LuCheck size={13} /> Saved</> : <><LuSave size={13} /> Save Draft</>}
          </button>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer">
            <option>Draft</option>
            <option>Review</option>
            <option>Published</option>
          </select>
        </div>
      </div>

      <div className={`max-w-3xl mx-auto space-y-4 ${previewMode ? 'p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)]' : ''}`}>
        {previewMode && (
          <div className="flex items-center gap-2 pb-4 border-b border-[var(--color-border)] mb-6">
            <LuPlay size={14} className="text-violet-400" />
            <span className="text-xs font-mono text-[var(--color-muted)]">Learner Preview — {lessonTitle}</span>
          </div>
        )}

        {blocks.map((block, i) => (
          <ContentBlock
            key={block.id} block={block}
            onUpdate={(updated) => updateBlock(block.id, updated)}
            onDelete={() => deleteBlock(block.id)}
            onMoveUp={() => moveBlock(i, -1)}
            onMoveDown={() => moveBlock(i, 1)}
            isFirst={i === 0} isLast={i === blocks.length - 1}
            previewMode={previewMode}
          />
        ))}

        {!previewMode && (
          <div className="relative">
            <button
              onClick={() => setShowBlockPicker(!showBlockPicker)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:text-violet-400 hover:border-violet-500/40 transition-all cursor-pointer"
            >
              <LuPlus size={14} /> Add Content Block
            </button>
            {showBlockPicker && (
              <div className="absolute top-full left-0 right-0 z-30 mt-2 p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl shadow-black/20 grid grid-cols-3 sm:grid-cols-6 gap-2">
                {BLOCK_TYPES.map(bt => {
                  const Icon = bt.icon;
                  return (
                    <button key={bt.type} onClick={() => addBlock(bt.type)}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-[var(--color-background)] transition-colors cursor-pointer group">
                      <div className={`p-2 rounded-lg ${bt.color}`}><Icon size={14} /></div>
                      <span className="text-[10px] text-[var(--color-muted)] group-hover:text-[var(--color-text)] text-center leading-tight">{bt.label}</span>
                    </button>
                  );
                })}
                <button onClick={() => setShowBlockPicker(false)} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-rose-500/10 cursor-pointer">
                  <div className="p-2 rounded-lg text-rose-400 bg-rose-500/10"><LuX size={14} /></div>
                  <span className="text-[10px] text-rose-400">Cancel</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!previewMode && (
        <div className="text-center text-xs text-[var(--color-muted)] font-mono">
          {blocks.length} block{blocks.length !== 1 ? 's' : ''} · Hover a block to reorder or delete
        </div>
      )}
    </div>
  );
}
