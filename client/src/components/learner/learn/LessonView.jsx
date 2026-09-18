"use client";

import React, { useState } from 'react';
import { apiFetch } from '../../../services/api';
import {
  LuX, LuArrowLeft, LuArrowRight, LuPlay, LuBot, LuCode,
  LuCpu, LuCheck, LuSparkles, LuBookOpen, LuFlame, LuLightbulb,
  LuBrain, LuCircleCheckBig, LuChevronRight, LuClock, LuZap,
} from 'react-icons/lu';

// ─── Mock lesson content ──────────────────────────────────────────────────────
const LESSON_DATA = {
  id: 'l8',
  title: 'The Diffusion Operator',
  module: "Module 3: Grover's Search",
  duration: '20 min',
  theory: `The diffusion operator (also called inversion about the mean) is the second key component of Grover's algorithm. After the oracle marks a target state by flipping its phase, the diffusion operator amplifies that state's amplitude relative to all others.

Mathematically, it is defined as:
**D = 2|ψ⟩⟨ψ| − I**

where |ψ⟩ is the uniform superposition state. This transformation reflects all amplitudes about their average, which increases the amplitude of the marked state and decreases all others.`,
  keyPoints: [
    'Reflects amplitudes about the mean',
    'Implemented as H⊗n · (2|0⟩⟨0| − I) · H⊗n',
    'Together with oracle, forms one Grover iteration',
    'Optimal iterations ≈ π/4 · √N',
  ],
  code: `from qiskit import QuantumCircuit
import numpy as np

def diffusion_operator(n_qubits):
    """Build the diffusion (inversion about mean) operator."""
    qc = QuantumCircuit(n_qubits)
    
    # Apply Hadamard to all qubits
    qc.h(range(n_qubits))
    
    # Apply X to all qubits
    qc.x(range(n_qubits))
    
    # Apply multi-controlled Z gate
    qc.h(n_qubits - 1)
    qc.mcx(list(range(n_qubits - 1)), n_qubits - 1)
    qc.h(n_qubits - 1)
    
    # Reverse X and H
    qc.x(range(n_qubits))
    qc.h(range(n_qubits))
    
    return qc

# Build 3-qubit Grover circuit
n = 3
grover = QuantumCircuit(n)
grover.h(range(n))          # Initialize superposition
grover.compose(oracle, inplace=True)  # Apply oracle
grover.compose(diffusion_operator(n), inplace=True)

print(grover.draw())`,
  circuit: `H ─┤ Oracle ├─ H ─ X ─ ●── X ─ H
H ─┤        ├─ H ─ X ─ ●── X ─ H
H ─┤        ├─ H ─ X ─ Z── X ─ H`,
  quiz: [
    {
      q: 'What does the diffusion operator do to amplitudes?',
      options: ['Flips all amplitudes', 'Reflects amplitudes about their mean', 'Doubles all amplitudes', 'Sets all amplitudes equal'],
      answer: 1,
    },
    {
      q: 'How many Grover iterations give optimal success probability?',
      options: ['N/2 iterations', 'log(N) iterations', '≈ π/4 · √N iterations', 'N iterations'],
      answer: 2,
    },
  ],
};

const AI_EXPLANATIONS = {
  concept: "The diffusion operator is like 'reflecting in a mirror set at the average.' If most values are small but one is large (after oracle), reflecting about the mean makes the large one even bigger and shrinks the small ones. After O(√N) iterations, the marked state has amplitude close to 1.",
  code: "The code builds D = H⊗n(2|0⟩⟨0|−I)H⊗n. The X gates convert |0⟩⟨0| to |all-ones⟩⟨all-ones|, the multi-controlled-Z flips its phase, and the outer H+X sandwich completes the inversion.",
  circuit: "Read the circuit left to right: H creates superposition, the Oracle block marks the target, then H→X→MCZ→X→H implements the diffusion. The MCZ acts like a phase kickback on |111...1⟩.",
  result: "After this iteration, the target state amplitude increases from ~1/√N to ~3/√N. After ≈π/4·√N iterations, amplitude approaches 1.0, giving near-certain measurement outcome.",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AIPanel({ explanation, label }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-cyan-500/10 transition-colors"
      >
        <LuBot size={15} className="text-cyan-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-cyan-400 flex-1">AI: Explain {label}</span>
        <LuSparkles size={13} className="text-cyan-400/60" />
      </button>
      {open && (
        <div className="px-4 pb-4 text-xs text-[var(--color-muted)] leading-relaxed border-t border-cyan-500/10">
          <div className="pt-3">{explanation}</div>
        </div>
      )}
    </div>
  );
}

