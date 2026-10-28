import { Router } from 'express';
import {
  registerStudent,
  registerEmployer,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  studentRegisterSchema,
  employerRegisterSchema,
  loginSchema,
} from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/register/student', validateBody(studentRegisterSchema), registerStudent);
router.post('/register/employer', validateBody(employerRegisterSchema), registerEmployer);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);
router.post('/forgot-password', forgotPassword);

export default router;
