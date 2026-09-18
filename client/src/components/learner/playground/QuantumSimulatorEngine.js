/**
 * QuantumSimulatorEngine.js
 * Real-time Quantum Statevector Simulator & Bloch Sphere Computer for Quirk-style playground
 */

// ─── Complex Number Math ──────────────────────────────────────────────────────
export class Complex {
  constructor(re = 0, im = 0) {
    this.re = re;
    this.im = im;
  }

  static fromAngle(rad) {
    return new Complex(Math.cos(rad), Math.sin(rad));
  }

  add(c) {
    return new Complex(this.re + c.re, this.im + c.im);
  }

  sub(c) {
    return new Complex(this.re - c.re, this.im - c.im);
  }

  mul(c) {
    if (typeof c === 'number') return new Complex(this.re * c, this.im * c);
    return new Complex(
      this.re * c.re - this.im * c.im,
      this.re * c.im + this.im * c.re
    );
  }

  abs2() {
    return this.re * this.re + this.im * this.im;
  }

  abs() {
    return Math.sqrt(this.abs2());
  }

  phase() {
    return Math.atan2(this.im, this.re);
  }

  format(prec = 3) {
    const r = Math.abs(this.re) < 1e-6 ? 0 : this.re;
    const i = Math.abs(this.im) < 1e-6 ? 0 : this.im;
    if (i === 0) return `${r.toFixed(prec)}`;
    if (r === 0) return `${i.toFixed(prec)}i`;
    return `${r.toFixed(prec)} ${i >= 0 ? '+' : '-'} ${Math.abs(i).toFixed(prec)}i`;
  }
}

// ─── Standard Quantum Gate Matrices (2x2) ─────────────────────────────────────
const SQRT1_2 = 1 / Math.SQRT2;

export const SINGLE_GATE_MATRICES = {
  H: [
    [new Complex(SQRT1_2), new Complex(SQRT1_2)],
    [new Complex(SQRT1_2), new Complex(-SQRT1_2)],
  ],
  X: [
    [new Complex(0), new Complex(1)],
    [new Complex(1), new Complex(0)],
  ],
  Y: [
    [new Complex(0), new Complex(0, -1)],
    [new Complex(0, 1), new Complex(0)],
  ],
  Z: [
    [new Complex(1), new Complex(0)],
    [new Complex(0), new Complex(-1)],
  ],
  S: [
    [new Complex(1), new Complex(0)],
    [new Complex(0), new Complex(0, 1)],
  ],
  SDG: [
    [new Complex(1), new Complex(0)],
    [new Complex(0), new Complex(0, -1)],
  ],
  T: [
    [new Complex(1), new Complex(0)],
    [new Complex(0), Complex.fromAngle(Math.PI / 4)],
  ],
  TDG: [
    [new Complex(1), new Complex(0)],
    [new Complex(0), Complex.fromAngle(-Math.PI / 4)],
  ],
  SX: [
    [new Complex(0.5, 0.5), new Complex(0.5, -0.5)],
    [new Complex(0.5, -0.5), new Complex(0.5, 0.5)],
  ],
  NOT: [
    [new Complex(0), new Complex(1)],
    [new Complex(1), new Complex(0)],
  ],
};

export function getRotationMatrix(type, angle = 0) {
  const half = angle / 2;
  const cos = Math.cos(half);
  const sin = Math.sin(half);

  if (type === 'RX') {
    return [
      [new Complex(cos), new Complex(0, -sin)],
      [new Complex(0, -sin), new Complex(cos)],
    ];
  }
  if (type === 'RY') {
    return [
      [new Complex(cos), new Complex(-sin)],
      [new Complex(sin), new Complex(cos)],
    ];
  }
  if (type === 'RZ') {
    return [
      [Complex.fromAngle(-half), new Complex(0)],
      [new Complex(0), Complex.fromAngle(half)],
    ];
  }
  if (type === 'P' || type === 'PHASE') {
    return [
      [new Complex(1), new Complex(0)],
      [new Complex(0), Complex.fromAngle(angle)],
    ];
  }
  return SINGLE_GATE_MATRICES.H;
}

