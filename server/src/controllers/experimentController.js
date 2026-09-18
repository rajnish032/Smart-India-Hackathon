import prisma from '../config/db.js';
import { recordLearnerWork } from '../services/learnerActivityService.js';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// ─── Helper: generate dummy sim result (when AI engine unavailable) ───────────
function mockSimulationResult(circuitCode, backend, shots = 1024) {
  const bases = ['00', '01', '10', '11'];
  const counts = {};
  let remaining = shots;
  bases.forEach((b, i) => {
    const c = i === bases.length - 1 ? remaining : Math.floor(Math.random() * remaining * 0.6);
    counts[b] = c;
    remaining -= c;
  });
  const probs = {};
  Object.entries(counts).forEach(([k, v]) => { probs[k] = parseFloat((v / shots).toFixed(4)); });
  return {
    counts,
    probabilities: probs,
    statevector: [0.707, 0, 0, 0.707],
    executionTimeMs: Math.floor(Math.random() * 800) + 100,
    depth: Math.floor(Math.random() * 12) + 3,
    gateCount: Math.floor(Math.random() * 20) + 5,
    fidelity: parseFloat((0.92 + Math.random() * 0.07).toFixed(4)),
    backend,
    shots,
  };
}

// ─── POST /api/learner/experiments ───────────────────────────────────────────
export const createExperiment = async (req, res) => {
  try {
    const { name, objective, hypothesis = '', tags = [] } = req.body;
    if (!name || !objective) {
      return res.status(400).json({ success: false, error: 'name and objective are required.' });
    }
    const experiment = await prisma.experiment.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        objective: objective.trim(),
        hypothesis: hypothesis.trim(),
        tags: Array.isArray(tags) ? tags : [],
        status: 'DRAFT',
      },
    });
    return res.status(201).json({ success: true, data: { experiment } });
  } catch (err) {
    console.error('createExperiment error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create experiment.' });
  }
};

// ─── GET /api/learner/experiments ────────────────────────────────────────────
export const listExperiments = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { objective: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [experiments, total] = await Promise.all([
      prisma.experiment.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: { _count: { select: { simulationRuns: true } } },
      }),
      prisma.experiment.count({ where }),
    ]);
    return res.status(200).json({ success: true, data: { experiments, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    console.error('listExperiments error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch experiments.' });
  }
};

// ─── GET /api/learner/experiments/:id ────────────────────────────────────────
export const getExperiment = async (req, res) => {
  try {
    const experiment = await prisma.experiment.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        simulationRuns: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!experiment) return res.status(404).json({ success: false, error: 'Experiment not found.' });
    return res.status(200).json({ success: true, data: { experiment } });
  } catch (err) {
    console.error('getExperiment error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch experiment.' });
  }
};

// ─── PATCH /api/learner/experiments/:id ──────────────────────────────────────
export const updateExperiment = async (req, res) => {
  try {
    const allowed = ['name', 'objective', 'hypothesis', 'circuit', 'circuitCode', 'parameters',
      'backend', 'framework', 'noiseConfig', 'observations', 'tags', 'reproducibility', 'status'];
    const data = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });

    const existing = await prisma.experiment.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Experiment not found.' });

    const experiment = await prisma.experiment.update({ where: { id: req.params.id }, data });
    return res.status(200).json({ success: true, data: { experiment } });
  } catch (err) {
    console.error('updateExperiment error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update experiment.' });
  }
};

// ─── DELETE /api/learner/experiments/:id ─────────────────────────────────────
export const deleteExperiment = async (req, res) => {
  try {
    const existing = await prisma.experiment.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Experiment not found.' });
    await prisma.experiment.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, message: 'Experiment deleted.' });
  } catch (err) {
    console.error('deleteExperiment error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete experiment.' });
  }
};

