"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  LuCircuitBoard, LuPlus, LuTrash2, LuPencil, LuLoader, LuSearch, LuTag,
  LuCpu, LuCode, LuSave, LuX, LuPlay, LuCopy, LuCircleCheckBig, LuClock,
} from 'react-icons/lu';
import { apiFetch } from '../../../services/api';

const FRAMEWORKS = ['qiskit', 'pennylane', 'cirq', 'qbraid'];
const FRAMEWORK_COLORS = {
  qiskit: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  pennylane: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  cirq: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  qbraid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};



function CircuitCard({ circuit, onOpen, onDelete, onRun }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fc = FRAMEWORK_COLORS[circuit.framework] || 'text-[var(--color-muted)] bg-[var(--color-border)]/20 border-[var(--color-border)]';

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (circuit.circuitCode) {
      await navigator.clipboard.writeText(circuit.circuitCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${circuit.name}"?`)) return;
    setDeleting(true);
    await onDelete(circuit.id);
    setDeleting(false);
  };

  return (
    <div className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-lg hover:shadow-[var(--color-primary)]/5 transition-all">
      {/* Code preview */}
      <div className="px-5 pt-5 pb-3 cursor-pointer" onClick={() => onOpen(circuit)}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-[var(--color-text)] truncate">{circuit.name}</h3>
            <p className="text-xs text-[var(--color-muted)] mt-0.5 line-clamp-2">{circuit.description || 'No description'}</p>
          </div>
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border flex-shrink-0 ${fc}`}>
            {circuit.framework}
          </span>
        </div>

        {/* Code preview block */}
        {circuit.circuitCode && (
          <pre className="px-3 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[9px] font-mono text-[var(--color-muted)] overflow-hidden max-h-20 line-clamp-4 whitespace-pre-wrap">
            {circuit.circuitCode.slice(0, 200)}
          </pre>
        )}
      </div>

      {/* Tags */}
      {circuit.tags?.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {circuit.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-mono">
              #{tag}
            </span>
          ))}
          {circuit.tags.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-border)]/30 text-[var(--color-muted)] font-mono">
              +{circuit.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-muted)] font-mono">
          <LuClock size={10} />
          {new Date(circuit.createdAt).toLocaleDateString()}
          {circuit.isPublic && (
            <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Public</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleCopy} className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors" title="Copy code">
            {copied ? <LuCircleCheckBig size={13} className="text-emerald-400" /> : <LuCopy size={13} />}
          </button>
          <button onClick={e => { e.stopPropagation(); onRun(circuit); }} className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors" title="Run in playground">
            <LuPlay size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); onOpen(circuit); }} className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/30 transition-colors" title="Edit">
            <LuPencil size={13} />
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40" title="Delete">
            {deleting ? <LuLoader size={13} className="animate-spin" /> : <LuTrash2 size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveCircuitModal({ onClose, onSave, initial = null }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    circuitCode: initial?.circuitCode || '',
    framework: initial?.framework || 'qiskit',
    backend: initial?.backend || 'qiskit_aer',
    tags: initial?.tags?.join(', ') || '',
    isPublic: initial?.isPublic || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('Circuit name is required.'); return; }
    if (!form.circuitCode) { setError('Circuit code is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      const url = isEdit ? `/learner/circuits/${initial.id}` : '/learner/circuits';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (res?.success) { onSave(res.data.circuit, isEdit); onClose(); }
      else setError(res?.error || 'Failed to save circuit.');
    } catch (err) { setError(err.message || 'Failed to save circuit.'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <LuCircuitBoard size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[var(--color-text)]">{isEdit ? 'Edit Circuit' : 'Save Circuit'}</h2>
              <p className="text-xs text-[var(--color-muted)]">Save your quantum circuit to your library</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-background)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
            <LuX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <LuX size={13} />{error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">Circuit Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Bell State Circuit"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">Framework</label>
              <select value={form.framework} onChange={e => setForm(f => ({ ...f, framework: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none">
                {FRAMEWORKS.map(fw => <option key={fw} value={fw}>{fw}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">Description</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of what this circuit does..."
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">Circuit Code *</label>
            <textarea rows={10} value={form.circuitCode} onChange={e => setForm(f => ({ ...f, circuitCode: e.target.value }))} placeholder="# Paste or write your quantum circuit code here..."
              spellCheck={false}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 resize-none leading-relaxed" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="entanglement, bell-state, 2-qubit"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))}
                className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${form.isPublic ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)]/30'}`}>
                {form.isPublic ? <LuCircleCheckBig size={14} /> : <LuCircuitBoard size={14} />}
                {form.isPublic ? 'Public' : 'Private'}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? <LuLoader size={15} className="animate-spin" /> : <LuSave size={15} />}
              {isEdit ? 'Update' : 'Save Circuit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function SavedCircuitsView() {
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showSave, setShowSave] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const fetchCircuits = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (frameworkFilter) params.set('framework', frameworkFilter);
      if (tagFilter) params.set('tags', tagFilter);
      const res = await apiFetch(`/learner/circuits?${params}`);
      if (res?.success) { setCircuits(res.data.circuits); setTotal(res.data.total); }
    } catch (err) {
      console.warn('Could not fetch circuits:', err);
      setCircuits([]);
      setTotal(0);
    }
    setLoading(false);
  }, [search, frameworkFilter, tagFilter]);

  useEffect(() => { fetchCircuits(); }, [fetchCircuits]);

  const handleSave = (circuit, isEdit) => {
    if (isEdit) {
      setCircuits(prev => prev.map(c => c.id === circuit.id ? circuit : c));
    } else {
      setCircuits(prev => [circuit, ...prev]);
      setTotal(t => t + 1);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/learner/circuits/${id}`, { method: 'DELETE' });
      setCircuits(prev => prev.filter(c => c.id !== id));
      setTotal(t => t - 1);
    } catch (err) { console.error(err); }
  };

  const handleRun = (circuit) => {
    // In a real app, open in playground with circuit code pre-loaded
    const url = `/playground?circuit=${encodeURIComponent(circuit.circuitCode || '')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--color-text)]">Saved Circuits</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">{total.toLocaleString()} circuits in your library</p>
        </div>
        <button onClick={() => { setEditTarget(null); setShowSave(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-[var(--color-primary)]/20 flex-shrink-0">
          <LuPlus size={16} /> Save Circuit
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input type="text" placeholder="Search circuits by name, description..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
        </div>
        <select value={frameworkFilter} onChange={e => setFrameworkFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none">
          <option value="">All Frameworks</option>
          {FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <div className="relative">
          <LuTag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input type="text" placeholder="Filter by tag..."
            value={tagFilter} onChange={e => setTagFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all min-w-[150px]" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LuLoader size={24} className="text-[var(--color-primary)] animate-spin" />
        </div>
      ) : circuits.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-16 text-center">
          <LuCircuitBoard size={40} className="text-[var(--color-muted)] mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">No saved circuits</h3>
          <p className="text-sm text-[var(--color-muted)] mb-5">Save your quantum circuits to reuse them later</p>
          <button onClick={() => setShowSave(true)} className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-all">
            <LuPlus size={14} className="inline mr-1.5" /> Save First Circuit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {circuits.map(c => (
            <CircuitCard key={c.id} circuit={c}
              onOpen={circuit => { setEditTarget(circuit); setShowSave(true); }}
              onDelete={handleDelete}
              onRun={handleRun}
            />
          ))}
        </div>
      )}

      {showSave && (
        <SaveCircuitModal
          initial={editTarget}
          onClose={() => { setShowSave(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
