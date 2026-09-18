"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  LuFlaskConical, LuPlus, LuPlay, LuSave, LuTrash2, LuPencil, LuChevronRight,
  LuLoader, LuCircleCheckBig, LuCircleX, LuClock, LuTarget, LuLightbulb,
  LuCode, LuSettings2, LuBrain, LuArrowLeft, LuRefreshCcw, LuDownload,
  LuActivity, LuCpu, LuZap, LuDatabase,
} from 'react-icons/lu';
import { apiFetch } from '../../../services/api';
import NewExperimentWizard from './NewExperimentWizard';

const BACKENDS = [
  { id: 'qiskit_aer', label: 'Qiskit Aer', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  { id: 'pennylane', label: 'PennyLane', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  { id: 'cirq', label: 'Cirq', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  { id: 'qbraid', label: 'qBraid', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
];

const FRAMEWORKS = ['qiskit', 'pennylane', 'cirq', 'qbraid'];

const STATUS_STYLES = {
  DRAFT: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  RUNNING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  FAILED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  ARCHIVED: 'bg-slate-600/15 text-slate-500 border-slate-600/30',
};

const DEFAULT_CIRCUIT_CODE = `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create a 2-qubit Bell state circuit
qc = QuantumCircuit(2, 2)
qc.h(0)          # Hadamard gate on qubit 0
qc.cx(0, 1)      # CNOT gate
qc.measure([0, 1], [0, 1])

print(qc.draw())
`;

function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border capitalize ${STATUS_STYLES[status] || STATUS_STYLES.DRAFT}`}>
      {status?.toLowerCase()}
    </span>
  );
}

function ExperimentCard({ exp, onOpen, onDelete, onRun }) {
  const [deleting, setDeleting] = useState(false);
  const [running, setRunning] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this experiment?')) return;
    setDeleting(true);
    await onDelete(exp.id);
    setDeleting(false);
  };

  const handleRun = async (e) => {
    e.stopPropagation();
    setRunning(true);
    await onRun(exp.id);
    setRunning(false);
  };

  return (
    <div
      onClick={() => onOpen(exp)}
      className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-primary)]/40 hover:shadow-lg hover:shadow-[var(--color-primary)]/5 transition-all cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-[var(--color-text)] truncate">{exp.name}</h3>
            <StatusBadge status={exp.status} />
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-2">{exp.objective}</p>
        </div>
        <LuChevronRight size={16} className="text-[var(--color-muted)] flex-shrink-0 mt-1 group-hover:text-[var(--color-primary)] transition-colors" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 flex-wrap text-[10px] font-mono text-[var(--color-muted)]">
        <span className="flex items-center gap-1"><LuCpu size={10} />{exp.backend || 'qiskit_aer'}</span>
        {exp._count?.simulationRuns > 0 && (
          <span className="flex items-center gap-1"><LuActivity size={10} />{exp._count.simulationRuns} runs</span>
        )}
        <span className="flex items-center gap-1"><LuClock size={10} />{new Date(exp.updatedAt).toLocaleDateString()}</span>
        {exp.tags?.length > 0 && (
          <span className="flex items-center gap-1 text-[var(--color-primary)]">
            {exp.tags.slice(0, 2).join(', ')}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={handleRun}
          disabled={running || exp.status === 'RUNNING' || !exp.circuitCode?.trim()}
          className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors disabled:opacity-50"
          title={!exp.circuitCode?.trim() ? "Add circuit code to run" : "Run experiment"}
        >
          {running ? <LuLoader size={13} className="animate-spin" /> : <LuPlay size={13} />}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
          title="Delete experiment"
        >
          {deleting ? <LuLoader size={13} className="animate-spin" /> : <LuTrash2 size={13} />}
        </button>
      </div>
    </div>
  );
}


function ExperimentDetail({ exp: initialExp, onBack, onRefresh }) {
  const [exp, setExp] = useState(initialExp);
  const [tab, setTab] = useState('circuit'); // circuit | params | results | observations
  const [circuitCode, setCircuitCode] = useState(initialExp.circuitCode || '');
  const [backend, setBackend] = useState(initialExp.backend || 'qiskit_aer');
  const [framework, setFramework] = useState(initialExp.framework || 'qiskit');
  const [shots, setShots] = useState((initialExp.parameters?.shots) || 1024);
  const [observations, setObservations] = useState(initialExp.observations || '');
  const [hypothesis, setHypothesis] = useState(initialExp.hypothesis || '');
  const [noiseEnabled, setNoiseEnabled] = useState(false);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const latestRun = exp.simulationRuns?.[0];

  const handleRun = async () => {
    setRunning(true);
    setStatusMsg('');
    try {
      const res = await apiFetch(`/learner/experiments/${exp.id}/run`, {
        method: 'POST',
        body: JSON.stringify({ circuitCode, backend, framework, shots: parseInt(shots), noiseConfig: noiseEnabled ? { depolarizing: 0.001 } : null }),
      });
      if (res?.success) {
        setExp(res.data.experiment);
        setLastResult(res.data.simulationRun?.results);
        setStatusMsg('Run completed successfully!');
        setTab('results');
        onRefresh?.();
      } else {
        setStatusMsg(`Error: ${res?.error || 'Run failed'}`);
      }
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    }
    setRunning(false);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/learner/experiments/${exp.id}/save-draft`, {
        method: 'POST',
        body: JSON.stringify({ circuitCode, backend, framework, observations, hypothesis, parameters: { shots: parseInt(shots) } }),
      });
      if (res?.success) { setExp(res.data.experiment); setStatusMsg('Draft saved!'); }
      else setStatusMsg(`Error: ${res?.error}`);
    } catch (err) { setStatusMsg(`Error: ${err.message}`); }
    setSaving(false);
  };

  const displayResult = lastResult || latestRun?.results;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-xl border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text)]/30 transition-colors">
          <LuArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-lg text-[var(--color-text)] truncate">{exp.name}</h2>
            <StatusBadge status={exp.status} />
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-0.5 truncate">{exp.objective}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleSaveDraft} disabled={saving} className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1.5 disabled:opacity-50">
            {saving ? <LuLoader size={13} className="animate-spin" /> : <LuSave size={13} />} Save Draft
          </button>
          <button onClick={handleRun} disabled={running || exp.status === 'RUNNING' || !circuitCode?.trim()} className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-50 shadow-md shadow-[var(--color-primary)]/20" title={!circuitCode?.trim() ? "Add circuit code to run" : "Run"}>
            {running ? <LuLoader size={13} className="animate-spin" /> : <LuPlay size={13} />}
            {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Status message */}
      {statusMsg && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${statusMsg.startsWith('Error') ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {statusMsg.startsWith('Error') ? <LuCircleX size={14} /> : <LuCircleCheckBig size={14} />}
          {statusMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
        {[
          { id: 'circuit', label: 'Circuit & Code', icon: LuCode },
          { id: 'params', label: 'Parameters', icon: LuSettings2 },
          { id: 'results', label: 'Results', icon: LuActivity },
          { id: 'observations', label: 'Observations', icon: LuBrain },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${tab === id ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* Circuit Tab */}
      {tab === 'circuit' && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Circuit Code</h3>
            <div className="flex items-center gap-2">
              <select value={framework} onChange={e => setFramework(e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none">
                {FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <textarea
            value={circuitCode}
            onChange={e => setCircuitCode(e.target.value)}
            rows={16}
            spellCheck={false}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none leading-relaxed"
          />
          <p className="text-xs text-[var(--color-muted)]">Write your quantum circuit code above. Supported frameworks: Qiskit, PennyLane, Cirq, qBraid.</p>
        </div>
      )}

      {/* Parameters Tab */}
      {tab === 'params' && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Execution Parameters</h3>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">Backend</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BACKENDS.map(b => (
                <button key={b.id} onClick={() => setBackend(b.id)} className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${backend === b.id ? b.color : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)]/30'}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">Shots (Measurements)</label>
            <div className="flex items-center gap-3">
              <input type="range" min={100} max={10000} step={100} value={shots} onChange={e => setShots(e.target.value)} className="flex-1 accent-[var(--color-primary)]" />
              <span className="font-mono text-sm font-bold text-[var(--color-text)] w-16 text-right">{Number(shots).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] text-[var(--color-muted)] mt-1 font-mono">
              <span>100</span><span>10,000</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">Noise Configuration</label>
            <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${noiseEnabled ? 'border-amber-500/30 bg-amber-500/5' : 'border-[var(--color-border)] bg-[var(--color-background)]'}`} onClick={() => setNoiseEnabled(!noiseEnabled)}>
              <div className={`w-10 h-5 rounded-full transition-all relative ${noiseEnabled ? 'bg-amber-500' : 'bg-[var(--color-border)]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${noiseEnabled ? 'left-5' : 'left-0.5'}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--color-text)]">Enable Noise Model</div>
                <div className="text-xs text-[var(--color-muted)]">Depolarizing noise (0.001) — simulates real hardware</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Tab */}
      {tab === 'results' && (
        <div className="space-y-4">
          {displayResult ? (
            <>
              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Exec Time', value: displayResult.executionTimeMs ? `${displayResult.executionTimeMs}ms` : 'N/A', icon: LuZap, color: 'text-amber-400' },
                  { label: 'Circuit Depth', value: displayResult.depth ?? 'N/A', icon: LuDatabase, color: 'text-violet-400' },
                  { label: 'Gate Count', value: displayResult.gateCount ?? 'N/A', icon: LuCpu, color: 'text-cyan-400' },
                  { label: 'Fidelity', value: displayResult.fidelity != null ? `${(displayResult.fidelity * 100).toFixed(1)}%` : 'N/A', icon: LuCircleCheckBig, color: 'text-emerald-400' },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                      <Icon size={18} className={`mx-auto mb-1.5 ${m.color}`} />
                      <div className="text-base font-bold font-mono text-[var(--color-text)]">{m.value}</div>
                      <div className="text-[10px] text-[var(--color-muted)] mt-0.5">{m.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Probability distribution */}
              {displayResult.probabilities && (
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-[var(--color-text)]">Measurement Probabilities</h4>
                  <div className="space-y-2.5">
                    {Object.entries(displayResult.probabilities).map(([state, prob]) => (
                      <div key={state} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-semibold text-[var(--color-text)]">|{state}⟩</span>
                          <span className="font-mono text-[var(--color-muted)]">{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-[var(--color-border)]/30 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700" style={{ width: `${prob * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Counts */}
              {displayResult.counts && (
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Raw Counts ({displayResult.shots?.toLocaleString()} shots)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(displayResult.counts).map(([state, count]) => (
                      <div key={state} className="rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] p-3 text-center">
                        <div className="text-sm font-mono font-bold text-[var(--color-text)]">|{state}⟩</div>
                        <div className="text-lg font-bold text-[var(--color-primary)] font-mono">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reproducibility metadata */}
              {exp.reproducibility && (
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Reproducibility Metadata</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                    {Object.entries(exp.reproducibility).map(([k, v]) => (
                      <div key={k} className="flex flex-col gap-0.5">
                        <span className="text-[var(--color-muted)] uppercase text-[10px]">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-[var(--color-text)] font-semibold truncate">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
              <LuActivity size={32} className="text-[var(--color-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--color-muted)]">No results yet. Run the experiment to see results here.</p>
              <button onClick={handleRun} disabled={!circuitCode?.trim()} className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
                <LuPlay size={14} /> Run Experiment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Observations Tab */}
      {tab === 'observations' && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">Hypothesis (Editable)</label>
            <textarea rows={3} value={hypothesis} onChange={e => setHypothesis(e.target.value)} placeholder="State your expected outcomes..."
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">Observations & Analysis</label>
            <textarea rows={8} value={observations} onChange={e => setObservations(e.target.value)} placeholder="Record what you observed after running the experiment. Compare with your hypothesis. Note any anomalies..."
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 resize-none leading-relaxed" />
          </div>
          <button onClick={handleSaveDraft} disabled={saving} className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
            {saving ? <LuLoader size={14} className="animate-spin" /> : <LuSave size={14} />} Save Observations
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function ExperimentsView() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiFetch(`/learner/experiments?${params}`);
      if (res?.success) { setExperiments(res.data.experiments); setTotal(res.data.total); }
    } catch (err) {
      console.warn('Could not fetch experiments:', err);
      setExperiments([]);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchExperiments(); }, [fetchExperiments]);

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/learner/experiments/${id}`, { method: 'DELETE' });
      setExperiments(prev => prev.filter(e => e.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleRun = async (id) => {
    try {
      const res = await apiFetch(`/learner/experiments/${id}/run`, { method: 'POST', body: JSON.stringify({}) });
      if (res?.success) fetchExperiments();
    } catch (err) { console.error(err); }
  };

  const handleOpen = async (exp) => {
    try {
      const res = await apiFetch(`/learner/experiments/${exp.id}`);
      setSelected(res?.success ? res.data.experiment : exp);
    } catch { setSelected(exp); }
  };

  if (showCreate) {
    return (
      <NewExperimentWizard
        onCancel={() => setShowCreate(false)}
        onComplete={(exp) => {
          setShowCreate(false);
          setExperiments(prev => [exp, ...prev]);
          setTotal(t => t + 1);
          setSelected(exp); // Optional: immediately open the saved experiment
        }}
      />
    );
  }

  if (selected) {
    return <ExperimentDetail exp={selected} onBack={() => setSelected(null)} onRefresh={fetchExperiments} />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--color-text)]">Experiments</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">{total} experiments · Design, run, and analyze quantum experiments</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-[var(--color-primary)]/20 flex-shrink-0">
          <LuPlus size={16} /> New Experiment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search experiments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all">
          <option value="">All Status</option>
          {['DRAFT', 'RUNNING', 'COMPLETED', 'FAILED', 'ARCHIVED'].map(s => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LuLoader size={24} className="text-[var(--color-primary)] animate-spin" />
        </div>
      ) : experiments.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-16 text-center">
          <LuFlaskConical size={40} className="text-[var(--color-muted)] mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">No experiments yet</h3>
          <p className="text-sm text-[var(--color-muted)] mb-5">Create your first quantum experiment to get started</p>
          <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-all">
            <LuPlus size={15} className="inline mr-1.5" /> Create Experiment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map(exp => (
            <ExperimentCard key={exp.id} exp={exp} onOpen={handleOpen} onDelete={handleDelete} onRun={handleRun} />
          ))}
        </div>
      )}


    </div>
  );
}
