"use client";

import React, { useState } from 'react';
import {
  LuZap, LuPlus, LuTrash2, LuCheck, LuX, LuSave, LuEye,
  LuSettings, LuCode, LuCpu, LuTriangleAlert, LuArrowRight,
  LuPlay, LuTarget, LuLightbulb, LuToggleLeft, LuToggleRight, LuArrowLeft,
} from 'react-icons/lu';
import { apiFetch } from '../../services/api';

const DIFFICULTY_STYLES = {
  Beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Advanced: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export default function ChallengeBuilder({ courseId, moduleId, challengeId, onBack }) {
  const [form, setForm] = useState({
    title: 'Bell State Circuit Challenge',
    difficulty: 'Beginner',
    xp: 150,
    problemStatement: 'Create a quantum circuit that generates the Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2. Your circuit should start with two qubits in the |00⟩ state and produce a maximally entangled Bell state.',
    starterCode: 'from qiskit import QuantumCircuit\n\ndef bell_state_circuit():\n    qc = QuantumCircuit(2, 2)\n    # Your implementation here\n    return qc',
    expectedOutput: '{"00": ~512, "11": ~512}',
    circuitRequirements: 'Must use exactly 2 qubits. Circuit depth ≤ 3.',
    hints: ['Start by applying a Hadamard gate to the first qubit', 'Use a CNOT gate with the first qubit as control'],
    testCases: [
      { input: 'Initial state: |00⟩', expected: 'Statevector: [0.707, 0, 0, 0.707]', description: 'Bell state amplitudes' },
      { input: '1024 shots measurement', expected: '~50% |00⟩, ~50% |11⟩', description: 'Measurement distribution' },
    ],
    solution: 'from qiskit import QuantumCircuit\n\ndef bell_state_circuit():\n    qc = QuantumCircuit(2, 2)\n    qc.h(0)\n    qc.cx(0, 1)\n    qc.measure([0,1],[0,1])\n    return qc',
    autoEval: true,
    evalType: 'statevector',
    fidelityThreshold: 0.99,
  });
  const [status, setStatus] = useState('Draft');
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const updateHint = (i, val) => update('hints', form.hints.map((h, j) => j === i ? val : h));
  const addHint = () => update('hints', [...form.hints, '']);
  const removeHint = (i) => update('hints', form.hints.filter((_, j) => j !== i));
  const updateTC = (i, key, val) => update('testCases', form.testCases.map((tc, j) => j === i ? { ...tc, [key]: val } : tc));
  const addTC = () => update('testCases', [...form.testCases, { input: '', expected: '', description: '' }]);
  const removeTC = (i) => update('testCases', form.testCases.filter((_, j) => j !== i));

  const handleSave = async () => {
    try {
      if (challengeId) {
        await apiFetch(`/instructor/challenges/${challengeId}`, { method: 'PUT', body: JSON.stringify({ ...form, moduleId, courseId }) });
      } else {
        await apiFetch('/instructor/challenges', { method: 'POST', body: JSON.stringify({ ...form, moduleId, courseId }) });
      }
    } catch { /* optimistic */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (previewMode) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {onBack && (
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-violet-400 transition-colors cursor-pointer group">
            <LuArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Course Builder
          </button>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuPlay size={14} className="text-pink-400" />
            <span className="text-xs font-mono text-[var(--color-muted)]">Learner Preview</span>
          </div>
          <button onClick={() => setPreviewMode(false)} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer">Exit Preview</button>
        </div>
        <div className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[form.difficulty]}`}>{form.difficulty}</span>
                <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10">+{form.xp} XP</span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">{form.title}</h2>
            </div>
          </div>
          <p className="text-sm text-[var(--color-text)] leading-relaxed">{form.problemStatement}</p>
          {form.circuitRequirements && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1"><LuTriangleAlert size={13} /> Circuit Requirements</div>
              <p className="text-xs text-amber-300">{form.circuitRequirements}</p>
            </div>
          )}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--color-text)]">Starter Code</h4>
            <pre className="p-4 rounded-2xl bg-[#0d1117] text-emerald-400 text-xs font-mono overflow-x-auto">{form.starterCode}</pre>
          </div>
          {form.testCases.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[var(--color-text)]">Test Cases</h4>
              <div className="space-y-2">
                {form.testCases.map((tc, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                    <div className="text-[10px] font-mono text-[var(--color-muted)] mb-1">Test {i + 1}: {tc.description}</div>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div><span className="text-[var(--color-muted)]">Input: </span><span className="text-cyan-400">{tc.input}</span></div>
                      <div><span className="text-[var(--color-muted)]">Expected: </span><span className="text-emerald-400">{tc.expected}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {form.hints.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2"><LuLightbulb size={14} className="text-amber-400" /> Hints (Progressive)</h4>
              {form.hints.map((hint, i) => (
                <div key={i} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  <span className="font-bold">Hint {i + 1}:</span> {hint}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2"><LuZap size={15} className="text-pink-400" /><span className="text-xs text-[var(--color-muted)] font-mono">Challenge Builder</span></div>
          <input type="text" value={form.title} onChange={e => update('title', e.target.value)}
            className="text-xl font-bold bg-transparent text-[var(--color-text)] focus:outline-none border-b border-transparent focus:border-violet-500 transition-colors w-full" />
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button onClick={() => setPreviewMode(true)} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer flex items-center gap-1.5"><LuEye size={13} /> Preview</button>
          <button onClick={handleSave} className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${saved ? 'bg-emerald-600 text-white' : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
            {saved ? <><LuCheck size={13} /> Saved</> : <><LuSave size={13} /> Save</>}
          </button>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer">
            <option>Draft</option><option>Review</option><option>Published</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Difficulty</label>
              <select value={form.difficulty} onChange={e => update('difficulty', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">XP Reward</label>
              <input type="number" value={form.xp} onChange={e => update('xp', Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Eval Type</label>
              <select value={form.evalType} onChange={e => update('evalType', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="statevector">Statevector</option>
                <option value="unitary">Unitary Matrix</option>
                <option value="output">Measurement Output</option>
                <option value="manual">Manual Grading</option>
              </select>
            </div>
          </div>

          {/* Problem Statement */}
          <Section label="Problem Statement" required>
            <textarea rows={4} value={form.problemStatement} onChange={e => update('problemStatement', e.target.value)}
              placeholder="Describe the challenge clearly..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)] resize-none" />
          </Section>

          {/* Circuit Requirements */}
          <Section label="Circuit Requirements">
            <input type="text" value={form.circuitRequirements} onChange={e => update('circuitRequirements', e.target.value)}
              placeholder="e.g. Must use exactly 2 qubits. Circuit depth ≤ 3."
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]" />
          </Section>

          {/* Starter Code */}
          <Section label="Starter Code">
            <textarea rows={6} value={form.starterCode} onChange={e => update('starterCode', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[var(--color-border)] text-xs text-emerald-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono" />
          </Section>

          {/* Expected Output */}
          <Section label="Expected Output">
            <input type="text" value={form.expectedOutput} onChange={e => update('expectedOutput', e.target.value)}
              placeholder='{"00": ~512, "11": ~512}'
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-cyan-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono placeholder:text-[var(--color-muted)]" />
          </Section>

          {/* Test Cases */}
          <Section label="Test Cases">
            <div className="space-y-3">
              {form.testCases.map((tc, i) => (
                <div key={i} className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Test Case {i + 1}</span>
                    <button onClick={() => removeTC(i)} className="text-rose-400 hover:text-rose-300 cursor-pointer p-1"><LuX size={12} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" value={tc.description} onChange={e => updateTC(i, 'description', e.target.value)} placeholder="Description" className="px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]" />
                    <input type="text" value={tc.input} onChange={e => updateTC(i, 'input', e.target.value)} placeholder="Input" className="px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]" />
                    <input type="text" value={tc.expected} onChange={e => updateTC(i, 'expected', e.target.value)} placeholder="Expected Output" className="px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]" />
                  </div>
                </div>
              ))}
              <button onClick={addTC} className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"><LuPlus size={13} /> Add Test Case</button>
            </div>
          </Section>

          {/* Hints */}
          <Section label="Progressive Hints">
            <div className="space-y-2">
              {form.hints.map((hint, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[10px] font-mono text-amber-400 px-2 py-2 bg-amber-500/10 rounded-lg shrink-0">#{i + 1}</span>
                  <input type="text" value={hint} onChange={e => updateHint(i, e.target.value)} placeholder={`Hint ${i + 1}...`}
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-[var(--color-muted)]" />
                  <button onClick={() => removeHint(i)} className="text-rose-400 hover:text-rose-300 cursor-pointer p-1"><LuX size={12} /></button>
                </div>
              ))}
              <button onClick={addHint} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"><LuPlus size={13} /> Add Hint</button>
            </div>
          </Section>

          {/* Solution */}
          <Section label="Model Solution (Instructor Only)">
            <textarea rows={8} value={form.solution} onChange={e => update('solution', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[var(--color-border)] text-xs text-cyan-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono" />
          </Section>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2"><LuSettings size={13} className="text-pink-400" /> Auto-Evaluation</h4>
            <label className="flex items-center gap-3 cursor-pointer" onClick={() => update('autoEval', !form.autoEval)}>
              {form.autoEval ? <LuToggleRight size={22} className="text-violet-400" /> : <LuToggleLeft size={22} className="text-[var(--color-muted)]" />}
              <span className="text-xs text-[var(--color-text)]">Auto-evaluate submissions</span>
            </label>
            {form.autoEval && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase">Fidelity Threshold (%)</label>
                  <input type="number" min={0} max={100} step={0.01} value={Math.round(form.fidelityThreshold * 100)}
                    onChange={e => update('fidelityThreshold', Number(e.target.value) / 100)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                </div>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Challenge Info</h4>
            {[
              { label: 'Difficulty', value: form.difficulty, color: DIFFICULTY_STYLES[form.difficulty]?.split(' ')[1] },
              { label: 'XP Reward', value: `+${form.xp} XP`, color: 'text-amber-400' },
              { label: 'Test Cases', value: form.testCases.length, color: 'text-cyan-400' },
              { label: 'Hints', value: form.hints.filter(Boolean).length, color: 'text-amber-400' },
              { label: 'Auto-Eval', value: form.autoEval ? 'Yes' : 'No', color: form.autoEval ? 'text-emerald-400' : 'text-rose-400' },
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

function Section({ label, required, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
    </div>
  );
}
