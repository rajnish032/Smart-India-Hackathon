/**
 * CircuitPresets.js
 * Comprehensive library of pre-built quantum algorithms and circuits in Quirk format
 */

export const CIRCUIT_PRESETS = [
  {
    id: 'bell_state',
    title: 'Bell State |Φ+⟩ (Entanglement)',
    category: 'Foundations',
    description: 'Generates maximal entanglement between 2 qubits (|00⟩ + |11⟩)/√2.',
    qubits: 2,
    steps: 6,
    build: () => {
      const c = Array(2).fill(null).map(() => Array(6).fill(null));
      c[0][0] = { type: 'H', target: 0 };
      c[1][1] = { type: 'CX', target: 1, control: 0 };
      return c;
    }
  },
  {
    id: 'ghz_3',
    title: 'GHZ State (3-Qubit Entanglement)',
    category: 'Entanglement',
    description: 'Greenberger–Horne–Zeilinger tripartite entangled state (|000⟩ + |111⟩)/√2.',
    qubits: 3,
    steps: 6,
    build: () => {
      const c = Array(3).fill(null).map(() => Array(6).fill(null));
      c[0][0] = { type: 'H', target: 0 };
      c[1][1] = { type: 'CX', target: 1, control: 0 };
      c[2][2] = { type: 'CX', target: 2, control: 1 };
      return c;
    }
  },
  {
    id: 'quantum_teleportation',
    title: 'Quantum Teleportation Protocol',
    category: 'Communication',
    description: 'Transfers an unknown quantum state from Alice to Bob using entanglement and classical feedforward.',
    qubits: 3,
    steps: 8,
    build: () => {
      const c = Array(3).fill(null).map(() => Array(8).fill(null));
      // State preparation on q0
      c[0][0] = { type: 'RY', target: 0, angle: Math.PI / 3 };
      // Bell pair between q1 and q2
      c[1][1] = { type: 'H', target: 1 };
      c[2][2] = { type: 'CX', target: 2, control: 1 };
      // Bell measurement on Alice side (q0, q1)
      c[1][3] = { type: 'CX', target: 1, control: 0 };
      c[0][4] = { type: 'H', target: 0 };
      c[0][5] = { type: 'M', target: 0 };
      c[1][5] = { type: 'M', target: 1 };
      // Bob correction
      c[2][6] = { type: 'CX', target: 2, control: 1 };
      c[2][7] = { type: 'CZ', target: 2, control: 0 };
      return c;
    }
  },
  {
    id: 'superdense_coding',
    title: 'Superdense Coding',
    category: 'Communication',
    description: 'Transmits 2 classical bits of information using only 1 transmitted physical qubit and a shared Bell pair.',
    qubits: 2,
    steps: 6,
    build: () => {
      const c = Array(2).fill(null).map(() => Array(6).fill(null));
      // Entangle
      c[0][0] = { type: 'H', target: 0 };
      c[1][1] = { type: 'CX', target: 1, control: 0 };
      // Alice encodes bits "11" -> X and Z
      c[0][2] = { type: 'X', target: 0 };
      c[0][3] = { type: 'Z', target: 0 };
      // Bob decodes
      c[1][4] = { type: 'CX', target: 1, control: 0 };
      c[0][5] = { type: 'H', target: 0 };
      return c;
    }
  },
  {
    id: 'grover_2qubit',
    title: "Grover's Search Algorithm (N=4)",
    category: 'Algorithms',
    description: "Finds the marked target state |11⟩ with 100% probability in a single Grover query iteration.",
    qubits: 2,
    steps: 7,
    build: () => {
      const c = Array(2).fill(null).map(() => Array(7).fill(null));
      // Superposition
      c[0][0] = { type: 'H', target: 0 };
      c[1][0] = { type: 'H', target: 1 };
      // Oracle: Phase flip |11⟩ with CZ
      c[1][1] = { type: 'CZ', target: 1, control: 0 };
      // Diffuser
      c[0][2] = { type: 'H', target: 0 };
      c[1][2] = { type: 'H', target: 1 };
      c[0][3] = { type: 'X', target: 0 };
      c[1][3] = { type: 'X', target: 1 };
      c[1][4] = { type: 'CZ', target: 1, control: 0 };
      c[0][5] = { type: 'X', target: 0 };
      c[1][5] = { type: 'X', target: 1 };
      c[0][6] = { type: 'H', target: 0 };
      c[1][6] = { type: 'H', target: 1 };
      return c;
    }
  },
  {
    id: 'deutsch_jozsa',
    title: 'Deutsch-Jozsa Algorithm',
    category: 'Algorithms',
    description: 'Determines whether a hidden Boolean function is constant or balanced in a single evaluation.',
    qubits: 3,
    steps: 6,
    build: () => {
      const c = Array(3).fill(null).map(() => Array(6).fill(null));
      // Ancilla |1⟩
      c[2][0] = { type: 'X', target: 2 };
      // Superposition on all qubits
      c[0][1] = { type: 'H', target: 0 };
      c[1][1] = { type: 'H', target: 1 };
      c[2][1] = { type: 'H', target: 2 };
      // Balanced Oracle f(x0, x1) = x0 ^ x1
      c[2][2] = { type: 'CX', target: 2, control: 0 };
      c[2][3] = { type: 'CX', target: 2, control: 1 };
      // Interfere input qubits
      c[0][4] = { type: 'H', target: 0 };
      c[1][4] = { type: 'H', target: 1 };
      return c;
    }
  },
  {
    id: 'qft_3qubit',
    title: 'Quantum Fourier Transform (3-Qubit QFT)',
    category: 'Transforms',
    description: 'Maps computational basis states to frequency/phase domain states.',
    qubits: 3,
    steps: 7,
    build: () => {
      const c = Array(3).fill(null).map(() => Array(7).fill(null));
      c[0][0] = { type: 'H', target: 0 };
      c[0][1] = { type: 'CP', target: 0, control: 1, angle: Math.PI / 2 };
      c[0][2] = { type: 'CP', target: 0, control: 2, angle: Math.PI / 4 };
      c[1][3] = { type: 'H', target: 1 };
      c[1][4] = { type: 'CP', target: 1, control: 2, angle: Math.PI / 2 };
      c[2][5] = { type: 'H', target: 2 };
      c[0][6] = { type: 'SWAP', target: 0, target2: 2 };
      return c;
    }
  },
  {
    id: 'quantum_adder',
    title: 'Quantum Half-Adder (Toffoli + CNOT)',
    category: 'Arithmetic',
    description: 'Computes sum (A ^ B) and carry (A & B) using Toffoli (CCX) and CNOT gates.',
    qubits: 3,
    steps: 5,
    build: () => {
      const c = Array(3).fill(null).map(() => Array(5).fill(null));
      // Inputs: A=1 on q0, B=1 on q1
      c[0][0] = { type: 'X', target: 0 };
      c[1][0] = { type: 'X', target: 1 };
      // Carry into q2
      c[2][1] = { type: 'CCX', target: 2, control: 0, control2: 1 };
      // Sum into q1
      c[1][2] = { type: 'CX', target: 1, control: 0 };
      return c;
    }
  }
];
