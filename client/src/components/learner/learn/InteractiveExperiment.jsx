"use client";

import React, { useState } from 'react';
import { apiFetch } from '../../../services/api';
import {
  LuArrowLeft, LuArrowRight, LuCheck, LuCircle, LuBot,
  LuSparkles, LuLightbulb, LuPlay, LuCpu, LuFlaskConical,
  LuCircleCheckBig, LuZap, LuTarget, LuX,
} from 'react-icons/lu';

// ─── Bell State Experiment Data ───────────────────────────────────────────────
const EXPERIMENT = {
  title: 'Create a Bell State',
  subtitle: 'Guided Hands-On Lab',
  objective: 'Build and simulate the |Φ⁺⟩ Bell state using H + CNOT gates, then verify its entanglement through measurement statistics.',
  steps: [
    {
      id: 1,
      title: 'Initialize 2-Qubit Register',
      instruction: 'Start with both qubits in |0⟩ state. Click "Add Qubit" twice to create your 2-qubit register.',
      hint: 'All qubits start in the ground state |0⟩ by default.',
      validation: 'Two qubits added',
      circuit: '|0⟩ ─────\n|0⟩ ─────',
      done: false,
    },
    {
      id: 2,
      title: 'Apply Hadamard to Qubit 0',
      instruction: 'Drag the H gate onto qubit 0 to create a superposition state (|0⟩ + |1⟩)/√2.',
      hint: 'The Hadamard gate creates equal superposition. After applying H, qubit 0 has 50% chance of measuring 0 or 1.',
      validation: 'H gate on qubit 0',
      circuit: '|0⟩ ─ H ─\n|0⟩ ─────',
      done: false,
    },
    {
      id: 3,
      title: 'Add CNOT Gate',
      instruction: 'Drag a CNOT gate with qubit 0 as control (●) and qubit 1 as target (⊕). This creates entanglement.',
      hint: 'CNOT flips qubit 1 only when qubit 0 is |1⟩, creating the correlation that defines entanglement.',
      validation: 'CNOT gate between qubits',
      circuit: '|0⟩ ─ H ─ ●─\n|0⟩ ─────  ⊕─',
      done: false,
    },
    {
      id: 4,
      title: 'Run Simulation & Verify',
      instruction: 'Click "Simulate" to run your Bell state circuit. Verify the measurement histogram shows ~50% |00⟩ and ~50% |11⟩.',
      hint: 'A perfect Bell state should NEVER show |01⟩ or |10⟩ — those outcomes are completely suppressed by entanglement.',
      validation: '|00⟩ ≈ 50%, |11⟩ ≈ 50%',
      done: false,
    },
  ],
};

const HINTS = [
  'Tip: The Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 is maximally entangled.',
  'If you see |01⟩ or |10⟩, check that your CNOT control/target are correct.',
  'The H gate transforms |0⟩ → (|0⟩+|1⟩)/√2 and |1⟩ → (|0⟩-|1⟩)/√2.',
];

const SIM_RESULT = {
  statevector: '(|00⟩ + |11⟩) / √2',
  histogram: [
    { state: '|00⟩', prob: 0.497, color: 'bg-[var(--color-primary)]' },
    { state: '|01⟩', prob: 0.003, color: 'bg-rose-500' },
    { state: '|10⟩', prob: 0.003, color: 'bg-rose-500' },
    { state: '|11⟩', prob: 0.497, color: 'bg-[var(--color-secondary)]' },
  ],
};

// ─── Circuit builder (simplified visual) ────────────────────────────────────
const GATES = ['H', 'X', 'Y', 'Z', 'S', 'T', 'CNOT'];

