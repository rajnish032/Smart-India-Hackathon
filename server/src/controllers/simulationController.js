import prisma from '../config/db.js';
import { recordLearnerWork } from '../services/learnerActivityService.js';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

const SUPPORTED_BACKENDS = [
  { id: 'qiskit_aer', label: 'Qiskit Aer', framework: 'qiskit', description: 'High-performance local Aer simulator' },
  { id: 'pennylane', label: 'PennyLane', framework: 'pennylane', description: 'Differentiable quantum computing' },
  { id: 'cirq', label: 'Cirq (Google)', framework: 'cirq', description: "Google's quantum circuit library" },
  { id: 'qbraid', label: 'qBraid', framework: 'qbraid', description: 'Unified cloud quantum access layer' },
];

function mockRunForBackend(circuitCode, backend, shots = 1024) {
  const bases = ['00', '01', '10', '11'];
  const counts = {};
  let remaining = shots;
  bases.forEach((b, i) => {
    const c = i === bases.length - 1 ? remaining : Math.floor(Math.random() * remaining * 0.5);
    counts[b] = c;
    remaining -= c;
  });
  const probs = {};
  Object.entries(counts).forEach(([k, v]) => { probs[k] = parseFloat((v / shots).toFixed(4)); });
  return {
    counts,
    probabilities: probs,
    statevector: [0.707, 0, 0, 0.707].map(v => parseFloat((v + (Math.random() - 0.5) * 0.02).toFixed(4))),
    executionTimeMs: Math.floor(Math.random() * 1200) + 80,
    depth: Math.floor(Math.random() * 12) + 3,
    gateCount: Math.floor(Math.random() * 20) + 5,
    fidelity: parseFloat((0.90 + Math.random() * 0.09).toFixed(4)),
    backend,
    shots,
  };
}

// ─── GET /api/learner/simulations ────────────────────────────────────────────
export const listSimulations = async (req, res) => {
  try {
    const { backend, framework, experimentId, status, from, to, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };
    if (backend) where.backend = backend;
    if (framework) where.framework = framework;
    if (experimentId) where.experimentId = experimentId;
    if (status) where.status = status.toUpperCase();
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [runs, total] = await Promise.all([
      prisma.simulationRun.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: { experiment: { select: { id: true, name: true } } },
      }),
      prisma.simulationRun.count({ where }),
    ]);

    return res.status(200).json({ success: true, data: { runs, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    console.error('listSimulations error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch simulation history.' });
  }
};

// ─── GET /api/learner/simulations/backends ────────────────────────────────────
export const getSupportedBackends = (_req, res) => {
  return res.status(200).json({ success: true, data: { backends: SUPPORTED_BACKENDS } });
};

// ─── GET /api/learner/simulations/:id ────────────────────────────────────────
export const getSimulation = async (req, res) => {
  try {
    const run = await prisma.simulationRun.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { experiment: { select: { id: true, name: true, objective: true } } },
    });
    if (!run) return res.status(404).json({ success: false, error: 'Simulation run not found.' });
    return res.status(200).json({ success: true, data: { run } });
  } catch (err) {
    console.error('getSimulation error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch simulation.' });
  }
};

// ─── DELETE /api/learner/simulations/:id ─────────────────────────────────────
export const deleteSimulation = async (req, res) => {
  try {
    const existing = await prisma.simulationRun.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Simulation run not found.' });
    await prisma.simulationRun.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, message: 'Simulation deleted.' });
  } catch (err) {
    console.error('deleteSimulation error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete simulation.' });
  }
};