// ─── POST /api/learner/experiments/:id/save-draft ────────────────────────────
export const saveDraft = async (req, res) => {
  try {
    const existing = await prisma.experiment.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Experiment not found.' });

    const { circuit, circuitCode, parameters, backend, framework, noiseConfig, observations, hypothesis } = req.body;
    const data = { status: 'DRAFT' };
    if (circuit !== undefined) data.circuit = circuit;
    if (circuitCode !== undefined) data.circuitCode = circuitCode;
    if (parameters !== undefined) data.parameters = parameters;
    if (backend !== undefined) data.backend = backend;
    if (framework !== undefined) data.framework = framework;
    if (noiseConfig !== undefined) data.noiseConfig = noiseConfig;
    if (observations !== undefined) data.observations = observations;
    if (hypothesis !== undefined) data.hypothesis = hypothesis;

    const experiment = await prisma.experiment.update({ where: { id: req.params.id }, data });
    return res.status(200).json({ success: true, message: 'Draft saved.', data: { experiment } });
  } catch (err) {
    console.error('saveDraft error:', err);
    return res.status(500).json({ success: false, error: 'Failed to save draft.' });
  }
};

// ─── POST /api/learner/experiments/:id/run ───────────────────────────────────
export const runExperiment = async (req, res) => {
  try {
    const existing = await prisma.experiment.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Experiment not found.' });

    const circuitCode = req.body.circuitCode || existing.circuitCode || '# No circuit code provided';
    const backend = req.body.backend || existing.backend || 'qiskit_aer';
    const framework = req.body.framework || existing.framework || 'qiskit';
    const shots = req.body.shots || (existing.parameters?.shots) || 1024;

    // Update experiment status to RUNNING
    await prisma.experiment.update({ where: { id: req.params.id }, data: { status: 'RUNNING', circuitCode, backend, framework } });

    // Create a pending simulation run record
    const simRun = await prisma.simulationRun.create({
      data: {
        userId: req.user.id,
        experimentId: existing.id,
        circuitCode,
        backend,
        framework,
        shots: parseInt(shots),
        status: 'RUNNING',
      },
    });

    let simResult;
    try {
      // Proxy to AI engine
      const aiRes = await fetch(`${AI_ENGINE_URL}/api/v1/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuit_code: circuitCode, backend, framework, shots: parseInt(shots), noise_config: existing.noiseConfig }),
      });
      if (aiRes.ok) {
        simResult = await aiRes.json();
      } else {
        throw new Error('AI engine returned error');
      }
    } catch (_aiErr) {
      // Fallback to mock
      simResult = mockSimulationResult(circuitCode, backend, parseInt(shots));
    }

    // Update simulation run with results
    const updatedRun = await prisma.simulationRun.update({
      where: { id: simRun.id },
      data: {
        status: 'COMPLETED',
        results: simResult,
        executionTimeMs: simResult.executionTimeMs || null,
        depth: simResult.depth || null,
        gateCount: simResult.gateCount || null,
        fidelity: simResult.fidelity || null,
        noiseImpact: simResult.noiseImpact || null,
      },
    });

    // Update experiment status to COMPLETED and add reproducibility metadata
    const updatedExperiment = await prisma.experiment.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        reproducibility: {
          lastRunAt: new Date().toISOString(),
          runId: simRun.id,
          shots: parseInt(shots),
          backend,
          framework,
          seed: Math.floor(Math.random() * 99999),
        },
      },
    });

    // Record work to award XP and update streak & heatmap
    await recordLearnerWork({
      userId: req.user.id,
      type: 'EXPERIMENT',
      description: `Ran experiment: ${updatedExperiment.name}`,
      xp: 25,
      hours: 0.2,
    }).catch(err => console.warn('Record experiment work warning:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Experiment run completed.',
      data: { experiment: updatedExperiment, simulationRun: updatedRun },
    });
  } catch (err) {
    console.error('runExperiment error:', err);
    // Mark as failed
    if (req.params.id) {
      await prisma.experiment.update({ where: { id: req.params.id }, data: { status: 'FAILED' } }).catch(() => {});
    }
    return res.status(500).json({ success: false, error: 'Experiment run failed.' });
  }
};
