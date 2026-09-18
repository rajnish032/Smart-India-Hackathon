import prisma from '../config/db.js';
import { recordLearnerWork } from '../services/learnerActivityService.js';

// ─── GET /api/learner/circuits ────────────────────────────────────────────────
export const listCircuits = async (req, res) => {
  try {
    const { search, tags, framework, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (framework) where.framework = framework;
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagList.length > 0) where.tags = { hasSome: tagList };
    }

    const [circuits, total] = await Promise.all([
      prisma.savedCircuit.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.savedCircuit.count({ where }),
    ]);

    return res.status(200).json({ success: true, data: { circuits, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    console.error('listCircuits error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch saved circuits.' });
  }
};

// ─── POST /api/learner/circuits ───────────────────────────────────────────────
export const saveCircuit = async (req, res) => {
  try {
    const { name, description = '', circuitCode, circuitJson, backend = 'qiskit_aer', framework = 'qiskit', tags = [], isPublic = false } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Circuit name is required.' });
    if (!circuitCode && !circuitJson) return res.status(400).json({ success: false, error: 'Either circuitCode or circuitJson is required.' });

    const circuit = await prisma.savedCircuit.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        description: description.trim(),
        circuitCode: circuitCode || null,
        circuitJson: circuitJson || null,
        backend,
        framework,
        tags: Array.isArray(tags) ? tags : [],
        isPublic,
      },
    });

    // Automatically record work to update streak, XP, hours, and heatmap
    await recordLearnerWork({
      userId: req.user.id,
      type: 'CIRCUIT',
      description: `Constructed and saved quantum circuit: ${circuit.name}`,
      xp: 30,
      hours: 0.2,
    }).catch(err => console.warn('Circuit work record warning:', err.message));

    return res.status(201).json({ success: true, data: { circuit } });
  } catch (err) {
    console.error('saveCircuit error:', err);
    return res.status(500).json({ success: false, error: 'Failed to save circuit.' });
  }
};

// ─── GET /api/learner/circuits/:id ───────────────────────────────────────────
export const getCircuit = async (req, res) => {
  try {
    const circuit = await prisma.savedCircuit.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!circuit) return res.status(404).json({ success: false, error: 'Circuit not found.' });
    return res.status(200).json({ success: true, data: { circuit } });
  } catch (err) {
    console.error('getCircuit error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch circuit.' });
  }
};

// ─── PATCH /api/learner/circuits/:id ─────────────────────────────────────────
export const updateCircuit = async (req, res) => {
  try {
    const existing = await prisma.savedCircuit.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Circuit not found.' });

    const allowed = ['name', 'description', 'circuitCode', 'circuitJson', 'backend', 'framework', 'tags', 'isPublic'];
    const data = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });

    const circuit = await prisma.savedCircuit.update({ where: { id: req.params.id }, data });
    return res.status(200).json({ success: true, data: { circuit } });
  } catch (err) {
    console.error('updateCircuit error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update circuit.' });
  }
};

// ─── DELETE /api/learner/circuits/:id ────────────────────────────────────────
export const deleteCircuit = async (req, res) => {
  try {
    const existing = await prisma.savedCircuit.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Circuit not found.' });
    await prisma.savedCircuit.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, message: 'Circuit deleted.' });
  } catch (err) {
    console.error('deleteCircuit error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete circuit.' });
  }
};
