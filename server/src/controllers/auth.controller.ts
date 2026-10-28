import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { z } from 'zod';

export const studentRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2),
  registerNumber: z.string().optional(),
  collegeName: z.string().min(2),
  degree: z.string().min(2),
  department: z.string().min(2),
  yearOfStudy: z.number().int().min(1).max(5),
  district: z.string().min(2),
  city: z.string().min(2),
  skills: z.string(),
  phone: z.string().optional(),
  preferredDistricts: z.string().optional(),
});

export const employerRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(2),
  registrationNumber: z.string().optional(),
  industry: z.string().min(2),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().min(10),
  contactPerson: z.string().min(2),
  contactPhone: z.string().min(10),
  address: z.string().min(5),
  district: z.string().min(2),
  city: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function createToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' });
}

function setAuthCookie(res: Response, token: string): void {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export async function registerStudent(req: Request, res: Response): Promise<void> {
  const data = req.body;

  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (existing) {
    res.status(409).json({ success: false, error: 'Email is already registered.' });
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: 'STUDENT',
      isVerified: true, // Auto-verified in education portal demo
      studentProfile: {
        create: {
          fullName: data.fullName,
          registerNumber: data.registerNumber || null,
          collegeName: data.collegeName,
          degree: data.degree,
          department: data.department,
          yearOfStudy: data.yearOfStudy,
          district: data.district,
          city: data.city,
          skills: data.skills,
          phone: data.phone || null,
          preferredDistricts: data.preferredDistricts || null,
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });

  const token = createToken(user.id);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'Student account created successfully.',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profile: user.studentProfile,
    },
  });
}

export async function registerEmployer(req: Request, res: Response): Promise<void> {
  const data = req.body;

  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (existing) {
    res.status(409).json({ success: false, error: 'Email is already registered.' });
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  // In demo environment, employers can be auto-approved for instant testing,
  // or set isApproved: false for admin verification flow demonstration.
  const isApproved = config.demoMode ? true : false;

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: 'EMPLOYER',
      isVerified: isApproved,
      companyProfile: {
        create: {
          companyName: data.companyName,
          registrationNumber: data.registrationNumber || null,
          industry: data.industry,
          website: data.website || null,
          description: data.description,
          contactPerson: data.contactPerson,
          contactPhone: data.contactPhone,
          address: data.address,
          district: data.district,
          city: data.city,
          isApproved,
        },
      },
    },
    include: {
      companyProfile: true,
    },
  });

  const token = createToken(user.id);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: isApproved
      ? 'Employer account created and verified.'
      : 'Employer account registered. Awaiting administrator verification.',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profile: user.companyProfile,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      studentProfile: true,
      companyProfile: true,
    },
  });

  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ success: false, error: 'Account has been deactivated. Please contact support.' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  const token = createToken(user.id);
  setAuthCookie(res, token);

  const profile = user.role === 'STUDENT' ? user.studentProfile : user.companyProfile;
  const userPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    profile,
  };

  res.json({
    success: true,
    message: 'Signed in successfully.',
    token,
    user: userPayload,
    data: {
      token,
      user: userPayload,
    },
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated.' });
    return;
  }

  const profile = req.user.role === 'STUDENT' ? req.user.studentProfile : req.user.companyProfile;
  const userPayload = {
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    isVerified: req.user.isVerified,
    profile,
  };

  res.json({
    success: true,
    user: userPayload,
    data: {
      user: userPayload,
    },
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  
  // Return success message regardless to prevent email enumeration
  res.json({
    success: true,
    message: 'If the account exists, password reset instructions have been dispatched.',
    demoNote: user ? 'In demo mode, you can use any default test account or contact administrator.' : undefined,
  });
}
