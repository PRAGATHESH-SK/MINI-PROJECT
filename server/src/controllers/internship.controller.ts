import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { calculateHaversineDistance, validateCoordinates } from '../lib/geospatial.js';
import { config } from '../config/index.js';
import { z } from 'zod';

export const createInternshipSchema = z.object({
  title: z.string().min(3),
  department: z.string().min(2),
  description: z.string().min(10),
  requirements: z.string().min(10),
  responsibilities: z.string().optional(),
  skills: z.string().min(2),
  stipend: z.number().int().min(0),
  durationWeeks: z.number().int().min(1).max(52),
  slots: z.number().int().min(1).max(500),
  deadline: z.string().datetime().or(z.string()),
  internshipType: z.enum(['ON_SITE', 'HYBRID', 'REMOTE']).default('ON_SITE'),
  district: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  geofenceRadiusMeters: z.number().min(config.minGeofenceRadiusMeters).max(config.maxGeofenceRadiusMeters).default(150),
});

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

export async function getInternships(req: Request, res: Response): Promise<void> {
  const {
    district,
    city,
    industry,
    skills,
    type,
    search,
    lat,
    lng,
    radiusKm,
    page = '1',
    limit = '10',
    employerId,
    status,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = {};

  // For public search, only show ACTIVE listings unless admin or employer queries their own
  if (status && (req.user?.role === 'ADMIN' || (req.user?.role === 'EMPLOYER' && req.user.id === employerId))) {
    whereClause.status = status;
  } else if (employerId && req.user?.id === employerId) {
    // Employer viewing their own internships can see all statuses
    whereClause.employerId = employerId;
  } else {
    whereClause.status = 'ACTIVE';
  }

  if (district && district !== 'ALL') {
    whereClause.district = { equals: district as string, mode: 'insensitive' };
  }

  if (city && city !== 'ALL') {
    whereClause.city = { contains: city as string, mode: 'insensitive' };
  }

  if (type && type !== 'ALL') {
    whereClause.internshipType = type as any;
  }

  if (search) {
    const s = String(search).trim();
    whereClause.OR = [
      { title: { contains: s, mode: 'insensitive' } },
      { department: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
      { skills: { contains: s, mode: 'insensitive' } },
      { employer: { companyProfile: { companyName: { contains: s, mode: 'insensitive' } } } },
    ];
  }

  if (skills) {
    const skillList = String(skills).split(',').map((s) => s.trim().toLowerCase());
    whereClause.AND = skillList.map((skill) => ({
      skills: { contains: skill, mode: 'insensitive' },
    }));
  }

  if (industry && industry !== 'ALL') {
    whereClause.employer = {
      ...whereClause.employer,
      companyProfile: {
        industry: { contains: industry as string, mode: 'insensitive' },
      },
    };
  }

  const [total, items] = await Promise.all([
    prisma.internship.count({ where: whereClause }),
    prisma.internship.findMany({
      where: whereClause,
      include: {
        employer: {
          select: {
            id: true,
            email: true,
            companyProfile: true,
          },
        },
        _count: {
          select: {
            applications: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
  ]);

  // If user provided coordinates for localized proximity search:
  let processedItems = items.map((item) => {
    let distanceKm: number | null = null;
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      const distMeters = calculateHaversineDistance(
        Number(lat),
        Number(lng),
        item.latitude,
        item.longitude
      );
      distanceKm = Math.round((distMeters / 1000) * 10) / 10;
    }
    return {
      ...item,
      distanceKm,
    };
  });

  // Filter by max distance if requested
  if (radiusKm && !isNaN(Number(radiusKm)) && lat && lng) {
    const maxKm = Number(radiusKm);
    processedItems = processedItems
      .filter((i) => i.distanceKm !== null && i.distanceKm <= maxKm)
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  res.json({
    success: true,
    data: processedItems,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function getInternshipById(req: Request, res: Response): Promise<void> {
  const id = getParam(req.params.id);

  const internship = await prisma.internship.findUnique({
    where: { id },
    include: {
      employer: {
        select: {
          id: true,
          email: true,
          companyProfile: true,
        },
      },
      _count: {
        select: {
          applications: true,
          assignments: true,
        },
      },
    },
  });

  if (!internship) {
    res.status(404).json({ success: false, error: 'Internship not found.' });
    return;
  }

  // Check if current authenticated student has already applied
  let existingApplication = null;
  let activeAssignment = null;

  if (req.user && req.user.role === 'STUDENT') {
    existingApplication = await prisma.internshipApplication.findUnique({
      where: {
        internshipId_studentId: {
          internshipId: id,
          studentId: req.user.id,
        },
      },
    });

    activeAssignment = await prisma.internshipAssignment.findUnique({
      where: {
        internshipId_studentId: {
          internshipId: id,
          studentId: req.user.id,
        },
      },
    });
  }

  res.json({
    success: true,
    data: {
      ...internship,
      existingApplication,
      activeAssignment,
    },
  });
}

export async function createInternship(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  const data = req.body;

  if (!validateCoordinates(data.latitude, data.longitude)) {
    res.status(400).json({ success: false, error: 'Invalid latitude or longitude coordinates.' });
    return;
  }

  const deadlineDate = new Date(data.deadline);
  if (isNaN(deadlineDate.getTime())) {
    res.status(400).json({ success: false, error: 'Invalid deadline date format.' });
    return;
  }

  // Admin approval flow: in demo mode, mark ACTIVE immediately; otherwise PENDING_REVIEW
  const status = config.demoMode ? 'ACTIVE' : 'PENDING_REVIEW';

  const internship = await prisma.internship.create({
    data: {
      employerId: req.user.id,
      title: data.title,
      department: data.department,
      description: data.description,
      requirements: data.requirements,
      responsibilities: data.responsibilities || null,
      skills: data.skills,
      stipend: data.stipend,
      durationWeeks: data.durationWeeks,
      slots: data.slots,
      deadline: deadlineDate,
      internshipType: data.internshipType,
      status,
      district: data.district,
      city: data.city,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      geofenceRadiusMeters: data.geofenceRadiusMeters || 150,
    },
    include: {
      employer: {
        select: {
          id: true,
          companyProfile: true,
        },
      },
    },
  });

  // Log action
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'CREATE_INTERNSHIP',
      entityType: 'Internship',
      entityId: internship.id,
      details: JSON.stringify({
        title: internship.title,
        district: internship.district,
        geofenceRadius: internship.geofenceRadiusMeters,
      }),
      ipAddress: req.ip,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Internship listing created successfully.',
    data: internship,
  });
}

export async function updateInternship(req: Request, res: Response): Promise<void> {
  const id = getParam(req.params.id);
  const data = req.body;

  const existing = await prisma.internship.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Internship not found.' });
    return;
  }

  if (req.user?.role !== 'ADMIN' && existing.employerId !== req.user?.id) {
    res.status(403).json({ success: false, error: 'You are not authorized to update this listing.' });
    return;
  }

  if (data.latitude && data.longitude && !validateCoordinates(data.latitude, data.longitude)) {
    res.status(400).json({ success: false, error: 'Invalid latitude or longitude.' });
    return;
  }

  const updated = await prisma.internship.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.department && { department: data.department }),
      ...(data.description && { description: data.description }),
      ...(data.requirements && { requirements: data.requirements }),
      ...(data.responsibilities !== undefined && { responsibilities: data.responsibilities }),
      ...(data.skills && { skills: data.skills }),
      ...(data.stipend !== undefined && { stipend: data.stipend }),
      ...(data.durationWeeks && { durationWeeks: data.durationWeeks }),
      ...(data.slots && { slots: data.slots }),
      ...(data.deadline && { deadline: new Date(data.deadline) }),
      ...(data.internshipType && { internshipType: data.internshipType }),
      ...(data.district && { district: data.district }),
      ...(data.city && { city: data.city }),
      ...(data.address && { address: data.address }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.geofenceRadiusMeters !== undefined && { geofenceRadiusMeters: data.geofenceRadiusMeters }),
      ...(data.status && req.user?.role === 'ADMIN' && { status: data.status }),
    },
  });

  res.json({
    success: true,
    message: 'Internship listing updated.',
    data: updated,
  });
}

export async function deleteInternship(req: Request, res: Response): Promise<void> {
  const id = getParam(req.params.id);

  const existing = await prisma.internship.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Internship not found.' });
    return;
  }

  if (req.user?.role !== 'ADMIN' && existing.employerId !== req.user?.id) {
    res.status(403).json({ success: false, error: 'You are not authorized to delete this listing.' });
    return;
  }

  await prisma.internship.delete({ where: { id } });

  res.json({ success: true, message: 'Internship listing deleted.' });
}

export async function moderateInternship(req: Request, res: Response): Promise<void> {
  const id = getParam(req.params.id);
  const { status, comment } = req.body;

  if (!['ACTIVE', 'REJECTED', 'ARCHIVED'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid moderation status.' });
    return;
  }

  const updated = await prisma.internship.update({
    where: { id },
    data: {
      status,
      moderationComment: comment || null,
    },
  });

  // Notify employer
  await prisma.notification.create({
    data: {
      userId: updated.employerId,
      title: `Internship Moderation Update: ${updated.title}`,
      message: `Your listing "${updated.title}" has been reviewed by the admin and marked as ${status}. ${comment ? 'Note: ' + comment : ''}`,
      type: 'MODERATION',
      link: `/employer/internships`,
    },
  });

  res.json({
    success: true,
    message: `Internship marked as ${status}.`,
    data: updated,
  });
}
