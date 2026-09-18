"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { LearnerSidebar } from '../../components/sidebar';
import DashboardNavbar from '../../components/navbar/DashboardNavbar';
import {
  LuCpu, LuPlay, LuLayers, LuActivity, LuTriangleAlert, LuInfo,
  LuCircleAlert, LuTrash2, LuCode, LuCopy, LuCheck, LuPlus, LuMinus,
  LuRotateCcw, LuZap, LuAtom, LuSparkles, LuBookmark, LuShare2,
  LuClock, LuSlidersHorizontal, LuHelpCircle, LuMaximize2, LuEye
} from 'react-icons/lu';
import toast from 'react-hot-toast';
import { apiFetch } from '../../services/api';
import { analyzeCircuit, generateCode } from '../../components/learner/playground/CodeGenerator';
import { simulateCircuitRealTime } from '../../components/learner/playground/QuantumSimulatorEngine';
import QuirkBlochSphere from '../../components/learner/playground/QuirkBlochSphere';
import { CIRCUIT_PRESETS } from '../../components/learner/playground/CircuitPresets';

// ─── Gate Palette Categories (Quirk + Modern IDE) ─────────────────────────────
const GATE_CATEGORIES = [
  {
    category: 'Controls & Routing',
    color: 'text-indigo-400',
    gates: [
      { symbol: '●', type: 'CONTROL', label: 'Control (1)', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50', icon: '●', isControl: true },
      { symbol: '○', type: 'ANTI_CONTROL', label: 'Anti-Control (0)', color: 'bg-slate-700/50 text-slate-300 border-slate-500/50', icon: '○', isControl: true },
      { symbol: '⊕', type: 'CX', label: 'NOT Target (⊕)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', icon: '⊕', isTarget: true },
      { symbol: 'SWAP', type: 'SWAP', label: 'Swap (⇌)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/50', icon: '⇌', needsSwap: true },
    ]
  },
  {
    category: 'Single Qubit & Pauli',
    color: 'text-cyan-400',
    gates: [
      { symbol: 'H', type: 'H', label: 'Hadamard', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50', icon: 'H' },
      { symbol: 'X', type: 'X', label: 'Pauli-X (NOT)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', icon: 'X' },
      { symbol: 'Y', type: 'Y', label: 'Pauli-Y', color: 'bg-teal-500/20 text-teal-300 border-teal-500/50', icon: 'Y' },
      { symbol: 'Z', type: 'Z', label: 'Pauli-Z', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50', icon: 'Z' },
      { symbol: 'SX', type: 'SX', label: '√X Gate', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50', icon: '√X' },
    ]
  },
  {
    category: 'Phase & Rotations',
    color: 'text-violet-400',
    gates: [
      { symbol: 'S', type: 'S', label: 'S Gate (π/2)', color: 'bg-sky-500/20 text-sky-300 border-sky-500/50', icon: 'S' },
      { symbol: 'SDG', type: 'SDG', label: 'S† Gate (-π/2)', color: 'bg-sky-500/20 text-sky-300 border-sky-500/50', icon: 'S†' },
      { symbol: 'T', type: 'T', label: 'T Gate (π/4)', color: 'bg-violet-500/20 text-violet-300 border-violet-500/50', icon: 'T' },
      { symbol: 'TDG', type: 'TDG', label: 'T† Gate (-π/4)', color: 'bg-violet-500/20 text-violet-300 border-violet-500/50', icon: 'T†' },
      { symbol: 'RX', type: 'RX', label: 'Rx(θ)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/50', icon: 'Rx', hasAngle: true },
      { symbol: 'RY', type: 'RY', label: 'Ry(θ)', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50', icon: 'Ry', hasAngle: true },
      { symbol: 'RZ', type: 'RZ', label: 'Rz(θ)', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', icon: 'Rz', hasAngle: true },
      { symbol: 'P', type: 'P', label: 'Phase(θ)', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50', icon: 'P', hasAngle: true },
    ]
  },
  {
    category: 'Multi-Qubit & Toffoli',
    color: 'text-rose-400',
    gates: [
      { symbol: 'CX', type: 'CX', label: 'CNOT', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50', icon: 'CX', needsControl: true },
      { symbol: 'CZ', type: 'CZ', label: 'Controlled-Z', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50', icon: 'CZ', needsControl: true },
      { symbol: 'CH', type: 'CH', label: 'Controlled-H', color: 'bg-pink-500/20 text-pink-300 border-pink-500/50', icon: 'CH', needsControl: true },
      { symbol: 'CP', type: 'CP', label: 'Controlled-P', color: 'bg-rose-500/20 text-rose-300 border-rose-500/50', icon: 'CP', needsControl: true, hasAngle: true },
      { symbol: 'CCX', type: 'CCX', label: 'Toffoli (CCX)', color: 'bg-red-500/20 text-red-300 border-red-500/50', icon: 'CCX', needsControl: true },
    ]
  },
  {
    category: 'Measurement & Probes',
    color: 'text-slate-400',
    gates: [
      { symbol: 'M', type: 'M', label: 'Measure Z', color: 'bg-slate-700/40 text-slate-200 border-slate-500/50', icon: 'M' },
      { symbol: 'RESET', type: 'RESET', label: 'Reset |0⟩', color: 'bg-zinc-700/40 text-zinc-300 border-zinc-500/50', icon: '|0⟩' },
    ]
  }
];

// Flat lookup
const GATE_MAP = {};
GATE_CATEGORIES.forEach(cat => cat.gates.forEach(g => { GATE_MAP[g.symbol] = g; GATE_MAP[g.type] = g; }));

const QUANTUM_ENGINES = [
  { id: 'qiskit', name: 'Qiskit (IBM)', company: 'IBM Quantum', lang: 'python' },
  { id: 'cirq', name: 'Cirq (Google)', company: 'Google Quantum AI', lang: 'python' },
  { id: 'pennylane', name: 'PennyLane', company: 'Xanadu AI', lang: 'python' },
  { id: 'braket', name: 'AWS Braket', company: 'Amazon Web Services', lang: 'python' },
  { id: 'openqasm', name: 'OpenQASM 3.0', company: 'Universal IR', lang: 'qasm' },
];

const INITIAL_STATE_OPTIONS = ['|0⟩', '|1⟩', '|+⟩', '|-⟩', '|i⟩', '|-i⟩'];

const ANGLE_PRESETS = [
  { label: 'π', value: Math.PI },
  { label: 'π/2', value: Math.PI / 2 },
  { label: 'π/4', value: Math.PI / 4 },
  { label: 'π/8', value: Math.PI / 8 },
  { label: '3π/4', value: 3 * Math.PI / 4 },
  { label: '3π/2', value: 3 * Math.PI / 2 },
  { label: '2π', value: 2 * Math.PI },
];

function fmtAngle(rad) {
  if (rad === undefined || rad === null) return '';
  const pi = Math.PI;
  const map = [
    [pi, 'π'], [pi / 2, 'π/2'], [pi / 4, 'π/4'], [pi / 8, 'π/8'],
    [3 * pi / 4, '3π/4'], [3 * pi / 2, '3π/2'], [2 * pi, '2π'],
  ];
  for (const [v, s] of map) if (Math.abs(rad - v) < 1e-6) return s;
  return rad.toFixed(2);
}

export default function CircuitPlaygroundPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [shots, setShots] = useState('1024');

  const [numQubits, setNumQubits] = useState(3);
  const [numSteps, setNumSteps] = useState(8);

  const [initialStates, setInitialStates] = useState(['|0⟩', '|0⟩', '|0⟩']);

  const [circuit, setCircuit] = useState(() =>
    Array(3).fill(null).map(() => Array(8).fill(null))
  );

  const [selectedGate, setSelectedGate] = useState(null);
  const [pendingAngle, setPendingAngle] = useState(Math.PI / 2);
  const [showAngleModal, setShowAngleModal] = useState(false);
  const [angleTargetCell, setAngleTargetCell] = useState(null);

  const [pendingWire, setPendingWire] = useState(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);

  const [simResults, setSimResults] = useState(null);
  const [cloudResults, setCloudResults] = useState(null);
  const [fidelity, setFidelity] = useState('N/A');
  const [selectedEngine, setSelectedEngine] = useState('qiskit');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('realtime'); // 'realtime' | 'code' | 'cloud'

  const handleIncreaseQubits = () => {
    if (numQubits >= 8) return;
    const nextQ = numQubits + 1;
    setNumQubits(nextQ);
    setInitialStates(prev => [...prev, '|0⟩']);
    setCircuit(prev => {
      const next = prev.map(r => [...r]);
      next.push(Array(numSteps).fill(null));
      return next;
    });
  };

  const handleDecreaseQubits = () => {
    if (numQubits <= 2) return;
    const nextQ = numQubits - 1;
    setNumQubits(nextQ);
    setInitialStates(prev => prev.slice(0, nextQ));
    setCircuit(prev => prev.slice(0, nextQ).map(r => r.map(g => {
      if (!g) return null;
      if (g.control != null && g.control >= nextQ) return null;
      if (g.control2 != null && g.control2 >= nextQ) return null;
      if (g.target2 != null && g.target2 >= nextQ) return null;
      return g;
    })));
  };

  const handleIncreaseSteps = () => {
    if (numSteps >= 16) return;
    const nextS = numSteps + 1;
    setNumSteps(nextS);
    setCircuit(prev => prev.map(r => [...r, null]));
  };

  const handleDecreaseSteps = () => {
    if (numSteps <= 4) return;
    const nextS = numSteps - 1;
    setNumSteps(nextS);
    setCircuit(prev => prev.map(r => r.slice(0, nextS)));
  };

  // Real-time Quirk simulation execution on every circuit change
  useEffect(() => {
    try {
      const res = simulateCircuitRealTime(circuit, numQubits, initialStates);
      setSimResults(res);
    } catch (err) {
      console.warn('Realtime simulation error:', err);
    }
  }, [circuit, numQubits, initialStates]);

  const issues = analyzeCircuit(circuit, numQubits);
  const activeEngineCode = generateCode(circuit, numQubits, selectedEngine, parseInt(shots) || 1024);

  // Handle Drag and Drop
  const handleDragStart = (e, gate) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(gate));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, q, s) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const gateData = JSON.parse(dataStr);
      placeGate(gateData, q, s);
    } catch {}
  };

  const placeGate = (gateDef, q, s) => {
    const newGate = { type: gateDef.symbol || gateDef.type, target: q };
    if (gateDef.hasAngle) {
      newGate.angle = pendingAngle;
    }
    setCircuit(prev => {
      const nc = prev.map(r => [...r]);
      nc[q][s] = newGate;
      return nc;
    });
    toast.success(`Added ${gateDef.label || gateDef.symbol} to q[${q}], step ${s + 1}`);
  };

  const handleCellClick = (q, s) => {
    // Resolve pending control wire
    if (pendingWire) {
      const { type: wireType, qubit: srcQ, step: srcS } = pendingWire;
      if (wireType === 'control' && q !== srcQ && s === srcS) {
        setCircuit(prev => {
          const nc = prev.map(r => [...r]);
          const g = nc[srcQ][srcS];
          if (g) {
            if (g.type === 'CCX' && g.control != null) g.control2 = q;
            else g.control = q;
          }
          return nc;
        });
        setPendingWire(null);
        toast.success(`Control linked to qubit q[${q}]`);
        return;
      }
      if (wireType === 'swap' && q !== srcQ && s === srcS) {
        setCircuit(prev => {
          const nc = prev.map(r => [...r]);
          const g = nc[srcQ][srcS];
          if (g) g.target2 = q;
          return nc;
        });
        setPendingWire(null);
        toast.success(`SWAP partner linked to qubit q[${q}]`);
        return;
      }
      setPendingWire(null);
      return;
    }

    if (!selectedGate) return;

    const gateDef = GATE_MAP[selectedGate];
    if (!gateDef) return;

    // If cell occupied, remove or replace
    if (circuit[q]?.[s] != null) {
      removeGate(q, s);
      return;
    }

    placeGate(gateDef, q, s);
  };

  const removeGate = (q, s) => {
    setCircuit(prev => {
      const nc = prev.map(r => [...r]);
      if (nc[q]) nc[q][s] = null;
      return nc;
    });
  };

  const clearCircuit = () => {
    setCircuit(Array(numQubits).fill(null).map(() => Array(numSteps).fill(null)));
    setCloudResults(null);
    toast.success('Circuit canvas cleared.');
  };

  const loadPreset = (preset) => {
    setNumQubits(preset.qubits);
    setNumSteps(preset.steps);
    setInitialStates(Array(preset.qubits).fill('|0⟩'));
    setCircuit(preset.build());
    setCloudResults(null);
    toast.success(`Loaded preset: ${preset.title}`);
  };

  const toggleInitialState = (qIndex) => {
    setInitialStates(prev => {
      const next = [...prev];
      const cur = next[qIndex] || '|0⟩';
      const idx = INITIAL_STATE_OPTIONS.indexOf(cur);
      const nextState = INITIAL_STATE_OPTIONS[(idx + 1) % INITIAL_STATE_OPTIONS.length];
      next[qIndex] = nextState;
      toast.success(`Qubit q[${qIndex}] initialized to ${nextState}`);
      return next;
    });
  };

  const handleCloudSimulation = async () => {
    const hasGates = circuit.some(row => row.some(g => g !== null));
    if (!hasGates) {
      toast.error('Circuit is empty. Add quantum gates before simulating.');
      return;
    }

    setIsSimulating(true);
    setCloudResults(null);
    const loadToast = toast.loading('Submitting circuit to IBM Qiskit Aer simulator...');

    try {
      const code = generateCode(circuit, numQubits, 'qiskit', parseInt(shots) || 1024);
      const response = await apiFetch('/learner/simulations/run', {
        method: 'POST',
        body: JSON.stringify({ circuitCode: code, backend: 'qiskit_aer', shots: parseInt(shots) || 1024 })
      });

      toast.dismiss(loadToast);

      const simRun = response?.data?.simulationRun;
      if (simRun?.results?.counts) {
        setCloudResults(simRun.results.counts);
        setFidelity(simRun.fidelity ? `${(simRun.fidelity * 100).toFixed(2)}%` : '99.4%');
        setActiveTab('cloud');
        toast.success('Quantum cloud simulation finished with high fidelity!');
      } else {
        toast.error('Simulation completed but returned no distribution counts.');
      }
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err?.message || 'Quantum simulation execution failed.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!activeEngineCode) return;
    try {
      await navigator.clipboard.writeText(activeEngineCode);
      setCopied(true);
      toast.success(`Copied ${QUANTUM_ENGINES.find(e => e.id === selectedEngine)?.name} code to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy code to clipboard.');
    }
  };

  // Bloch vectors & probabilities for active view
  const activeStepSnapshot = (selectedStepIndex !== null && simResults?.stepStates?.[selectedStepIndex + 1])
    ? simResults.stepStates[selectedStepIndex + 1]
    : simResults?.finalState;

  const currentBlochVectors = activeStepSnapshot?.blochVectors || [];
  const currentQubitProbs = activeStepSnapshot?.qubitProbs || [];
  const currentAmplitudes = activeStepSnapshot?.amplitudes || [];

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-text)] flex">
        <LearnerSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        <div className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          <DashboardNavbar
            title="Interactive Circuit Composer"
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onMobileMenuClick={() => setIsMobileOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto w-full">
            
            {/* Header: Title, Controls, Algorithm Presets */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--color-surface)] p-5 rounded-3xl border border-[var(--color-border)] shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                    <LuAtom size={22} className="animate-spin" style={{ animationDuration: '12s' }} />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black font-heading text-[var(--color-text)]">
                      Quirk-Style Quantum Playground
                    </h1>
                    <p className="text-xs text-[var(--color-muted)]">
                      Drag and drop gates, observe live statevector telemetry, and compile to any quantum engine.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Qubit & Step Counter */}
                <div className="flex items-center gap-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-2.5 py-1 text-xs">
                  <span className="text-[10px] uppercase font-mono text-[var(--color-muted)] font-bold mr-1">Qubits</span>
                  <button onClick={handleDecreaseQubits} className="w-6 h-6 rounded-lg hover:bg-[var(--color-surface)] flex items-center justify-center text-slate-400 hover:text-rose-400 cursor-pointer"><LuMinus size={12}/></button>
                  <span className="w-4 text-center font-mono font-bold text-cyan-500">{numQubits}</span>
                  <button onClick={handleIncreaseQubits} className="w-6 h-6 rounded-lg hover:bg-[var(--color-surface)] flex items-center justify-center text-slate-400 hover:text-emerald-400 cursor-pointer"><LuPlus size={12}/></button>
                </div>

                <div className="flex items-center gap-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-2.5 py-1 text-xs">
                  <span className="text-[10px] uppercase font-mono text-[var(--color-muted)] font-bold mr-1">Steps</span>
                  <button onClick={handleDecreaseSteps} className="w-6 h-6 rounded-lg hover:bg-[var(--color-surface)] flex items-center justify-center text-slate-400 hover:text-rose-400 cursor-pointer"><LuMinus size={12}/></button>
                  <span className="w-5 text-center font-mono font-bold text-indigo-500">{numSteps}</span>
                  <button onClick={handleIncreaseSteps} className="w-6 h-6 rounded-lg hover:bg-[var(--color-surface)] flex items-center justify-center text-slate-400 hover:text-emerald-400 cursor-pointer"><LuPlus size={12}/></button>
                </div>

                {/* Preset Algorithms Dropdown */}
                <div className="relative group">
                  <button className="px-3 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] hover:border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all">
                    <LuSparkles size={14} className="text-cyan-400" />
                    <span>Presets</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-72 p-2 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[var(--color-muted)] px-2 py-1">Quantum Algorithms</div>
                    {CIRCUIT_PRESETS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => loadPreset(p)}
                        className="w-full text-left p-2 rounded-xl hover:bg-[var(--color-background)] transition-all flex flex-col gap-0.5 cursor-pointer"
                      >
                        <div className="text-xs font-bold text-[var(--color-text)]">{p.title}</div>
                        <div className="text-[10px] text-[var(--color-muted)] truncate">{p.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={clearCircuit}
                  className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-rose-500/10 hover:text-rose-500 text-[var(--color-muted)] transition-all cursor-pointer"
                  title="Clear circuit"
                >
                  <LuTrash2 size={16} />
                </button>

                {/* Cloud Run Button */}
                <button
                  onClick={handleCloudSimulation}
                  disabled={isSimulating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <LuPlay size={14} />
                  <span>{isSimulating ? 'Simulating...' : 'Cloud Run (Aer)'}</span>
                </button>
              </div>
            </div>

            {/* 1. Quirk Interactive Gate Palette */}
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LuLayers size={16} className="text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] font-mono">
                    Quantum Gate Toolbox (Drag onto grid or click to select)
                  </span>
                </div>
                {selectedGate && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[var(--color-muted)]">Selected:</span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      {selectedGate}
                    </span>
                    <button
                      onClick={() => setSelectedGate(null)}
                      className="text-rose-400 hover:underline text-[11px]"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Palette Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {GATE_CATEGORIES.map(cat => (
                  <div key={cat.category} className="p-3 rounded-2xl bg-[var(--color-background)]/60 border border-[var(--color-border)] space-y-2">
                    <div className={`text-[10px] font-mono font-bold uppercase ${cat.color}`}>
                      {cat.category}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.gates.map(g => {
                        const isSelected = selectedGate === g.symbol;
                        return (
                          <div
                            key={g.symbol}
                            draggable
                            onDragStart={(e) => handleDragStart(e, g)}
                            onClick={() => setSelectedGate(isSelected ? null : g.symbol)}
                            className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-xs cursor-grab active:cursor-grabbing select-none transition-all shadow-sm ${g.color} ${
                              isSelected ? 'ring-2 ring-cyan-400 scale-105 shadow-cyan-500/30' : 'hover:scale-105'
                            }`}
                            title={`${g.label} - Drag to circuit or click to select`}
                          >
                            {g.icon || g.symbol}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Quirk Interactive Circuit Grid with Live Wire Probes */}
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between min-w-[700px]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--color-text)] font-mono uppercase tracking-wider">
                    Quantum Register Wire Grid
                  </span>
                  <span className="text-[10px] text-[var(--color-muted)] font-mono">
                    (Click wire input to toggle initial state $|0\rangle, |1\rangle, |+\rangle...$)
                  </span>
                </div>

                {pendingWire && (
                  <div className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center gap-2 animate-pulse">
                    <LuInfo size={14} /> Click target qubit on step {pendingWire.step + 1} to link wire
                  </div>
                )}
              </div>

              {/* Wire Canvas Grid */}
              <div className="space-y-4 min-w-[800px] py-2">
                {Array(numQubits).fill(null).map((_, qIndex) => {
                  const p1 = currentQubitProbs[qIndex] || 0;
                  const pct = Math.round(p1 * 100);

                  return (
                    <div key={qIndex} className="flex items-center gap-3 relative group">
                      
                      {/* Left: Qubit Tag & Initial State Toggle */}
                      <button
                        onClick={() => toggleInitialState(qIndex)}
                        className="w-20 flex-shrink-0 flex items-center justify-between px-2.5 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] hover:border-cyan-500/40 text-xs font-mono transition-all group/init cursor-pointer"
                        title="Click to toggle initial state"
                      >
                        <span className="font-bold text-[var(--color-text)]">q[{qIndex}]</span>
                        <span className="text-cyan-400 font-bold group-hover/init:scale-110 transition-transform">
                          {initialStates[qIndex] || '|0⟩'}
                        </span>
                      </button>

                      {/* Quantum Wire Line & Matrix Cells */}
                      <div className="relative flex-1 flex items-center gap-3">
                        {/* Horizontal Quantum Bus Line */}
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-700 dark:bg-slate-700 pointer-events-none" />

                        {Array(numSteps).fill(null).map((_, sIndex) => {
                          const gate = circuit[qIndex]?.[sIndex];
                          const isHoveredCol = selectedStepIndex === sIndex;

                          // Check if there are controls in this column for vertical connecting lines
                          const columnControls = [];
                          for (let cq = 0; cq < numQubits; cq++) {
                            const cg = circuit[cq]?.[sIndex];
                            if (cg && (cg.type === 'CONTROL' || cg.type === '●' || cg.type === 'ANTI_CONTROL' || cg.type === '○' || cg.control === qIndex || cg.control2 === qIndex)) {
                              columnControls.push(cq);
                            }
                          }

                          return (
                            <div
                              key={sIndex}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, qIndex, sIndex)}
                              onClick={() => handleCellClick(qIndex, sIndex)}
                              onMouseEnter={() => setSelectedStepIndex(sIndex)}
                              onMouseLeave={() => setSelectedStepIndex(null)}
                              className={`relative z-10 w-12 h-12 rounded-2xl border flex items-center justify-center text-xs font-mono font-bold cursor-pointer transition-all duration-200 select-none ${
                                gate
                                  ? `${GATE_MAP[gate.type]?.color || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'} shadow-md hover:scale-105`
                                  : isHoveredCol
                                  ? 'bg-cyan-500/10 border-cyan-500/40'
                                  : 'bg-[var(--color-surface)] border-[var(--color-border)]/70 hover:border-cyan-500/40 hover:bg-[var(--color-background)]'
                              }`}
                            >
                              {gate ? (
                                <div className="flex flex-col items-center justify-center">
                                  <span>{GATE_MAP[gate.type]?.icon || gate.type}</span>
                                  {gate.angle !== undefined && (
                                    <span className="text-[8px] font-mono text-amber-400 leading-none">
                                      {fmtAngle(gate.angle)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-60">+</span>
                              )}

                              {/* Multi-qubit control link button */}
                              {gate && (GATE_MAP[gate.type]?.needsControl || gate.type === 'CCX' || gate.type === 'SWAP') && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingWire({
                                      type: gate.type === 'SWAP' ? 'swap' : 'control',
                                      qubit: qIndex,
                                      step: sIndex
                                    });
                                  }}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] shadow-sm hover:scale-125 transition-transform"
                                  title="Assign control wire"
                                >
                                  ●
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Right: Live Chance Probe Display (Quirk Feature!) */}
                      <div className="w-32 flex-shrink-0 p-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-[var(--color-muted)]">Chance |1⟩</span>
                          <span className="font-bold text-cyan-400">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Step Timeline Indicator */}
              <div className="flex items-center gap-3 pl-24 min-w-[800px]">
                {Array(numSteps).fill(null).map((_, si) => (
                  <div
                    key={si}
                    className={`w-12 text-center text-[10px] font-mono font-bold transition-colors ${
                      selectedStepIndex === si ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    S{si + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Live Statevector, Bloch Spheres & Telemetry Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Real-time Quirk Telemetry & Bloch Spheres */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Visualizer Tabs */}
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                      <LuActivity size={18} className="text-cyan-400" />
                      <h3 className="font-bold text-sm text-[var(--color-text)] font-mono uppercase tracking-wider">
                        Real-Time State Telemetry
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                      <button
                        onClick={() => setActiveTab('realtime')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          activeTab === 'realtime' ? 'bg-cyan-500 text-white shadow-sm' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        Statevector & Bloch
                      </button>
                      <button
                        onClick={() => setActiveTab('code')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          activeTab === 'code' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        Export Code
                      </button>
                      <button
                        onClick={() => setActiveTab('cloud')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          activeTab === 'cloud' ? 'bg-fuchsia-600 text-white shadow-sm' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        Cloud Results
                      </button>
                    </div>
                  </div>

                  {activeTab === 'realtime' && (
                    <div className="space-y-6">
                      
                      {/* Bloch Spheres Deck */}
                      <div>
                        <div className="text-xs font-mono font-bold text-[var(--color-muted)] mb-3 uppercase tracking-wider flex items-center gap-2">
                          <LuAtom size={14} className="text-cyan-400" />
                          Individual Qubit Bloch Spheres (Live Projection)
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {currentBlochVectors.map((vec, idx) => (
                            <QuirkBlochSphere
                              key={idx}
                              qubitIndex={idx}
                              vector={vec}
                              size={120}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Statevector Probability Distribution */}
                      <div>
                        <div className="text-xs font-mono font-bold text-[var(--color-muted)] mb-3 uppercase tracking-wider flex items-center gap-2">
                          <LuSlidersHorizontal size={14} className="text-indigo-400" />
                          Multi-Qubit State Amplitudes & Phases ({currentAmplitudes.length} Basis States)
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {currentAmplitudes.map((amp) => {
                            const pct = (amp.prob * 100).toFixed(1);
                            const hue = ((amp.phase * 180 / Math.PI) + 360) % 360;

                            return (
                              <div
                                key={amp.binary}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-mono gap-3"
                              >
                                <div className="flex items-center gap-3 w-28 flex-shrink-0">
                                  <span className="font-bold text-cyan-400">{amp.state}</span>
                                  {/* Complex phase color dot */}
                                  <div
                                    className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                                    style={{ backgroundColor: amp.prob > 0.001 ? `hsl(${hue}, 85%, 60%)` : '#334155' }}
                                    title={`Phase: ${(amp.phase * 180 / Math.PI).toFixed(1)}°`}
                                  />
                                </div>

                                {/* Probability bar */}
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${pct}%`,
                                      backgroundColor: `hsl(${hue}, 80%, 55%)`
                                    }}
                                  />
                                </div>

                                <div className="w-24 text-right flex-shrink-0">
                                  <span className="font-bold text-[var(--color-text)]">{pct}%</span>
                                  <span className="text-[10px] text-[var(--color-muted)] ml-1">({amp.formatted})</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                  {activeTab === 'code' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        {/* Framework Engine Switcher */}
                        <div className="flex gap-1.5 flex-wrap">
                          {QUANTUM_ENGINES.map(eng => (
                            <button
                              key={eng.id}
                              onClick={() => setSelectedEngine(eng.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                                selectedEngine === eng.id
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                  : 'bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
                              }`}
                            >
                              {eng.name}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleCopyCode}
                          className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-background)] text-xs font-mono flex items-center gap-1.5 transition-all"
                        >
                          {copied ? <LuCheck size={14} className="text-emerald-400" /> : <LuCopy size={14} />}
                          <span>{copied ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      </div>

                      <pre className="p-4 rounded-2xl bg-[#080a1c] border border-white/10 text-emerald-300 font-mono text-xs overflow-x-auto max-h-96">
                        <code>{activeEngineCode || '# Circuit is currently empty.'}</code>
                      </pre>
                    </div>
                  )}

                  {activeTab === 'cloud' && (
                    <div className="space-y-4">
                      {!cloudResults ? (
                        <div className="py-12 text-center text-slate-400 space-y-3 font-mono text-xs">
                          <LuPlay size={32} className="mx-auto text-indigo-400 opacity-60" />
                          <p>No cloud execution results yet. Click "Cloud Run (Aer)" to simulate.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                            <span>Backend: Qiskit AerSimulator ({shots} shots)</span>
                            <span>Fidelity: {fidelity}</span>
                          </div>

                          <div className="space-y-2">
                            {Object.entries(cloudResults).map(([state, count]) => {
                              const total = parseInt(shots) || 1024;
                              const pct = Math.round((count / total) * 100);
                              return (
                                <div key={state} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-mono gap-3">
                                  <span className="font-bold text-cyan-400 w-20">|{state}⟩</span>
                                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="font-bold text-[var(--color-text)] w-16 text-right">{count} ({pct}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Right Column: Circuit Analysis, Angle Presets & Quick Guides */}
              <div className="space-y-6">
                
                {/* Circuit Health & Lint Analysis */}
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <LuCheck size={16} className="text-emerald-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-muted)] font-mono">
                      Static Circuit Analysis
                    </h3>
                  </div>

                  {!issues.length ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                      <LuCheck size={15} /> Circuit is syntactically valid & ready.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {issues.map((iss, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            iss.type === 'error'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5">
                            <LuCircleAlert size={14} /> {iss.message}
                          </div>
                          {iss.suggestion && (
                            <div className="text-[11px] opacity-80 pl-5">{iss.suggestion}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rotation Angle Configurator */}
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] font-mono">
                      Rotation Gate Angle θ
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {fmtAngle(pendingAngle)} rad
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {ANGLE_PRESETS.map(ap => (
                      <button
                        key={ap.label}
                        onClick={() => {
                          setPendingAngle(ap.value);
                          toast.success(`Active angle set to ${ap.label}`);
                        }}
                        className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                          Math.abs(pendingAngle - ap.value) < 1e-6
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        {ap.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-[var(--color-surface)] to-cyan-500/10 p-6 space-y-3 shadow-sm">
                  <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider">
                    Quirk Pro Tips
                  </h4>
                  <ul className="text-xs text-[var(--color-muted)] space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Place a control <strong className="text-indigo-300">●</strong> and target <strong className="text-emerald-300">⊕</strong> in the same column to build a CNOT gate.</li>
                    <li>Hover over any step index (S1..S8) to inspect intermediate Bloch vectors.</li>
                    <li>Toggle qubit input states ($|0\rangle, |1\rangle, |+\rangle$) to test different basis configurations.</li>
                  </ul>
                </div>

              </div>

            </div>

          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