// ─── Statevector Simulator Core ───────────────────────────────────────────────
export class QuantumStatevector {
  constructor(numQubits = 2, initialStates = []) {
    this.numQubits = numQubits;
    this.dim = 1 << numQubits;
    this.amplitudes = new Array(this.dim).fill(null).map(() => new Complex(0, 0));

    // Initialize state (default |0...0⟩ or custom product state)
    if (!initialStates || initialStates.length === 0) {
      this.amplitudes[0] = new Complex(1, 0);
    } else {
      // Build product state of single-qubit states
      let state = [new Complex(1, 0)];
      for (let q = 0; q < numQubits; q++) {
        const init = initialStates[q] || '|0⟩';
        let q0 = new Complex(1, 0), q1 = new Complex(0, 0);
        if (init === '|1⟩') { q0 = new Complex(0, 0); q1 = new Complex(1, 0); }
        else if (init === '|+⟩') { q0 = new Complex(SQRT1_2, 0); q1 = new Complex(SQRT1_2, 0); }
        else if (init === '|-⟩') { q0 = new Complex(SQRT1_2, 0); q1 = new Complex(-SQRT1_2, 0); }
        else if (init === '|i⟩') { q0 = new Complex(SQRT1_2, 0); q1 = new Complex(0, SQRT1_2); }
        else if (init === '|-i⟩') { q0 = new Complex(SQRT1_2, 0); q1 = new Complex(0, -SQRT1_2); }

        const next = [];
        for (let i = 0; i < state.length; i++) {
          next.push(state[i].mul(q0));
          next.push(state[i].mul(q1));
        }
        state = next;
      }
      this.amplitudes = state;
    }
  }

  clone() {
    const copy = new QuantumStatevector(this.numQubits);
    copy.amplitudes = this.amplitudes.map(c => new Complex(c.re, c.im));
    return copy;
  }

  // Apply single-qubit 2x2 unitary matrix
  apply1QubitGate(matrix, targetQubit, controlConditions = []) {
    const nextAmps = new Array(this.dim).fill(null).map(() => new Complex(0, 0));
    const targetMask = 1 << (this.numQubits - 1 - targetQubit);

    for (let i = 0; i < this.dim; i++) {
      // Check if control conditions are satisfied
      let controlsSatisfied = true;
      for (const ctrl of controlConditions) {
        const ctrlMask = 1 << (this.numQubits - 1 - ctrl.qubit);
        const bit = (i & ctrlMask) ? 1 : 0;
        if (bit !== ctrl.condition) {
          controlsSatisfied = false;
          break;
        }
      }

      if (!controlsSatisfied) {
        nextAmps[i] = nextAmps[i].add(this.amplitudes[i]);
        continue;
      }

      // If controls are satisfied, apply 2x2 matrix
      const bitVal = (i & targetMask) ? 1 : 0;
      const partnerIdx = i ^ targetMask;

      if (bitVal === 0) {
        const a0 = this.amplitudes[i];
        const a1 = this.amplitudes[partnerIdx];
        nextAmps[i] = nextAmps[i].add(a0.mul(matrix[0][0])).add(a1.mul(matrix[0][1]));
        nextAmps[partnerIdx] = nextAmps[partnerIdx].add(a0.mul(matrix[1][0])).add(a1.mul(matrix[1][1]));
      }
    }

    this.amplitudes = nextAmps;
  }

