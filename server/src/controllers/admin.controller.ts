import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getUsers(req: Request, res: Response): Promise<void> {
  const { role, isVerified, search, page = '1', limit = '20' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = {};
  if (role && role !== 'ALL') whereClause.role = role;
  if (isVerified !== undefined && isVerified !== 'ALL') whereClause.isVerified = isVerified === 'true';

  if (search) {
    const s = String(search).trim();
    whereClause.OR = [
      { email: { contains: s, mode: 'insensitive' } },
      { studentProfile: { fullName: { contains: s, mode: 'insensitive' } } },
      { studentProfile: { collegeName: { contains: s, mode: 'insensitive' } } },
      { companyProfile: { companyName: { contains: s, mode: 'insensitive' } } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        studentProfile: true,
        companyProfile: true,
        _count: {
          select: {
            applications: true,
            assignments: true,
            createdInternships: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function toggleUserStatus(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { isVerified, isActive } = req.body;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { companyProfile: true },
  });

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(isVerified !== undefined && { isVerified }),
      ...(isActive !== undefined && { isActive }),
      ...(user.role === 'EMPLOYER' && isVerified !== undefined && {
        companyProfile: {
          update: { isApproved: isVerified },
        },
      }),
    },
    include: {
      studentProfile: true,
      companyProfile: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user?.id,
      action: 'UPDATE_USER_STATUS',
      entityType: 'User',
      entityId: id,
      details: JSON.stringify({ isVerified, isActive }),
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    message: 'User status updated successfully.',
    data: updated,
  });
}

export async function getAnalytics(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const [
    totalStudents,
    totalEmployers,
    verifiedEmployers,
    activeInternships,
    totalApplications,
    activeAssignments,
    todayAttendance,
    failedAttemptsToday,
    districtStatsRaw,
    recentAttempts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
    prisma.user.count({ where: { role: 'EMPLOYER' } }),
    prisma.user.count({ where: { role: 'EMPLOYER', isVerified: true } }),
    prisma.internship.count({ where: { status: 'ACTIVE' } }),
    prisma.internshipApplication.count(),
    prisma.internshipAssignment.count({ where: { status: 'ACTIVE' } }),
    prisma.attendanceRecord.count({ where: { date: todayStr } }),
    prisma.attendanceAttempt.count({
      where: {
        isSuccess: false,
        attemptedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.internship.groupBy({
      by: ['district'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    }),
    prisma.attendanceAttempt.findMany({
      take: 10,
      orderBy: { attemptedAt: 'desc' },
      include: {
        student: { select: { email: true, studentProfile: { select: { fullName: true } } } },
        internship: { select: { title: true, district: true } },
      },
    }),
  ]);

  const districtDistribution = districtStatsRaw.map((d) => ({
    district: d.district,
    count: d._count.id,
  }));

  res.json({
    success: true,
    data: {
      kpis: {
        totalStudents,
        totalEmployers,
        verifiedEmployers,
        activeInternships,
        totalApplications,
        activeAssignments,
        todayAttendance,
        failedAttemptsToday,
      },
      districtDistribution,
      recentAttempts,
    },
  });
}

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  const { limit = '50' } = req.query;

  const logs = await prisma.auditLog.findMany({
    take: Math.min(100, parseInt(limit as string, 10)),
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: logs,
  });
}
