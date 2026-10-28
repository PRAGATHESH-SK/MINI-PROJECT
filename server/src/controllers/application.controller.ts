import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

export const applySchema = z.object({
  internshipId: z.string().uuid(),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPLIED', 'REVIEWING', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN']),
  feedback: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  supervisorName: z.string().optional(),
  supervisorContact: z.string().optional(),
});

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

export async function applyToInternship(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'STUDENT') {
    res.status(403).json({ success: false, error: 'Only registered students can apply for internships.' });
    return;
  }

  const { internshipId, coverLetter, resumeUrl } = req.body;

  const internship = await prisma.internship.findUnique({
    where: { id: internshipId },
    include: { employer: { include: { companyProfile: true } } },
  });

  if (!internship) {
    res.status(404).json({ success: false, error: 'Internship not found.' });
    return;
  }

  if (internship.status !== 'ACTIVE') {
    res.status(400).json({ success: false, error: 'This internship is not currently accepting applications.' });
    return;
  }

  if (new Date(internship.deadline) < new Date()) {
    res.status(400).json({ success: false, error: 'The application deadline has passed.' });
    return;
  }

  const existing = await prisma.internshipApplication.findUnique({
    where: {
      internshipId_studentId: {
        internshipId,
        studentId: req.user.id,
      },
    },
  });

  if (existing) {
    res.status(409).json({ success: false, error: 'You have already applied for this internship.' });
    return;
  }

  const application = await prisma.internshipApplication.create({
    data: {
      internshipId,
      studentId: req.user.id,
      coverLetter: coverLetter || null,
      resumeUrl: resumeUrl || req.user.studentProfile?.resumeUrl || null,
      status: 'APPLIED',
    },
    include: {
      internship: true,
    },
  });

  // Notify employer
  await prisma.notification.create({
    data: {
      userId: internship.employerId,
      title: 'New Internship Application',
      message: `${req.user.studentProfile?.fullName || 'A student'} applied for ${internship.title}.`,
      type: 'APPLICATION',
      link: `/employer/applications?internshipId=${internship.id}`,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully.',
    data: application,
  });
}

export async function getMyApplications(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'STUDENT') {
    res.status(403).json({ success: false, error: 'Only students can view their applications.' });
    return;
  }

  const applications = await prisma.internshipApplication.findMany({
    where: { studentId: req.user.id },
    include: {
      internship: {
        include: {
          employer: {
            select: {
              companyProfile: true,
            },
          },
        },
      },
      assignment: true,
    },
    orderBy: { appliedAt: 'desc' },
  });

  res.json({
    success: true,
    data: applications,
  });
}

export async function getInternshipApplications(req: Request, res: Response): Promise<void> {
  const internshipId = getParam(req.params.internshipId);

  const internship = await prisma.internship.findUnique({
    where: { id: internshipId },
  });

  if (!internship) {
    res.status(404).json({ success: false, error: 'Internship not found.' });
    return;
  }

  if (req.user?.role !== 'ADMIN' && internship.employerId !== req.user?.id) {
    res.status(403).json({ success: false, error: 'Unauthorized to view applicants for this internship.' });
    return;
  }

  const applications = await prisma.internshipApplication.findMany({
    where: { internshipId },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          studentProfile: true,
        },
      },
      assignment: true,
    },
    orderBy: { appliedAt: 'desc' },
  });

  res.json({
    success: true,
    data: applications,
  });
}

export async function updateApplicationStatus(req: Request, res: Response): Promise<void> {
  const id = getParam(req.params.id);
  const { status, feedback, startDate, endDate, supervisorName, supervisorContact } = req.body;

  const application = await prisma.internshipApplication.findUnique({
    where: { id },
    include: {
      internship: true,
      student: { include: { studentProfile: true } },
    },
  });

  if (!application) {
    res.status(404).json({ success: false, error: 'Application not found.' });
    return;
  }

  if (req.user?.role !== 'ADMIN' && application.internship.employerId !== req.user?.id) {
    res.status(403).json({ success: false, error: 'Unauthorized to update this application.' });
    return;
  }

  const updated = await prisma.internshipApplication.update({
    where: { id },
    data: {
      status,
      feedback: feedback || null,
    },
    include: {
      internship: true,
    },
  });

  // If status is changed to SELECTED, auto-create or activate the internship assignment!
  if (status === 'SELECTED') {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + (application.internship.durationWeeks || 12) * 7 * 24 * 60 * 60 * 1000);

    await prisma.internshipAssignment.upsert({
      where: {
        internshipId_studentId: {
          internshipId: application.internshipId,
          studentId: application.studentId,
        },
      },
      create: {
        internshipId: application.internshipId,
        studentId: application.studentId,
        applicationId: application.id,
        startDate: start,
        endDate: end,
        status: 'ACTIVE',
        supervisorName: supervisorName || 'Site Coordinator',
        supervisorContact: supervisorContact || null,
      },
      update: {
        status: 'ACTIVE',
        startDate: start,
        endDate: end,
        supervisorName: supervisorName || undefined,
        supervisorContact: supervisorContact || undefined,
      },
    });
  }

  // Notify student
  await prisma.notification.create({
    data: {
      userId: application.studentId,
      title: `Application Status: ${status}`,
      message: `Your application for "${updated.internship.title}" has been updated to "${status}". ${feedback ? 'Feedback: ' + feedback : ''}`,
      type: 'APPLICATION',
      link: status === 'SELECTED' ? '/student/attendance' : '/student/applications',
    },
  });

  res.json({
    success: true,
    message: `Application updated to ${status}.`,
    data: updated,
  });
}