  // Apply SWAP gate
  applySwap(q1, q2, controlConditions = []) {
    const nextAmps = [...this.amplitudes];
    const mask1 = 1 << (this.numQubits - 1 - q1);
    const mask2 = 1 << (this.numQubits - 1 - q2);

    for (let i = 0; i < this.dim; i++) {
      let controlsSatisfied = true;
      for (const ctrl of controlConditions) {
        const ctrlMask = 1 << (this.numQubits - 1 - ctrl.qubit);
        if (((i & ctrlMask) ? 1 : 0) !== ctrl.condition) {
          controlsSatisfied = false;
          break;
        }
      }
      if (!controlsSatisfied) continue;

      const b1 = (i & mask1) ? 1 : 0;
      const b2 = (i & mask2) ? 1 : 0;
      if (b1 !== b2) {
        const j = i ^ mask1 ^ mask2;
        if (i < j) {
          const temp = nextAmps[i];
          nextAmps[i] = nextAmps[j];
          nextAmps[j] = temp;
        }
      }
    }
    this.amplitudes = nextAmps;
  }

  // Compute probability of ON (1) for each individual qubit wire
  getQubitProbabilities() {
    const probs = new Array(this.numQubits).fill(0);
    for (let q = 0; q < this.numQubits; q++) {
      const mask = 1 << (this.numQubits - 1 - q);
      let p1 = 0;
      for (let i = 0; i < this.dim; i++) {
        if (i & mask) {
          p1 += this.amplitudes[i].abs2();
        }
      }
      probs[q] = Math.min(1, Math.max(0, p1));
    }
    return probs;
  }

  // Compute Bloch Sphere Coordinates (x, y, z) and purity for each qubit
  getBlochVectors() {
    const vectors = [];
    for (let q = 0; q < this.numQubits; q++) {
      const mask = 1 << (this.numQubits - 1 - q);
      let rho00 = 0, rho11 = 0;
      let rho01 = new Complex(0, 0);

      for (let i = 0; i < this.dim; i++) {
        if ((i & mask) === 0) {
          const a0 = this.amplitudes[i];
          const a1 = this.amplitudes[i ^ mask];
          rho00 += a0.abs2();
          rho11 += a1.abs2();
          // a0 * conj(a1)
          rho01 = rho01.add(new Complex(
            a0.re * a1.re + a0.im * a1.im,
            a0.im * a1.re - a0.re * a1.im
          ));
        }
      }

      const x = 2 * rho01.re;
      const y = 2 * rho01.im;
      const z = rho00 - rho11;
      const len = Math.sqrt(x * x + y * y + z * z);
      const theta = Math.acos(Math.max(-1, Math.min(1, len > 1e-6 ? z / len : 0)));
      const phi = Math.atan2(y, x);

      vectors.push({
        x: Math.abs(x) < 1e-5 ? 0 : x,
        y: Math.abs(y) < 1e-5 ? 0 : y,
        z: Math.abs(z) < 1e-5 ? 0 : z,
        length: Math.min(1, len),
        purity: Math.min(1, len),
        theta,
        phi,
        prob1: rho11,
      });
    }
    return vectors;
  }

  // Return full state amplitudes & probabilities
  getStateAmplitudes() {
    return this.amplitudes.map((amp, idx) => {
      const binary = idx.toString(2).padStart(this.numQubits, '0');
      const prob = amp.abs2();
      const phase = amp.phase();
      return {
        index: idx,
        state: `|${binary}⟩`,
        binary,
        re: amp.re,
        im: amp.im,
        prob,
        phase,
        formatted: amp.format(3),
      };
    });
  }
}

