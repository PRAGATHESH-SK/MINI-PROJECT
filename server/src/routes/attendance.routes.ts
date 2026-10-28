import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendanceHistory,
  getInternshipAttendance,
  getAttendanceAttempts,
  exportAttendanceCsv,
  attendanceActionSchema,
} from '../controllers/attendance.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';

const router = Router();

router.use(authenticate);

// Student check-in within geofence
router.post(
  '/check-in',
  requireRole('STUDENT'),
  validateBody(attendanceActionSchema),
  checkIn
);

// Student check-out within geofence
router.post(
  '/check-out',
  requireRole('STUDENT'),
  validateBody(attendanceActionSchema),
  checkOut
);

// Student views their attendance history
router.get('/my', requireRole('STUDENT'), getMyAttendanceHistory);

// Employer / Admin views attendance records for an internship
router.get(
  '/internship/:internshipId',
  requireRole('EMPLOYER', 'ADMIN'),
  getInternshipAttendance
);

// Employer / Admin views GPS audit attempts (including rejected attempts)
router.get(
  '/attempts',
  requireRole('EMPLOYER', 'ADMIN'),
  getAttendanceAttempts
);

// Employer / Admin exports attendance as CSV
router.get(
  '/export',
  requireRole('EMPLOYER', 'ADMIN'),
  exportAttendanceCsv
);

export default router;
