import { Router } from 'express';
import {
  applyToInternship,
  getMyApplications,
  getInternshipApplications,
  updateApplicationStatus,
  applySchema,
  updateApplicationStatusSchema,
} from '../controllers/application.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';

const router = Router();

router.use(authenticate);

// Student submits application
router.post('/', requireRole('STUDENT'), validateBody(applySchema), applyToInternship);

// Student views their applications
router.get('/my', requireRole('STUDENT'), getMyApplications);

// Employer views applicants for a specific internship
router.get('/internship/:internshipId', requireRole('EMPLOYER', 'ADMIN'), getInternshipApplications);

// Employer updates application status (REVIEWING, SHORTLISTED, SELECTED, REJECTED)
router.patch(
  '/:id/status',
  requireRole('EMPLOYER', 'ADMIN'),
  validateBody(updateApplicationStatusSchema),
  updateApplicationStatus
);

export default router;
