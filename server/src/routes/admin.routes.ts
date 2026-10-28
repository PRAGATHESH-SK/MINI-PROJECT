import { Router } from 'express';
import {
  getUsers,
  toggleUserStatus,
  getAnalytics,
  getAuditLogs,
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/users', getUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);

export default router;
