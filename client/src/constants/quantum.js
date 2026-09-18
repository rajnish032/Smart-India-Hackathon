/**
 * Shared quantum engine definitions used across the playground and code generator.
 */
export const QUANTUM_ENGINES = [
  { id: 'qiskit',    name: 'Qiskit',    company: 'IBM Quantum' },
  { id: 'cirq',      name: 'Cirq',      company: 'Google' },
  { id: 'pennylane', name: 'PennyLane', company: 'Xanadu' },
  { id: 'braket',    name: 'Braket',    company: 'AWS' },
  { id: 'openqasm',  name: 'OpenQASM',  company: 'Universal IR' },
];

export const QUANTUM_BACKENDS = [
  { id: 'qiskit_aer', label: 'Qiskit Aer',  color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  { id: 'pennylane',  label: 'PennyLane',   color: 'bg-violet-500/15 text-violet-400 border-violet-500/40' },
  { id: 'cirq',       label: 'Cirq',        color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  { id: 'qbraid',     label: 'qBraid',      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
];

export const SHOT_OPTIONS = [256, 512, 1024, 4096, 8192];
