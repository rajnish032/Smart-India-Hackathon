"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  LuGitCompare, LuPlay, LuLoader, LuZap, LuCpu, LuDatabase, LuCircleCheckBig,
  LuDownload, LuChartBar, LuActivity, LuCode, LuHistory, LuX, LuChevronDown,
  LuTriangleAlert, LuStar,
} from 'react-icons/lu';
import { apiFetch } from '../../../services/api';

const BACKENDS = [
  { id: 'qiskit_aer', label: 'Qiskit Aer', framework: 'qiskit', color: 'indigo', desc: 'High-performance local Aer simulator' },
  { id: 'pennylane', label: 'PennyLane', framework: 'pennylane', color: 'violet', desc: 'Differentiable quantum computing' },
  { id: 'cirq', label: 'Cirq', framework: 'cirq', color: 'cyan', desc: "Google's quantum circuit library" },
  { id: 'qbraid', label: 'qBraid', framework: 'qbraid', color: 'emerald', desc: 'Unified cloud quantum access layer' },
];

const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', bar: 'bg-indigo-500' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', bar: 'bg-violet-500' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', bar: 'bg-cyan-500' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', bar: 'bg-emerald-500' },
};

const DEFAULT_CIRCUIT = `from qiskit import QuantumCircuit

# Bell State Circuit - 2 qubits
qc = QuantumCircuit(2, 2)
qc.h(0)      # Superposition
qc.cx(0, 1)  # Entanglement
qc.measure([0, 1], [0, 1])
`;

