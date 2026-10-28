import { Router } from 'express';
import {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  moderateInternship,
  createInternshipSchema,
} from '../controllers/internship.controller.js';
import { authenticate, requireRole, requireVerified } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';

const router = Router();

// Public localized search with optional authentication token parsing
router.get('/', (req, res, next) => {
  // If authorization header or cookie is passed, authenticate optionally
  if ((req.cookies && req.cookies.token) || req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
}, getInternships);

router.get('/:id', (req, res, next) => {
  if ((req.cookies && req.cookies.token) || req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
}, getInternshipById);

// Protected routes
router.post(
  '/',
  authenticate,
  requireRole('EMPLOYER', 'ADMIN'),
  requireVerified,
  validateBody(createInternshipSchema),
  createInternship
);

router.put(
  '/:id',
  authenticate,
  requireRole('EMPLOYER', 'ADMIN'),
  updateInternship
);

router.delete(
  '/:id',
  authenticate,
  requireRole('EMPLOYER', 'ADMIN'),
  deleteInternship
);

router.patch(
  '/:id/moderate',
  authenticate,
  requireRole('ADMIN'),
  moderateInternship
);

export default router;