// ─── Step-By-Step Simulation Evaluator ─────────────────────────────────────────
export function simulateCircuitRealTime(circuit, numQubits, initialStates = []) {
  if (!circuit || !Array.isArray(circuit) || circuit.length === 0) {
    const defaultState = new QuantumStatevector(numQubits || 2, initialStates);
    const snap = {
      stepIndex: -1,
      blochVectors: defaultState.getBlochVectors(),
      qubitProbs: defaultState.getQubitProbabilities(),
      amplitudes: defaultState.getStateAmplitudes(),
    };
    return {
      stepStates: [snap],
      finalState: snap,
      finalBloch: snap.blochVectors,
      finalProbs: snap.qubitProbs,
      finalAmplitudes: snap.amplitudes,
    };
  }

  const actualQubits = Math.min(numQubits || 2, circuit.length);
  const numSteps = circuit[0]?.length || 0;
  const stepStates = [];

  let currentState = new QuantumStatevector(actualQubits, initialStates);

  // Step 0: Initial state
  stepStates.push({
    stepIndex: -1,
    blochVectors: currentState.getBlochVectors(),
    qubitProbs: currentState.getQubitProbabilities(),
    amplitudes: currentState.getStateAmplitudes(),
  });

  for (let s = 0; s < numSteps; s++) {
    // 1. Collect control nodes & gates in this column
    const controls = [];
    const gatesInColumn = [];

    for (let q = 0; q < actualQubits; q++) {
      const g = circuit[q]?.[s];
      if (!g) continue;

      if (g.type === 'CONTROL' || g.type === '●') {
        controls.push({ qubit: q, condition: 1 });
      } else if (g.type === 'ANTI_CONTROL' || g.type === '○') {
        controls.push({ qubit: q, condition: 0 });
      } else {
        gatesInColumn.push({ qubit: q, gate: g });
      }
    }

    // 2. Apply gates in this column
    for (const { qubit, gate } of gatesInColumn) {
      // Legacy CX/CCX inline control handling or column-level control linking
      const combinedControls = [...controls];
      if (gate.control != null && !combinedControls.some(c => c.qubit === gate.control)) {
        combinedControls.push({ qubit: gate.control, condition: 1 });
      }
      if (gate.control2 != null && !combinedControls.some(c => c.qubit === gate.control2)) {
        combinedControls.push({ qubit: gate.control2, condition: 1 });
      }

      if (gate.type === 'SWAP' || gate.type === 'CSWAP') {
        const partner = gate.target2 != null ? gate.target2 : (qubit + 1 < numQubits ? qubit + 1 : 0);
        currentState.applySwap(qubit, partner, combinedControls);
      } else if (['RX', 'RY', 'RZ', 'P', 'CP'].includes(gate.type)) {
        const mat = getRotationMatrix(gate.type === 'CP' ? 'P' : gate.type, gate.angle || 0);
        currentState.apply1QubitGate(mat, qubit, combinedControls);
      } else if (SINGLE_GATE_MATRICES[gate.type]) {
        currentState.apply1QubitGate(SINGLE_GATE_MATRICES[gate.type], qubit, combinedControls);
      } else if (gate.type === 'CX' || gate.type === '⊕') {
        currentState.apply1QubitGate(SINGLE_GATE_MATRICES.X, qubit, combinedControls);
      } else if (gate.type === 'CY') {
        currentState.apply1QubitGate(SINGLE_GATE_MATRICES.Y, qubit, combinedControls);
      } else if (gate.type === 'CZ') {
        currentState.apply1QubitGate(SINGLE_GATE_MATRICES.Z, qubit, combinedControls);
      } else if (gate.type === 'CH') {
        currentState.apply1QubitGate(SINGLE_GATE_MATRICES.H, qubit, combinedControls);
      } else if (gate.type === 'CCX') {
        currentState.apply1QubitGate(SINGLE_GATE_MATRICES.X, qubit, combinedControls);
      }
    }

    // Record snapshot after this column
    stepStates.push({
      stepIndex: s,
      blochVectors: currentState.getBlochVectors(),
      qubitProbs: currentState.getQubitProbabilities(),
      amplitudes: currentState.getStateAmplitudes(),
    });
  }

  const finalSnapshot = stepStates[stepStates.length - 1];

  return {
    stepStates,
    finalState: finalSnapshot,
    finalBloch: finalSnapshot.blochVectors,
    finalProbs: finalSnapshot.qubitProbs,
    finalAmplitudes: finalSnapshot.amplitudes,
  };
}