function BackendSelector({ selected, onToggle }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
        Select Backends to Compare (min 2)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BACKENDS.map(b => {
          const c = COLOR_MAP[b.color];
          const isSelected = selected.includes(b.id);
          return (
            <button key={b.id} onClick={() => onToggle(b.id)}
              className={`relative p-4 rounded-2xl border text-left transition-all ${isSelected ? `${c.bg} ${c.border}` : 'border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-primary)]/30'}`}
            >
              {isSelected && (
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${c.bg} ${c.border} border`}>
                  <LuCircleCheckBig size={12} className={c.text} />
                </div>
              )}
              <div className={`text-sm font-bold mb-0.5 ${isSelected ? c.text : 'text-[var(--color-text)]'}`}>{b.label}</div>
              <div className="text-[10px] text-[var(--color-muted)] leading-tight">{b.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetricBar({ label, values, unit = '', lowerBetter = false }) {
  const nums = values.map(v => v ?? 0);
  const max = Math.max(...nums, 1);
  const best = lowerBetter ? Math.min(...nums.filter(v => v > 0)) : Math.max(...nums);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--color-text)]">{label}</span>
        {lowerBetter && <span className="text-[10px] text-[var(--color-muted)]">lower is better</span>}
      </div>
      <div className="space-y-2">
        {values.map((v, i) => {
          const b = BACKENDS[i];
          if (!b) return null;
          const c = COLOR_MAP[b.color];
          const pct = max > 0 ? ((v ?? 0) / max) * 100 : 0;
          const isBest = (v != null) && (lowerBetter ? v === best : v === best);
          return (
            <div key={b.id} className="flex items-center gap-3">
              <span className={`text-xs font-mono w-20 flex-shrink-0 ${c.text}`}>{b.label}</span>
              <div className="flex-1 h-2 bg-[var(--color-border)]/30 rounded-full overflow-hidden">
                <div className={`h-full ${c.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center gap-1 w-20 flex-shrink-0 justify-end">
                <span className="text-xs font-mono font-semibold text-[var(--color-text)]">{v != null ? `${v}${unit}` : 'N/A'}</span>
                {isBest && <LuStar size={10} className="text-amber-400 flex-shrink-0" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComparisonResultCard({ result, index }) {
  const b = BACKENDS.find(b => b.id === result.backend) || BACKENDS[index % BACKENDS.length];
  const c = COLOR_MAP[b?.color || 'indigo'];
  const r = result.results || {};
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-2xl border ${c.border} bg-[var(--color-surface)] overflow-hidden`}>
      {/* Header */}
      <div className={`${c.bg} px-5 py-4 flex items-center justify-between`}>
        <div>
          <div className={`text-sm font-bold ${c.text}`}>{result.label || b?.label || result.backend}</div>
          <div className="text-[10px] text-[var(--color-muted)] font-mono mt-0.5">{result.framework}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold font-mono text-[var(--color-text)]">{r.executionTimeMs ? `${r.executionTimeMs}ms` : '—'}</div>
          <div className="text-[10px] text-[var(--color-muted)]">exec time</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-5 py-4 grid grid-cols-3 gap-4 border-b border-[var(--color-border)]">
        {[
          { label: 'Depth', value: r.depth ?? 'N/A' },
          { label: 'Gates', value: r.gateCount ?? 'N/A' },
          { label: 'Fidelity', value: r.fidelity != null ? `${(r.fidelity * 100).toFixed(1)}%` : 'N/A' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-sm font-bold font-mono text-[var(--color-text)]">{s.value}</div>
            <div className="text-[10px] text-[var(--color-muted)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Probabilities */}
      {r.probabilities && (
        <div className="px-5 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text)]">Probabilities</span>
            <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-[var(--color-muted)] flex items-center gap-1 hover:text-[var(--color-text)] transition-colors">
              {expanded ? 'Show less' : 'Show all'} <LuChevronDown size={10} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="space-y-1.5">
            {Object.entries(r.probabilities).slice(0, expanded ? 100 : 4).map(([state, prob]) => (
              <div key={state} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[var(--color-muted)] w-6 flex-shrink-0">|{state}⟩</span>
                <div className="flex-1 h-1.5 bg-[var(--color-border)]/30 rounded-full overflow-hidden">
                  <div className={`h-full ${c.bar} rounded-full`} style={{ width: `${prob * 100}%` }} />
                </div>
                <span className="text-[10px] font-mono text-[var(--color-muted)] w-10 text-right flex-shrink-0">{(prob * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PastComparisons({ comparisons, onSelect }) {
  if (comparisons.length === 0) return null;
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3">
      <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
        <LuHistory size={15} className="text-[var(--color-muted)]" /> Past Comparisons
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {comparisons.map(c => (
          <button key={c.id} onClick={() => onSelect(c)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-background)] border border-transparent hover:border-[var(--color-border)] transition-all text-left">
            <LuChartBar size={15} className="text-[var(--color-muted)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[var(--color-text)] truncate">{c.name}</div>
              <div className="text-[10px] text-[var(--color-muted)] font-mono">{c.backends?.join(' · ')} · {new Date(c.createdAt).toLocaleDateString()}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function BackendCompareView() {
  const [selectedBackends, setSelectedBackends] = useState(['qiskit_aer', 'pennylane']);
  const [circuitCode, setCircuitCode] = useState(DEFAULT_CIRCUIT);
  const [shots, setShots] = useState(1024);
  const [compName, setCompName] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pastComparisons, setPastComparisons] = useState([]);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('setup'); // setup | results

  const fetchPast = useCallback(async () => {
    try {
      const res = await apiFetch('/learner/simulations/comparisons');
      if (res?.success) setPastComparisons(res.data.comparisons);
    } catch {}
  }, []);

  useEffect(() => { fetchPast(); }, [fetchPast]);

  const toggleBackend = (id) => {
    setSelectedBackends(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(b => b !== id) : prev) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedBackends.length < 2) { setError('Select at least 2 backends.'); return; }
    if (!circuitCode.trim()) { setError('Circuit code is required.'); return; }
    setError('');
    setRunning(true);
    try {
      const res = await apiFetch('/learner/simulations/compare', {
        method: 'POST',
        body: JSON.stringify({
          circuitCode,
          backends: selectedBackends,
          shots: parseInt(shots),
          name: compName || `Comparison ${new Date().toLocaleDateString()}`,
        }),
      });
      if (res?.success) {
        setResults(res.data.results);
        setSummary(res.data.summary);
        setActiveView('results');
        fetchPast();
      } else {
        setError(res?.error || 'Comparison failed.');
      }
    } catch (err) {
      setError(err.message || 'Comparison failed.');
    }
    setRunning(false);
  };

  const handleExport = () => {
    if (!results) return;
    const json = JSON.stringify({ summary, results, circuitCode, backends: selectedBackends, shots, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `comparison_${Date.now()}.json`;
    a.click();
  };

  const loadPastComparison = (c) => {
    setResults(c.runs);
    setSummary(c.summary);
    setCircuitCode(c.circuitCode);
    setSelectedBackends(c.backends);
    setActiveView('results');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--color-text)]">Backend Comparison</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Run the same circuit across multiple backends and compare results side-by-side</p>
        </div>
        {results && (
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setActiveView(v => v === 'setup' ? 'results' : 'setup')} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
              {activeView === 'setup' ? 'View Results' : 'Edit Setup'}
            </button>
            <button onClick={handleExport} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1.5">
              <LuDownload size={13} /> Export
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <LuTriangleAlert size={14} />{error}
          <button onClick={() => setError('')} className="ml-auto"><LuX size={12} /></button>
        </div>
      )}

      {activeView === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: setup */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2"><LuCode size={15} />Circuit Code</h3>
              <textarea
                value={circuitCode}
                onChange={e => setCircuitCode(e.target.value)}
                rows={12}
                spellCheck={false}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none leading-relaxed"
              />
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
              <BackendSelector selected={selectedBackends} onToggle={toggleBackend} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">Comparison Name</label>
                  <input type="text" placeholder={`Comparison ${new Date().toLocaleDateString()}`} value={compName} onChange={e => setCompName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">Shots: {Number(shots).toLocaleString()}</label>
                  <input type="range" min={100} max={10000} step={100} value={shots} onChange={e => setShots(e.target.value)} className="w-full mt-1.5 accent-[var(--color-primary)]" />
                  <div className="flex justify-between text-[10px] text-[var(--color-muted)] font-mono mt-1"><span>100</span><span>10,000</span></div>
                </div>
              </div>

              <button onClick={handleCompare} disabled={running || selectedBackends.length < 2}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--color-primary)]/20">
                {running ? <LuLoader size={16} className="animate-spin" /> : <LuPlay size={16} />}
                {running ? `Running on ${selectedBackends.length} backends...` : `Compare ${selectedBackends.length} Backends`}
              </button>
            </div>
          </div>

          {/* Right: past comparisons */}
          <div>
            <PastComparisons comparisons={pastComparisons} onSelect={loadPastComparison} />
          </div>
        </div>
      )}

      {activeView === 'results' && results && (
        <div className="space-y-6">
          {/* Summary banner */}
          {summary && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/5 via-[var(--color-surface)] to-[var(--color-secondary)]/5 p-5">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <LuStar size={15} className="text-amber-400" /> Comparison Summary
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Fastest Backend', value: BACKENDS.find(b => b.id === summary.fastestBackend)?.label || summary.fastestBackend, icon: LuZap, color: 'text-amber-400' },
                  { label: 'Highest Fidelity', value: BACKENDS.find(b => b.id === summary.highestFidelity)?.label || summary.highestFidelity, icon: LuCircleCheckBig, color: 'text-emerald-400' },
                  { label: 'Lowest Depth', value: BACKENDS.find(b => b.id === summary.lowestDepth)?.label || summary.lowestDepth, icon: LuDatabase, color: 'text-cyan-400' },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
                      <Icon size={18} className={`mx-auto mb-1.5 ${s.color}`} />
                      <div className="text-sm font-bold text-[var(--color-text)]">{s.value}</div>
                      <div className="text-[10px] text-[var(--color-muted)]">{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metric bars */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
            <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2"><LuChartBar size={15} />Side-by-Side Metrics</h3>
            <MetricBar label="Execution Time (ms)" values={results.map(r => r.results?.executionTimeMs)} unit="ms" lowerBetter />
            <MetricBar label="Circuit Depth" values={results.map(r => r.results?.depth)} lowerBetter />
            <MetricBar label="Gate Count" values={results.map(r => r.results?.gateCount)} lowerBetter />
            <MetricBar label="Fidelity" values={results.map(r => r.results?.fidelity ? Math.round(r.results.fidelity * 100) : null)} unit="%" />
          </div>

          {/* Per-backend cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((r, i) => <ComparisonResultCard key={i} result={r} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
