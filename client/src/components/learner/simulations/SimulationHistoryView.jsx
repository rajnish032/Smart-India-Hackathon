"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  LuHistory, LuLoader, LuTrash2, LuRefreshCcw, LuChevronRight, LuFilter,
  LuCircleCheckBig, LuCircleX, LuClock, LuSearch, LuActivity,
  LuCpu, LuZap, LuDatabase, LuGitCompare, LuDownload, LuX, LuCalendar,
  LuFlaskConical,
} from 'react-icons/lu';
import { apiFetch } from '../../../services/api';

const BACKENDS = ['qiskit_aer', 'pennylane', 'cirq', 'qbraid'];
const FRAMEWORKS = ['qiskit', 'pennylane', 'cirq', 'qbraid'];
const STATUSES = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'];

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', icon: LuClock, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
  RUNNING: { label: 'Running', icon: LuLoader, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', animate: true },
  COMPLETED: { label: 'Completed', icon: LuCircleCheckBig, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  FAILED: { label: 'Failed', icon: LuCircleX, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
};

const BACKEND_COLORS = {
  qiskit_aer: 'text-indigo-400',
  pennylane: 'text-violet-400',
  cirq: 'text-cyan-400',
  qbraid: 'text-emerald-400',
};



function RunDetailPanel({ run, onClose, onRerun, onDelete }) {
  const [rerunning, setRerunning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleRerun = async () => {
    setRerunning(true);
    await onRerun(run.id);
    setRerunning(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this simulation run?')) return;
    setDeleting(true);
    await onDelete(run.id);
    setDeleting(false);
    onClose();
  };

  const r = run.results || {};
  const sc = STATUS_CONFIG[run.status] || STATUS_CONFIG.COMPLETED;
  const StatusIcon = sc.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 py-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <LuActivity size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--color-text)]">Simulation Run</div>
              <div className="text-[10px] font-mono text-[var(--color-muted)]">{run.id?.slice(0, 16)}…</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-background)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
            <LuX size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status & meta */}
          <div className="flex items-center flex-wrap gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${sc.bg} ${sc.color}`}>
              <StatusIcon size={12} className={sc.animate ? 'animate-spin' : ''} />{sc.label}
            </span>
            <span className={`text-xs font-mono font-semibold ${BACKEND_COLORS[run.backend] || 'text-[var(--color-muted)]'}`}>{run.backend}</span>
            <span className="text-xs text-[var(--color-muted)]">{run.framework}</span>
            <span className="text-xs text-[var(--color-muted)] flex items-center gap-1"><LuCalendar size={11} />{new Date(run.createdAt).toLocaleString()}</span>
          </div>

          {run.experiment && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
              <LuFlaskConical size={14} className="text-[var(--color-primary)]" />
              <span className="text-xs text-[var(--color-muted)]">From experiment:</span>
              <span className="text-xs font-semibold text-[var(--color-text)]">{run.experiment.name}</span>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Exec Time', value: run.executionTimeMs ? `${run.executionTimeMs}ms` : r.executionTimeMs ? `${r.executionTimeMs}ms` : 'N/A', icon: LuZap, color: 'text-amber-400' },
              { label: 'Depth', value: run.depth ?? r.depth ?? 'N/A', icon: LuDatabase, color: 'text-violet-400' },
              { label: 'Gates', value: run.gateCount ?? r.gateCount ?? 'N/A', icon: LuCpu, color: 'text-cyan-400' },
              { label: 'Fidelity', value: (run.fidelity ?? r.fidelity) != null ? `${((run.fidelity ?? r.fidelity) * 100).toFixed(1)}%` : 'N/A', icon: LuCircleCheckBig, color: 'text-emerald-400' },
            ].map(m => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-center">
                  <Icon size={15} className={`mx-auto mb-1 ${m.color}`} />
                  <div className="text-sm font-bold font-mono text-[var(--color-text)]">{m.value}</div>
                  <div className="text-[10px] text-[var(--color-muted)]">{m.label}</div>
                </div>
              );
            })}
          </div>

          {/* Probabilities */}
          {r.probabilities && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[var(--color-text)]">Measurement Probabilities ({(run.shots || r.shots || 1024).toLocaleString()} shots)</h4>
              {Object.entries(r.probabilities).map(([state, prob]) => (
                <div key={state} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--color-muted)] w-8 flex-shrink-0">|{state}⟩</span>
                  <div className="flex-1 h-2 bg-[var(--color-border)]/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full" style={{ width: `${prob * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs text-[var(--color-muted)] w-12 text-right flex-shrink-0">{(prob * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Code snippet */}
          {run.circuitCode && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--color-text)] mb-2">Circuit Code</h4>
              <pre className="px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[10px] font-mono text-[var(--color-muted)] overflow-x-auto max-h-32 whitespace-pre-wrap">
                {run.circuitCode.slice(0, 500)}{run.circuitCode.length > 500 ? '...' : ''}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={handleRerun} disabled={rerunning} className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-50">
              {rerunning ? <LuLoader size={13} className="animate-spin" /> : <LuRefreshCcw size={13} />} Re-run
            </button>
            <button onClick={handleDelete} disabled={deleting} className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              {deleting ? <LuLoader size={13} className="animate-spin" /> : <LuTrash2 size={13} />} Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function SimulationHistoryView() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  // Filters
  const [filters, setFilters] = useState({ backend: '', framework: '', status: '', from: '', to: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', 15);
      if (filters.backend) params.set('backend', filters.backend);
      if (filters.framework) params.set('framework', filters.framework);
      if (filters.status) params.set('status', filters.status);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);

      const res = await apiFetch(`/learner/simulations?${params}`);
      if (res?.success) {
        setRuns(res.data.runs);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.warn('Could not fetch simulations:', err);
      setRuns([]);
      setTotal(0);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/learner/simulations/${id}`, { method: 'DELETE' });
      setRuns(prev => prev.filter(r => r.id !== id));
      setTotal(t => t - 1);
    } catch (err) { console.error(err); }
  };

  const handleRerun = async (id) => {
    try {
      const res = await apiFetch(`/learner/simulations/${id}/rerun`, { method: 'POST', body: JSON.stringify({}) });
      if (res?.success) {
        setRuns(prev => [res.data.run, ...prev]);
        setTotal(t => t + 1);
      }
    } catch (err) { console.error(err); }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--color-text)]">Simulation History</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">{total.toLocaleString()} total runs</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <LuSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input type="text" placeholder="Search by circuit code, backend, experiment..."
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-colors ${showFilters ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
          <LuFilter size={14} /> Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {[
            { key: 'backend', label: 'Backend', options: BACKENDS },
            { key: 'framework', label: 'Framework', options: FRAMEWORKS },
            { key: 'status', label: 'Status', options: STATUSES },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">{label}</label>
              <select value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none">
                <option value="">All</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {['from', 'to'].map(key => (
            <div key={key}>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">{key === 'from' ? 'From Date' : 'To Date'}</label>
              <input type="date" value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none" />
            </div>
          ))}
          {activeFilterCount > 0 && (
            <div className="flex items-end">
              <button onClick={() => setFilters({ backend: '', framework: '', status: '', from: '', to: '', search: '' })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs text-rose-400 hover:bg-rose-500/10 transition-colors">
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LuLoader size={24} className="text-[var(--color-primary)] animate-spin" />
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-16 text-center">
          <LuHistory size={40} className="text-[var(--color-muted)] mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">No simulation runs found</h3>
          <p className="text-sm text-[var(--color-muted)]">Run an experiment or backend comparison to see history here</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px_100px] gap-4 px-5 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              <span>Circuit / Experiment</span>
              <span>Backend</span>
              <span>Status</span>
              <span>Exec Time</span>
              <span>Shots</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Rows */}
            {runs.map((run, i) => {
              const sc = STATUS_CONFIG[run.status] || STATUS_CONFIG.COMPLETED;
              const StatusIcon = sc.icon;
              return (
                <div key={run.id} className={`grid grid-cols-[2fr_1fr_1fr_1fr_80px_100px] gap-4 px-5 py-4 items-center border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]/50 transition-colors ${i % 2 === 0 ? 'bg-[var(--color-background)]/30' : ''}`}>
                  {/* Circuit / Experiment */}
                  <div className="min-w-0">
                    {run.experiment ? (
                      <div className="flex items-center gap-1.5">
                        <LuFlaskConical size={11} className="text-[var(--color-primary)] flex-shrink-0" />
                        <span className="text-xs font-semibold text-[var(--color-text)] truncate">{run.experiment.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-[var(--color-muted)] truncate block">
                        {run.circuitCode?.split('\n')[0]?.slice(0, 40) || 'Circuit'}
                      </span>
                    )}
                    <div className="text-[10px] text-[var(--color-muted)] font-mono mt-0.5">{new Date(run.createdAt).toLocaleString()}</div>
                  </div>

                  {/* Backend */}
                  <span className={`text-xs font-mono font-semibold ${BACKEND_COLORS[run.backend] || 'text-[var(--color-muted)]'}`}>
                    {run.backend}
                  </span>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${sc.color}`}>
                    <StatusIcon size={11} className={sc.animate ? 'animate-spin' : ''} />
                    {sc.label}
                  </span>

                  {/* Exec Time */}
                  <span className="text-xs font-mono text-[var(--color-muted)]">
                    {run.executionTimeMs || run.results?.executionTimeMs ? `${run.executionTimeMs || run.results?.executionTimeMs}ms` : '—'}
                  </span>

                  {/* Shots */}
                  <span className="text-xs font-mono text-[var(--color-muted)]">{(run.shots || 1024).toLocaleString()}</span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelected(run)} className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/30 transition-colors" title="View details">
                      <LuChevronRight size={14} />
                    </button>
                    <button onClick={() => handleRerun(run.id)} className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors" title="Re-run">
                      <LuRefreshCcw size={14} />
                    </button>
                    <button onClick={() => handleDelete(run.id)} className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete">
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {total > 15 && (
            <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
              <span>Page {page} · {total.toLocaleString()} total runs</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] disabled:opacity-40 hover:border-[var(--color-primary)]/40 transition-colors">Prev</button>
                <button disabled={page * 15 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] disabled:opacity-40 hover:border-[var(--color-primary)]/40 transition-colors">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail panel */}
      {selected && (
        <RunDetailPanel
          run={selected}
          onClose={() => setSelected(null)}
          onRerun={handleRerun}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
