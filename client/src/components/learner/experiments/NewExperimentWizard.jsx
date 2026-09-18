"use client";

import React, { useState } from 'react';
import {
  LuFlaskConical, LuCode, LuActivity, LuBrain, LuSave, LuChevronRight,
  LuArrowLeft, LuLoader, LuDatabase, LuSettings2, LuCpu, LuZap, LuCircleCheckBig,
  LuChartBar, LuFileCode
} from 'react-icons/lu';
import { apiFetch } from '../../../services/api';

const BACKENDS = [
  { id: 'qiskit_aer', label: 'Qiskit Aer', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30' },
  { id: 'pennylane', label: 'PennyLane', color: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30' },
  { id: 'cirq', label: 'Cirq', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30' },
  { id: 'qbraid', label: 'qBraid', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
];

const FRAMEWORKS = ['qiskit', 'pennylane', 'cirq', 'qbraid'];

const DEFAULT_CIRCUIT_CODE = `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create a 2-qubit Bell state circuit
qc = QuantumCircuit(2, 2)
qc.h(0)          # Hadamard gate on qubit 0
qc.cx(0, 1)      # CNOT gate
qc.measure([0, 1], [0, 1])

print(qc.draw())
`;

export default function NewExperimentWizard({ onCancel, onComplete }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  // Step 1: Details
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [tags, setTags] = useState('');

  // Step 2: Code & Params
  const [builderMode, setBuilderMode] = useState('visual');
  const [circuitCode, setCircuitCode] = useState(DEFAULT_CIRCUIT_CODE);
  const [backend, setBackend] = useState('qiskit_aer');
  const [framework, setFramework] = useState('qiskit');
  const [shots, setShots] = useState(1024);
  const [noiseEnabled, setNoiseEnabled] = useState(false);

  // Step 3: Run Results
  const [running, setRunning] = useState(false);
  const [simRunId, setSimRunId] = useState(null);
  const [results, setResults] = useState(null);

  // Step 4: Observations
  const [observationText, setObservationText] = useState('');
  const [interpretationText, setInterpretationText] = useState('');
  const [conclusionText, setConclusionText] = useState('');

  // Step 5: Save
  const [saving, setSaving] = useState(false);

  const steps = [
    { id: 1, label: 'Details', icon: LuFlaskConical },
    { id: 2, label: 'Code & Params', icon: LuCode },
    { id: 3, label: 'Run & Results', icon: LuActivity },
    { id: 4, label: 'Observation', icon: LuBrain },
    { id: 5, label: 'Save', icon: LuSave },
  ];

  const handleNext = () => {
    setError('');
    if (step === 1 && (!name.trim() || !objective.trim())) {
      setError('Name and Objective are required.');
      return;
    }
    if (step === 2 && !circuitCode.trim()) {
      setError('Circuit code is required.');
      return;
    }
    setStep(s => Math.min(s + 1, 5));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleRun = async () => {
    setRunning(true);
    setError('');
    try {
      const res = await apiFetch('/learner/simulations/run', {
        method: 'POST',
        body: JSON.stringify({
          circuitCode,
          backend,
          framework,
          shots: parseInt(shots),
          noiseConfig: noiseEnabled ? { depolarizing: 0.001 } : null,
        }),
      });
      if (res?.success && res.data?.simulationRun) {
        setResults(res.data.simulationRun.results);
        setSimRunId(res.data.simulationRun.id);
        // Do not auto advance, let user see results first
      } else {
        setError(res?.error || 'Simulation failed.');
      }
    } catch (err) {
      setError(err.message || 'Simulation failed.');
    }
    setRunning(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const obsJson = JSON.stringify({
        observation: observationText,
        interpretation: interpretationText,
        conclusion: conclusionText,
      });

      const res = await apiFetch('/learner/experiments', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          objective: objective.trim(),
          hypothesis: hypothesis.trim(),
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          circuitCode,
          backend,
          framework,
          parameters: { shots: parseInt(shots) },
          observations: obsJson,
          simulationRunId: simRunId,
        }),
      });

      if (res?.success) {
        onComplete(res.data.experiment);
      } else {
        setError(res?.error || 'Failed to save experiment.');
      }
    } catch (err) {
      setError(err.message || 'Failed to save experiment.');
    }
    setSaving(false);
  };

  const maxProb = results?.probabilities ? Math.max(...Object.values(results.probabilities)) : 0;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-border)]">
        <button onClick={onCancel} className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors shadow-sm">
          <LuArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--color-text)]">Laboratory Notebook</h1>
          <p className="text-sm text-[var(--color-muted)] font-serif italic">Experiment Record {"\u2014"} Section {step}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative px-4 mb-10 mt-6">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1px] bg-[var(--color-border)] -z-10" />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--color-primary)] -z-10 transition-all duration-500 ease-out" style={{ width: `calc(${((step - 1) / (steps.length - 1)) * 100}% - 3rem)` }} />
        
        {steps.map((s) => {
          const isActive = s.id === step;
          const isCompleted = s.id < step;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex flex-col items-center gap-3 bg-[var(--color-background)] px-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-300 shadow-sm ${isActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md scale-110' : isCompleted ? 'border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-primary)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]'}`}>
                {isCompleted ? <LuCircleCheckBig size={20} /> : <Icon size={20} />}
              </div>
              <span className={`text-xs font-medium tracking-wide uppercase ${isActive ? 'text-[var(--color-text)] font-bold' : isCompleted ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border-l-4 border-rose-500 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      {/* Step Content Wrapper (Lab Notebook Style) */}
      <div className="bg-[#fcfbf9] dark:bg-[var(--color-surface)] border border-[#e5e1d8] dark:border-[var(--color-border)] rounded-xl shadow-md min-h-[500px] overflow-hidden relative">
        {/* Binder accent lines */}
        <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-[#e5e1d8] dark:border-[var(--color-border)] bg-[#f5f2eb] dark:bg-[var(--color-background)] hidden sm:flex flex-col gap-8 py-8 items-center">
           {[...Array(6)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-[#e5e1d8] dark:bg-[var(--color-border)] shadow-inner" />)}
        </div>

        <div className="p-6 md:p-10 sm:ml-8">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
              <div className="border-b-2 border-[var(--color-text)] pb-4 mb-6">
                <h2 className="text-2xl font-serif font-bold text-[var(--color-text)]">I. Experiment Details</h2>
                <p className="text-[var(--color-muted)] font-serif italic mt-1">State the purpose and expectations before proceeding to the code.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2 font-serif">Experiment Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bell State Entanglement" className="w-full px-4 py-3 rounded-md bg-white dark:bg-[var(--color-background)] border border-[var(--color-border)] text-base focus:ring-1 focus:ring-[var(--color-primary)] outline-none shadow-sm font-serif" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2 font-serif">Objective *</label>
                  <textarea rows={3} value={objective} onChange={e => setObjective(e.target.value)} placeholder="What are you trying to achieve?" className="w-full px-4 py-3 rounded-md bg-white dark:bg-[var(--color-background)] border border-[var(--color-border)] text-base focus:ring-1 focus:ring-[var(--color-primary)] outline-none resize-none shadow-sm font-serif" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2 font-serif">Hypothesis</label>
                  <textarea rows={3} value={hypothesis} onChange={e => setHypothesis(e.target.value)} placeholder="What is your expected outcome?" className="w-full px-4 py-3 rounded-md bg-white dark:bg-[var(--color-background)] border border-[var(--color-border)] text-base focus:ring-1 focus:ring-[var(--color-primary)] outline-none resize-none shadow-sm font-serif" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-text)] mb-2 font-serif">Tags (comma separated)</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. qiskit, entanglement" className="w-full px-4 py-3 rounded-md bg-white dark:bg-[var(--color-background)] border border-[var(--color-border)] text-base focus:ring-1 focus:ring-[var(--color-primary)] outline-none shadow-sm font-sans" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="border-b-2 border-[var(--color-text)] pb-4 mb-6">
                <h2 className="text-2xl font-serif font-bold text-[var(--color-text)]">II. Code & Parameters</h2>
                <p className="text-[var(--color-muted)] font-serif italic mt-1">Define the quantum circuit and simulation environment.</p>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setBuilderMode('visual')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${builderMode === 'visual' ? 'bg-[var(--color-primary)] text-white shadow' : 'bg-white text-[var(--color-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]'}`}>Visual Builder</button>
                <button onClick={() => setBuilderMode('code')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${builderMode === 'code' ? 'bg-[var(--color-primary)] text-white shadow' : 'bg-white text-[var(--color-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]'}`}>Code Editor</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-[var(--color-text)] font-serif">Circuit Implementation</label>
                    <select value={framework} onChange={e => setFramework(e.target.value)} className="text-sm px-3 py-1.5 rounded bg-white dark:bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none shadow-sm">
                      {FRAMEWORKS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                    </select>
                  </div>
                  
                  {builderMode === 'visual' ? (
                     <div className="border border-[var(--color-border)] rounded-2xl bg-[var(--color-background)] flex flex-col items-center justify-center gap-4 p-10 text-center" style={{minHeight: '220px'}}>
                       <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                         <LuCpu size={28} className="text-cyan-400" />
                       </div>
                       <div>
                         <p className="font-bold text-sm text-[var(--color-text)]">Use the Quantum Circuit Playground</p>
                         <p className="text-xs text-[var(--color-muted)] mt-1">Build your circuit visually with 26+ gates, then paste the generated code in the Code Editor tab.</p>
                       </div>
                       <a
                         href="/playground"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black text-xs font-bold flex items-center gap-2 transition-colors shadow"
                       >
                         <LuZap size={13} /> Open Circuit Playground →
                       </a>
                     </div>
                  ) : (
                    <div className="rounded-md border border-[var(--color-border)] overflow-hidden shadow-sm">
                      <div className="bg-[var(--color-surface)] px-4 py-2 border-b border-[var(--color-border)] flex items-center gap-2 text-[var(--color-muted)] text-xs font-mono uppercase">
                        <LuFileCode /> circuit.py
                      </div>
                      <textarea
                        value={circuitCode}
                        onChange={e => setCircuitCode(e.target.value)}
                        rows={16}
                        spellCheck={false}
                        className="w-full p-4 bg-[#faf9f5] dark:bg-[var(--color-background)] text-sm font-mono text-[var(--color-text)] focus:outline-none resize-none leading-relaxed"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-8 bg-white dark:bg-[var(--color-background)] p-6 rounded-md border border-[var(--color-border)] shadow-sm">
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-text)] mb-3 font-serif">Backend Target</label>
                    <div className="flex flex-col gap-2">
                      {BACKENDS.map(b => (
                        <button key={b.id} onClick={() => setBackend(b.id)} className={`p-2.5 rounded border text-sm font-medium text-left transition-all ${backend === b.id ? b.color + ' ring-1 ring-current shadow-sm' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)]'}`}>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <hr className="border-[var(--color-border)]" />
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-text)] mb-3 font-serif">Measurement Shots</label>
                    <div className="flex flex-col gap-2">
                      <input type="range" min={100} max={10000} step={100} value={shots} onChange={e => setShots(e.target.value)} className="w-full accent-[var(--color-primary)]" />
                      <div className="text-right font-mono text-sm text-[var(--color-text)]">{Number(shots).toLocaleString()} shots</div>
                    </div>
                  </div>
                  <hr className="border-[var(--color-border)]" />
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-text)] mb-3 font-serif">Environment</label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-5 rounded-full transition-all relative shadow-inner ${noiseEnabled ? 'bg-amber-500' : 'bg-[var(--color-border)]'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${noiseEnabled ? 'left-5' : 'left-0.5'}`} />
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">Depolarizing Noise</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="border-b-2 border-[var(--color-text)] pb-4 mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[var(--color-text)]">III. Execution & Results</h2>
                  <p className="text-[var(--color-muted)] font-serif italic mt-1">Run the circuit and analyze the output distribution.</p>
                </div>
                {!results && (
                  <button onClick={handleRun} disabled={running} className="px-6 py-2.5 rounded bg-[var(--color-primary)] text-white text-sm font-bold inline-flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow">
                    {running ? <LuLoader size={18} className="animate-spin" /> : <LuZap size={18} />}
                    {running ? 'Executing...' : 'Run Simulation'}
                  </button>
                )}
              </div>
              
              {!results && !running && (
                <div className="py-20 text-center border-2 border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]/50">
                  <LuCpu size={48} className="mx-auto text-[var(--color-border)] mb-4" />
                  <p className="text-[var(--color-muted)] font-serif text-lg">Ready to execute circuit on {BACKENDS.find(b => b.id === backend)?.label}</p>
                </div>
              )}

              {running && (
                <div className="py-20 text-center flex flex-col items-center">
                  <LuLoader size={48} className="animate-spin text-[var(--color-primary)] mb-6" />
                  <p className="text-[var(--color-text)] font-serif text-lg animate-pulse">Computing quantum state vectors...</p>
                </div>
              )}

              {results && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Stats Table */}
                  <div className="bg-white dark:bg-[var(--color-background)] border border-[var(--color-border)] rounded-md shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-xs uppercase font-semibold text-[var(--color-muted)]">
                        <tr>
                          <th className="px-6 py-3">Exec Time</th>
                          <th className="px-6 py-3">Depth</th>
                          <th className="px-6 py-3">Gates</th>
                          <th className="px-6 py-3">Fidelity</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="font-mono text-[var(--color-text)]">
                          <td className="px-6 py-4">{results.executionTimeMs ? `${results.executionTimeMs}ms` : '-'}</td>
                          <td className="px-6 py-4">{results.depth ?? '-'}</td>
                          <td className="px-6 py-4">{results.gateCount ?? '-'}</td>
                          <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">{results.fidelity != null ? `${(results.fidelity * 100).toFixed(1)}%` : '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Probability Chart */}
                    <div className="bg-white dark:bg-[var(--color-background)] border border-[var(--color-border)] rounded-md shadow-sm p-6">
                      <h3 className="text-sm font-bold uppercase text-[var(--color-text)] mb-6 flex items-center gap-2">
                        <LuChartBar className="text-[var(--color-primary)]" /> Measurement Distribution
                      </h3>
                      {results.probabilities ? (
                        <div className="space-y-4">
                          {Object.entries(results.probabilities).sort((a, b) => b[1] - a[1]).map(([state, prob]) => (
                            <div key={state} className="group">
                              <div className="flex justify-between text-xs font-mono mb-1">
                                <span className="text-[var(--color-text)] font-bold">|{state}⟩</span>
                                <span className="text-[var(--color-muted)]">{(prob * 100).toFixed(1)}% ({results.counts?.[state] || 0})</span>
                              </div>
                              <div className="h-4 bg-[var(--color-surface)] rounded-sm overflow-hidden flex">
                                <div 
                                  className="h-full bg-[var(--color-primary)] transition-all duration-1000 ease-out" 
                                  style={{ width: `${(prob / maxProb) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-[var(--color-muted)] italic">No distribution data available.</div>
                      )}
                    </div>

                    {/* Circuit Diagram */}
                    <div className="bg-white dark:bg-[var(--color-background)] border border-[var(--color-border)] rounded-md shadow-sm p-6 flex flex-col">
                      <h3 className="text-sm font-bold uppercase text-[var(--color-text)] mb-4 flex items-center gap-2">
                        <LuFileCode className="text-[var(--color-primary)]" /> Circuit Diagram
                      </h3>
                      <div className="flex-1 bg-[#faf9f5] dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded overflow-auto p-4 flex items-center justify-center min-h-[150px]">
                        {results.circuitDiagram ? (
                          <pre className="text-xs font-mono text-[var(--color-text)] whitespace-pre">{results.circuitDiagram}</pre>
                        ) : (
                          <div className="text-center text-sm text-[var(--color-muted)] font-mono">
                            <pre className="opacity-50">
{`     ┌───┐     ┌─┐
q_0: ┤ H ├──■──┤M├
     └───┘┌─┴─┐└╥┘
q_1: ─────┤ X ├─╫─
          └───┘ ║ 
c: 2/═══════════╩═
                0 `}
                            </pre>
                            <span className="italic block mt-2 text-xs">Generated from code</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button onClick={handleNext} className="px-6 py-2.5 rounded bg-[var(--color-text)] text-[var(--color-surface)] text-sm font-bold shadow hover:opacity-90 transition-all">
                      Proceed to Observation
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="border-b-2 border-[var(--color-text)] pb-4 mb-6">
                <h2 className="text-2xl font-serif font-bold text-[var(--color-text)]">IV. Observation & Analysis</h2>
                <p className="text-[var(--color-muted)] font-serif italic mt-1">Record findings based on the simulation results.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Results Summary */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-5 sticky top-6">
                    <h4 className="text-xs font-bold uppercase text-[var(--color-text)] mb-4 pb-2 border-b border-[var(--color-border)]">Execution Summary</h4>
                    
                    {results && results.probabilities ? (
                       <div className="space-y-3 mb-6">
                         {Object.entries(results.probabilities).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([state, prob]) => (
                           <div key={state} className="flex justify-between text-xs font-mono items-center">
                             <span className="text-[var(--color-text)] font-bold">|{state}⟩</span>
                             <div className="flex-1 mx-3 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                               <div className="h-full bg-[var(--color-primary)]" style={{ width: `${(prob / maxProb) * 100}%` }} />
                             </div>
                             <span className="text-[var(--color-muted)]">{(prob * 100).toFixed(1)}%</span>
                           </div>
                         ))}
                       </div>
                    ) : (
                      <div className="text-xs text-[var(--color-muted)] italic mb-6">No data</div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                      <div><span className="block text-[var(--color-muted)]">Fidelity</span><span className="font-mono font-bold text-[var(--color-text)]">{results?.fidelity ? `${(results.fidelity * 100).toFixed(1)}%` : '-'}</span></div>
                      <div><span className="block text-[var(--color-muted)]">Depth</span><span className="font-mono font-bold text-[var(--color-text)]">{results?.depth ?? '-'}</span></div>
                      <div><span className="block text-[var(--color-muted)]">Gates</span><span className="font-mono font-bold text-[var(--color-text)]">{results?.gateCount ?? '-'}</span></div>
                      <div><span className="block text-[var(--color-muted)]">Time</span><span className="font-mono font-bold text-[var(--color-text)]">{results?.executionTimeMs ? `${results.executionTimeMs}ms` : '-'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Right side: Observations Input */}
                <div className="lg:col-span-2 space-y-6">
                  {[
                    { key: 'observation', label: '1. Empirical Observations', value: observationText, set: setObservationText, placeholder: 'Describe the raw output. Which states were most probable? Were there unexpected measurements?' },
                    { key: 'interpretation', label: '2. Physical Interpretation', value: interpretationText, set: setInterpretationText, placeholder: 'How does quantum mechanics (e.g., superposition, entanglement, interference) explain this distribution?' },
                    { key: 'conclusion', label: '3. Conclusion', value: conclusionText, set: setConclusionText, placeholder: 'Does this result support the initial hypothesis? What are the implications?' },
                  ].map(f => (
                    <div key={f.key} className="space-y-2">
                      <label className="block text-sm font-bold font-serif text-[var(--color-text)]">{f.label}</label>
                      <textarea rows={4} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-3 rounded-md bg-white dark:bg-[var(--color-background)] border border-[var(--color-border)] text-sm focus:ring-1 focus:ring-[var(--color-primary)] transition-all outline-none resize-none leading-relaxed shadow-sm font-serif italic placeholder:not-italic" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in duration-500 py-12 flex flex-col items-center max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-2 shadow-inner border border-[var(--color-primary)]/20">
                <LuSave size={40} className="text-[var(--color-primary)]" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">V. Complete & Archive</h2>
              <p className="text-[var(--color-muted)] font-serif text-lg max-w-lg mb-8">
                Your experiment has been configured, executed, and analyzed. Sign off and save this record to your laboratory portfolio.
              </p>
              
              <div className="w-full p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md mb-8 text-left space-y-3">
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold text-[var(--color-muted)]">Experiment Title</span>
                  <span className="text-sm font-serif font-bold text-[var(--color-text)]">{name}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-sm font-bold text-[var(--color-muted)]">Backend Used</span>
                  <span className="text-sm font-mono text-[var(--color-text)]">{BACKENDS.find(b => b.id === backend)?.label} ({shots} shots)</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-sm font-bold text-[var(--color-muted)]">Status</span>
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><LuCircleCheckBig size={14} /> Analysis Complete</span>
                </div>
              </div>

              <button onClick={handleSave} disabled={saving} className="px-10 py-4 rounded bg-[var(--color-primary)] text-white text-lg font-bold inline-flex items-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 shadow-md">
                {saving ? <LuLoader size={24} className="animate-spin" /> : <LuSave size={24} />}
                {saving ? 'Archiving Record...' : 'Save & Close Notebook'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-2">
        <button onClick={handleBack} disabled={step === 1 || running || saving} className="px-5 py-2.5 rounded border border-[var(--color-border)] text-[var(--color-text)] text-sm font-bold hover:bg-[var(--color-surface)] transition-colors disabled:opacity-30 flex items-center gap-2 shadow-sm">
          <LuArrowLeft size={16} /> Back
        </button>
        {step < 5 && (!results && step === 3 ? null : (
          <button onClick={handleNext} disabled={running} className="px-5 py-2.5 rounded bg-[var(--color-text)] text-[var(--color-surface)] text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-30">
            Next Section <LuChevronRight size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}