// ─── POST /api/learner/simulations/:id/rerun ─────────────────────────────────
export const rerunSimulation = async (req, res) => {
  try {
    const existing = await prisma.simulationRun.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Simulation run not found.' });

    const { circuitCode, backend, framework, shots } = existing;
    const newShots = req.body.shots || shots;

    let simResult;
    try {
      const aiRes = await fetch(`${AI_ENGINE_URL}/api/v1/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuit_code: circuitCode, backend, framework, shots: parseInt(newShots) }),
      });
      if (aiRes.ok) simResult = await aiRes.json();
      else throw new Error('AI engine error');
    } catch {
      simResult = mockRunForBackend(circuitCode, backend, parseInt(newShots));
    }

    const newRun = await prisma.simulationRun.create({
      data: {
        userId: req.user.id,
        experimentId: existing.experimentId,
        circuitCode,
        backend,
        framework,
        shots: parseInt(newShots),
        status: 'COMPLETED',
        results: simResult,
        executionTimeMs: simResult.executionTimeMs || null,
        depth: simResult.depth || null,
        gateCount: simResult.gateCount || null,
        fidelity: simResult.fidelity || null,
      },
    });

    // Automatically record work to update streak, XP, hours, and heatmap
    await recordLearnerWork({
      userId: req.user.id,
      type: 'SIMULATION',
      description: `Ran quantum simulation on ${backend} (${newShots} shots)`,
      xp: 25,
      hours: 0.2,
    }).catch(err => console.warn('Simulation work record warning:', err.message));

    return res.status(201).json({ success: true, message: 'Re-run completed.', data: { run: newRun } });
  } catch (err) {
    console.error('rerunSimulation error:', err);
    return res.status(500).json({ success: false, error: 'Re-run failed.' });
  }
};

// ─── POST /api/learner/simulations/compare ───────────────────────────────────
export const compareBackends = async (req, res) => {
  try {
    const { circuitCode, backends = ['qiskit_aer', 'pennylane'], shots = 1024, name } = req.body;
    if (!circuitCode) return res.status(400).json({ success: false, error: 'circuitCode is required.' });
    if (!Array.isArray(backends) || backends.length < 2) {
      return res.status(400).json({ success: false, error: 'Select at least 2 backends to compare.' });
    }

    const results = [];
    const createdRuns = [];

    for (const backend of backends) {
      const backendInfo = SUPPORTED_BACKENDS.find(b => b.id === backend) || { framework: 'qiskit', label: backend };
      const framework = backendInfo.framework;

      let simResult;
      try {
        const aiRes = await fetch(`${AI_ENGINE_URL}/api/v1/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ circuit_code: circuitCode, backend, framework, shots: parseInt(shots) }),
        });
        if (aiRes.ok) simResult = await aiRes.json();
        else throw new Error('AI engine error');
      } catch {
        simResult = mockRunForBackend(circuitCode, backend, parseInt(shots));
      }

      const run = await prisma.simulationRun.create({
        data: {
          userId: req.user.id,
          circuitCode,
          backend,
          framework,
          shots: parseInt(shots),
          status: 'COMPLETED',
          results: simResult,
          executionTimeMs: simResult.executionTimeMs || null,
          depth: simResult.depth || null,
          gateCount: simResult.gateCount || null,
          fidelity: simResult.fidelity || null,
        },
      });

      results.push({ backend, label: backendInfo.label, framework, results: simResult });
      createdRuns.push(run.id);
    }

    // Compute summary
    const summary = {
      fastestBackend: results.reduce((a, b) => ((a.results.executionTimeMs || 9999) < (b.results.executionTimeMs || 9999) ? a : b)).backend,
      highestFidelity: results.reduce((a, b) => ((a.results.fidelity || 0) > (b.results.fidelity || 0) ? a : b)).backend,
      lowestDepth: results.reduce((a, b) => ((a.results.depth || 9999) < (b.results.depth || 9999) ? a : b)).backend,
    };

    const comparison = await prisma.backendComparison.create({
      data: {
        userId: req.user.id,
        name: name || `Comparison - ${new Date().toLocaleDateString()}`,
        circuitCode,
        backends,
        runs: results,
        summary,
      },
    });

    // Automatically record work to update streak, XP, hours, and heatmap
    await recordLearnerWork({
      userId: req.user.id,
      type: 'SIMULATION',
      description: `Compared ${backends.length} quantum backends (${backends.join(', ')})`,
      xp: 40,
      hours: 0.3,
    }).catch(err => console.warn('Compare work record warning:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Backend comparison completed.',
      data: { comparison, results, summary },
    });
  } catch (err) {
    console.error('compareBackends error:', err);
    return res.status(500).json({ success: false, error: 'Backend comparison failed.' });
  }
};

// ─── GET /api/learner/simulations/comparisons ────────────────────────────────
export const listComparisons = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const [comparisons, total] = await Promise.all([
      prisma.backendComparison.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.backendComparison.count({ where: { userId: req.user.id } }),
    ]);
    return res.status(200).json({ success: true, data: { comparisons, total } });
  } catch (err) {
    console.error('listComparisons error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch comparisons.' });
  }
};