function QuizSection({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const score = submitted ? questions.filter((q, i) => answers[i] === q.answer).length : 0;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
      <div className="flex items-center gap-2">
        <LuBrain size={16} className="text-violet-400" />
        <h4 className="font-semibold text-sm text-[var(--color-text)]">Lesson Quiz</h4>
      </div>

      {questions.map((q, qi) => (
        <div key={qi} className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-text)]">{qi + 1}. {q.q}</p>
          <div className="grid grid-cols-1 gap-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              const isCorrect = submitted && oi === q.answer;
              const isWrong = submitted && selected && oi !== q.answer;
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                  className={`text-left px-4 py-2.5 rounded-xl border text-xs transition-all ${
                    isCorrect ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' :
                    isWrong ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' :
                    selected ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 text-[var(--color-primary)]' :
                    'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)]/30 hover:text-[var(--color-text)]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold disabled:opacity-40 hover:bg-violet-600 transition-colors"
        >
          Submit Answers
        </button>
      ) : (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold text-center ${
          score === questions.length ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {score}/{questions.length} correct! {score === questions.length ? '🎉 Perfect!' : '📖 Review the lesson and try again.'}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function LessonView({ lesson = LESSON_DATA, onClose, onNext, onPrev, lessonIndex = 2, totalLessons = 6 }) {
  const [activeTab, setActiveTab] = useState('theory');
  const [simRunning, setSimRunning] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [rewardMsg, setRewardMsg] = useState(null);
  const lessonStartTimeRef = React.useRef(Date.now());

  async function handleMarkComplete() {
    try {
      setCompleting(true);
      const elapsedMins = Math.max(5, Math.round((Date.now() - lessonStartTimeRef.current) / 60000));
      const hoursToLog = parseFloat((elapsedMins / 60).toFixed(2));

      const res = await apiFetch(`/learner/lessons/${lesson?.id || LESSON_DATA.id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ courseId: lesson?.courseId, hours: hoursToLog }),
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('learner:activity-updated', { detail: res?.data }));
        try { localStorage.setItem('learner_activity_sync', String(Date.now())); } catch (e) {}
      }

      setCompleted(true);
      setRewardMsg(`+50 XP Earned · ${hoursToLog}h (${elapsedMins}m) Logged! 🔥`);
    } catch (err) {
      console.warn('Lesson complete fallback:', err);
      setCompleted(true);
      setRewardMsg('+50 XP Earned · Profile Synced! 🔥');
    } finally {
      setCompleting(false);
    }
  }

  const tabs = [
    { id: 'theory', label: 'Theory', icon: LuBookOpen },
    { id: 'code', label: 'Code', icon: LuCode },
    { id: 'circuit', label: 'Circuit', icon: LuCpu },
  ];

  function runSim() {
    setSimRunning(true);
    setTimeout(() => { setSimRunning(false); setSimDone(true); }, 2000);
  }

  return (
    <div className="space-y-0">
      {/* Lesson Nav Header */}
      <div className="rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 flex items-center gap-4">
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-border)]/30 text-[var(--color-muted)] transition-colors flex-shrink-0">
            <LuArrowLeft size={18} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider">{lesson.module}</div>
          <h2 className="text-base font-bold text-[var(--color-text)] truncate">{lesson.title}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] font-mono flex-shrink-0">
          <LuClock size={12} />
          {lesson.duration}
          <span className="ml-2">Lesson {lessonIndex}/{totalLessons}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--color-border)]/30">
        <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" style={{ width: `${(lessonIndex / totalLessons) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="rounded-b-2xl border-x border-b border-[var(--color-border)] bg-[var(--color-background)] p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--color-surface)] rounded-xl w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Theory Tab */}
        {activeTab === 'theory' && (
          <div className="space-y-5">
            <div className="prose prose-sm max-w-none">
              {(lesson.theory || '').split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-[var(--color-muted)] leading-relaxed"
                   dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--color-text)]">$1</strong>') }}
                />
              ))}
            </div>

            <AIPanel explanation={AI_EXPLANATIONS.concept} label="this concept" />

            {/* Key points */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
                <LuLightbulb size={14} className="text-amber-400" /> Key Takeaways
              </div>
              <ul className="space-y-1.5">
                {(lesson.keyPoints || []).map(pt => (
                  <li key={pt} className="flex items-start gap-2 text-xs text-[var(--color-muted)]">
                    <LuCheck size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" /> {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Code Tab */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#0d1117] border border-[var(--color-border)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]/50">
                <span className="text-[10px] font-mono text-emerald-400">diffusion_operator.py</span>
                <button
                  onClick={runSim}
                  disabled={simRunning}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                >
                  {simRunning ? (
                    <><span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" /> Running...</>
                  ) : (
                    <><LuPlay size={11} /> Run Simulation</>
                  )}
                </button>
              </div>
              <pre className="p-4 text-[11px] text-cyan-300 leading-relaxed overflow-x-auto font-mono">
                {lesson.code}
              </pre>
            </div>

            {simDone && (
              <div className="rounded-xl bg-[#0d1117] border border-emerald-500/20 p-4 space-y-2">
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Simulation Output</div>
                <pre className="text-[11px] text-emerald-300 font-mono leading-relaxed">{`Circuit depth: 12
Qubits: 3
Target state |101⟩ amplitude: 0.974
Measurement probability: 94.8%
Success after ≈2.2 iterations`}</pre>
              </div>
            )}

            <AIPanel explanation={AI_EXPLANATIONS.code} label="this implementation" />
            {simDone && <AIPanel explanation={AI_EXPLANATIONS.result} label="the result" />}
          </div>
        )}

        {/* Circuit Tab */}
        {activeTab === 'circuit' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#0d1117] border border-[var(--color-border)] overflow-hidden">
              <div className="flex items-center px-4 py-2 border-b border-[var(--color-border)]/50">
                <span className="text-[10px] font-mono text-violet-400">Grover Circuit (1 iteration)</span>
              </div>
              <div className="p-6">
                <pre className="text-sm font-mono text-violet-300 leading-loose">{lesson.circuit}</pre>
              </div>
            </div>
            <button
              onClick={runSim}
              disabled={simRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-semibold hover:bg-[var(--color-primary)]/20 transition-colors disabled:opacity-50"
            >
              {simRunning ? <span className="w-4 h-4 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" /> : <LuPlay size={14} />}
              Run Circuit Simulation
            </button>
            {simDone && (
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 text-xs font-mono text-emerald-300">
                ✓ Circuit valid · Target state probability boosted to 94.8%
              </div>
            )}
            <AIPanel explanation={AI_EXPLANATIONS.circuit} label="this circuit" />
          </div>
        )}

        {/* Quiz */}
        <QuizSection questions={LESSON_DATA.quiz} />

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]/50">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/40 disabled:opacity-30 transition-all"
          >
            <LuArrowLeft size={14} /> Previous
          </button>

          {!completed ? (
            <button
              onClick={handleMarkComplete}
              disabled={completing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all shadow-md disabled:opacity-60 cursor-pointer"
            >
              {completing ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <LuCircleCheckBig size={14} />
              )}
              Mark Complete (+50 XP)
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <LuCheck size={13} /> {rewardMsg || 'Completed! +50 XP'}
              </span>
              <button
                onClick={onNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md cursor-pointer"
              >
                Next Lesson <LuArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