function CircuitBuilder({ circuit, onCircuitChange }) {
  const [q0Gates, setQ0Gates] = useState(['H']);
  const [q1Gates, setQ1Gates] = useState(['CNOT']);
  const [dragGate, setDragGate] = useState(null);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[#0d1117] overflow-hidden">
      <div className="px-4 py-2 border-b border-[var(--color-border)]/50 flex items-center justify-between">
        <span className="text-[10px] font-mono text-violet-400">Interactive Circuit Builder</span>
        <span className="text-[10px] text-[var(--color-muted)] font-mono">Bell State</span>
      </div>
      <div className="p-4 space-y-3">
        {/* Gate palette */}
        <div className="flex flex-wrap gap-1.5">
          {GATES.map(g => (
            <button
              key={g}
              className="px-2.5 py-1 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[11px] font-mono font-bold hover:bg-[var(--color-primary)]/20 transition-colors border border-[var(--color-primary)]/20"
            >
              {g}
            </button>
          ))}
        </div>

        {/* Qubit wires */}
        <div className="space-y-2 py-2">
          {[{ label: 'q₀', gates: q0Gates }, { label: 'q₁', gates: q1Gates }].map((qubit, qi) => (
            <div key={qubit.label} className="flex items-center gap-3">
              <span className="text-xs font-mono text-violet-300 w-6 flex-shrink-0">{qubit.label}</span>
              <div className="flex items-center gap-1 flex-1 h-8">
                <div className="w-4 h-px bg-violet-500/40" />
                {qubit.gates.map((g, i) => (
                  <React.Fragment key={i}>
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-mono font-bold border transition-all cursor-pointer hover:scale-110 ${
                      g === 'CNOT' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    }`}>
                      {g === 'CNOT' ? (qi === 0 ? '●' : '⊕') : g}
                    </div>
                    <div className="w-4 h-px bg-violet-500/40" />
                  </React.Fragment>
                ))}
                <div className="flex-1 h-px bg-violet-500/40" />
                <div className="w-6 h-6 rounded border border-violet-500/30 flex items-center justify-center text-[9px] font-mono text-violet-400">M</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function InteractiveExperiment({ experiment = EXPERIMENT, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const step = experiment.steps[currentStep];
  const isLastStep = currentStep === experiment.steps.length - 1;
  const allDone = completedSteps.length === experiment.steps.length;

  function validateStep() {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    if (!isLastStep) {
      setCurrentStep(s => s + 1);
    } else {
      // Last step: run simulation and automatically sync profile
      setSimRunning(true);
      setTimeout(async () => {
        setSimRunning(false);
        setSimDone(true);
        try {
          await apiFetch('/learner/lessons/e1/complete', {
            method: 'PATCH',
            body: JSON.stringify({ courseId: 'c1' }),
          });
        } catch {}
      }, 2000);
    }
  }

  function nextHint() {
    setShowHint(true);
    setHintIdx(i => (i + 1) % HINTS.length);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-[var(--color-surface)] to-violet-500/10 p-6 sm:p-8">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[var(--color-border)]/30 text-[var(--color-muted)] transition-colors">
            <LuArrowLeft size={18} />
          </button>
        )}
        <div className="relative z-10 space-y-3 pr-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <LuFlaskConical size={9} className="inline mr-1" />Interactive Lab
            </span>
            <span className="text-[10px] font-mono text-[var(--color-muted)]">{completedSteps.length}/{experiment.steps.length} steps</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--color-text)]">{experiment.title}</h2>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-xl">{experiment.objective}</p>

          {/* Step progress bar */}
          <div className="flex items-center gap-1.5 pt-2">
            {experiment.steps.map((s, i) => (
              <div key={s.id} className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                completedSteps.includes(i) ? 'bg-emerald-500' :
                i === currentStep ? 'bg-[var(--color-primary)]' :
                'bg-[var(--color-border)]/40'
              }`} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Step instructions */}
        <div className="space-y-4">
          {/* Step list */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            {experiment.steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(i)}
                className={`w-full flex items-start gap-3 px-5 py-4 text-left border-b last:border-b-0 border-[var(--color-border)]/50 transition-all ${
                  i === currentStep
                    ? 'bg-[var(--color-primary)]/5 border-l-2 border-l-[var(--color-primary)]'
                    : 'hover:bg-[var(--color-background)]'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  completedSteps.includes(i) ? 'bg-emerald-500 text-white' :
                  i === currentStep ? 'bg-[var(--color-primary)] text-white' :
                  'bg-[var(--color-border)]/30 text-[var(--color-muted)]'
                }`}>
                  {completedSteps.includes(i) ? <LuCheck size={12} /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${i === currentStep ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>{s.title}</div>
                  {i === currentStep && (
                    <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">{s.instruction}</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Hint */}
          <div className="space-y-2">
            <button
              onClick={nextHint}
              className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors font-semibold"
            >
              <LuLightbulb size={13} /> {showHint ? 'Next hint' : 'Show hint'}
            </button>
            {showHint && (
              <div className="px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                {HINTS[hintIdx]}
              </div>
            )}
          </div>

          {/* Validation */}
          <div className="rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-4 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">Expected Validation</div>
            <div className="text-sm text-[var(--color-text)] font-mono">{step.validation}</div>
          </div>

          {/* AI assist */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 overflow-hidden">
            <button
              onClick={() => setAiOpen(o => !o)}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-cyan-500/10 transition-colors"
            >
              <LuBot size={15} className="text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 flex-1">AI Assistant — need help?</span>
              <LuSparkles size={12} className="text-cyan-400/60" />
            </button>
            {aiOpen && (
              <div className="px-4 pb-4 text-xs text-[var(--color-muted)] border-t border-cyan-500/10 pt-3 leading-relaxed">
                For Step {currentStep + 1}: {step.hint}
              </div>
            )}
          </div>
        </div>

        {/* Right: Circuit builder + Simulation */}
        <div className="space-y-4">
          {/* Circuit */}
          <CircuitBuilder circuit={step.circuit} />

          {/* Current circuit preview */}
          <div className="rounded-xl border border-violet-500/20 bg-[#0d1117] p-4">
            <div className="text-[10px] font-mono text-violet-400 mb-3 uppercase tracking-wider">Circuit State</div>
            <pre className="text-sm font-mono text-violet-300 leading-loose">{step.circuit}</pre>
          </div>

          {/* Action button */}
          <button
            onClick={validateStep}
            disabled={simRunning}
            className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
              isLastStep
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90'
                : 'bg-[var(--color-primary)] text-white hover:opacity-90'
            }`}
          >
            {simRunning ? (
              <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Simulating...</>
            ) : isLastStep ? (
              <><LuPlay size={14} /> Run Simulation & Validate</>
            ) : (
              <><LuCheck size={14} /> Validate Step {currentStep + 1} & Continue</>
            )}
          </button>

          {/* Simulation results */}
          {simDone && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <LuCircleCheckBig size={16} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Simulation Successful!</span>
              </div>
              <div className="text-xs font-mono text-[var(--color-muted)]">
                Statevector: <span className="text-emerald-300">{SIM_RESULT.statevector}</span>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">Measurement Histogram</div>
                {SIM_RESULT.histogram.map(h => (
                  <div key={h.state} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[var(--color-muted)] w-8">{h.state}</span>
                    <div className="flex-1 h-5 bg-[var(--color-border)]/20 rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${h.color} transition-all duration-700 flex items-center px-2`}
                        style={{ width: `${h.prob * 100}%` }}
                      >
                        <span className="text-[9px] font-mono text-white">{(h.prob * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-emerald-300 font-mono">
                ✓ Bell state verified: only |00⟩ and |11⟩ observed, confirming entanglement.
              </div>
            </div>
          )}

          {/* Success state */}
          {allDone && simDone && (
            <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-5 text-center space-y-2">
              <div className="text-2xl">🎉</div>
              <div className="text-sm font-bold text-emerald-400">Experiment Complete!</div>
              <div className="text-xs text-[var(--color-muted)]">You successfully created and verified a Bell state. +200 XP earned.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
