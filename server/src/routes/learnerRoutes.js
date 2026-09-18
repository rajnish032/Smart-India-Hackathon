import express from 'express';
import {
  getLearnerDashboard,
  getLearnerCourses,
  getCourseById,
  enrollCourse,
  completeCourse,
  completeLesson,
  getLearnerProgress,
  getLearnerAchievements,
  getLearnerProfile,
  updateLearnerProfile,
  getTodayGoals,
  toggleGoal,
  solveChallenge,
  logLearnerActivity,
  logStudyHeartbeat,
} from '../controllers/learnerController.js';
import {
  createExperiment,
  listExperiments,
  getExperiment,
  updateExperiment,
  deleteExperiment,
  saveDraft,
  runExperiment,
} from '../controllers/experimentController.js';
import {
  runStandaloneSimulation,
  listSimulations,
  getSimulation,
  deleteSimulation,
  rerunSimulation,
  compareBackends,
  listComparisons,
  getSupportedBackends,
} from '../controllers/simulationController.js';
import {
  listCircuits,
  saveCircuit,
  getCircuit,
  updateCircuit,
  deleteCircuit,
} from '../controllers/circuitController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All learner routes require authentication and LEARNER/INSTRUCTOR/ADMIN role
router.use(authenticateUser);
router.use(authorizeRoles('LEARNER', 'INSTRUCTOR', 'ADMIN'));

// ─── Dashboard ──────────────────────────────────────────────────────────────
router.get('/dashboard', getLearnerDashboard);

// ─── Courses ────────────────────────────────────────────────────────────────
router.get('/courses', getLearnerCourses);
router.get('/courses/:courseId', getCourseById);
router.post('/courses/:courseId/enroll', enrollCourse);
router.post('/courses/:courseId/complete', completeCourse);

// ─── Lessons ────────────────────────────────────────────────────────────────
router.patch('/lessons/:lessonId/complete', completeLesson);

// ─── Progress ───────────────────────────────────────────────────────────────
router.get('/progress', getLearnerProgress);

// ─── Achievements ───────────────────────────────────────────────────────────
router.get('/achievements', getLearnerAchievements);

// ─── Profile & Work Activity ────────────────────────────────────────────────
router.get('/profile', getLearnerProfile);
router.patch('/profile', updateLearnerProfile);
router.post('/activity/log', logLearnerActivity);
router.post('/study-heartbeat', logStudyHeartbeat);

// ─── Challenges ─────────────────────────────────────────────────────────────
router.post('/challenges/:challengeId/solve', solveChallenge);

// ─── Daily Goals ────────────────────────────────────────────────────────────
router.get('/goals/today', getTodayGoals);
router.patch('/goals/:goalId/toggle', toggleGoal);

// ─── Experiments ─────────────────────────────────────────────────────────────
router.get('/experiments', listExperiments);
router.post('/experiments', createExperiment);
router.get('/experiments/:id', getExperiment);
router.patch('/experiments/:id', updateExperiment);
router.delete('/experiments/:id', deleteExperiment);
router.post('/experiments/:id/run', runExperiment);
router.post('/experiments/:id/save-draft', saveDraft);

// ─── Simulation History & Backend Comparison ─────────────────────────────────
router.get('/simulations/backends', getSupportedBackends);
router.get('/simulations/comparisons', listComparisons);
router.post('/simulations/compare', compareBackends);
router.post('/simulations/run', runStandaloneSimulation);
router.get('/simulations', listSimulations);
router.get('/simulations/:id', getSimulation);
router.delete('/simulations/:id', deleteSimulation);
router.post('/simulations/:id/rerun', rerunSimulation);

// ─── Saved Circuits ───────────────────────────────────────────────────────────
router.get('/circuits', listCircuits);
router.post('/circuits', saveCircuit);
router.get('/circuits/:id', getCircuit);
router.patch('/circuits/:id', updateCircuit);
router.delete('/circuits/:id', deleteCircuit);

export default router;

