import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { evaluateGeofence } from '../lib/geospatial.js';
import { config } from '../config/index.js';
import { z } from 'zod';
import { stringify } from 'csv-stringify/sync';

export const attendanceActionSchema = z.object({
  internshipId: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().min(0),
  isSimulation: z.boolean().optional(),
});

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function checkIn(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'STUDENT') {
    res.status(403).json({ success: false, error: 'Only assigned students can mark attendance.' });
    return;
  }

  const { internshipId, latitude, longitude, accuracy, isSimulation = false } = req.body;
  const today = getTodayDateString();

  // 1. Verify student assignment to this internship
  const assignment = await prisma.internshipAssignment.findFirst({
    where: {
      internshipId,
      studentId: req.user.id,
      status: 'ACTIVE',
    },
    include: {
      internship: true,
    },
  });

  if (!assignment) {
    // Audit attempt as unauthorized
    await prisma.attendanceAttempt.create({
      data: {
        studentId: req.user.id,
        internshipId,
        attemptType: 'CHECK_IN',
        reportedLat: latitude,
        reportedLng: longitude,
        reportedAccuracy: accuracy,
        calculatedDistance: 0,
        allowedRadius: 0,
        isSuccess: false,
        rejectionReason: 'STUDENT_NOT_ASSIGNED: Student does not hold an active assignment for this internship.',
        clientIp: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    res.status(403).json({
      success: false,
      error: 'You do not have an active assignment for this internship.',
      rejectionCode: 'NOT_ASSIGNED',
    });
    return;
  }

  // 2. Check for duplicate check-in today
  const existingRecord = await prisma.attendanceRecord.findUnique({
    where: {
      studentId_internshipId_date: {
        studentId: req.user.id,
        internshipId,
        date: today,
      },
    },
  });

  if (existingRecord && existingRecord.checkInTime) {
    await prisma.attendanceAttempt.create({
      data: {
        studentId: req.user.id,
        internshipId,
        attemptType: 'CHECK_IN',
        reportedLat: latitude,
        reportedLng: longitude,
        reportedAccuracy: accuracy,
        calculatedDistance: existingRecord.checkInDistance,
        allowedRadius: assignment.internship.geofenceRadiusMeters,
        isSuccess: false,
        rejectionReason: 'DUPLICATE_CHECK_IN: Attendance check-in already recorded for today.',
        clientIp: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    res.status(409).json({
      success: false,
      error: 'Attendance check-in has already been completed for today.',
      rejectionCode: 'DUPLICATE_CHECK_IN',
      existingRecord,
    });
    return;
  }

  // 3. Evaluate GPS Geofence & Server-side distance
  const geoResult = await evaluateGeofence(
    latitude,
    longitude,
    accuracy,
    assignment.internship.latitude,
    assignment.internship.longitude,
    assignment.internship.geofenceRadiusMeters,
    config.maxGpsAccuracyMeters
  );

  if (!geoResult.isValid) {
    // Record rejected attempt in audit log
    await prisma.attendanceAttempt.create({
      data: {
        studentId: req.user.id,
        internshipId,
        attemptType: 'CHECK_IN',
        reportedLat: latitude,
        reportedLng: longitude,
        reportedAccuracy: accuracy,
        calculatedDistance: geoResult.evaluation?.distanceMeters || 0,
        allowedRadius: assignment.internship.geofenceRadiusMeters,
        isSuccess: false,
        rejectionReason: `${geoResult.rejectionCode}: ${geoResult.error}`,
        clientIp: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    res.status(400).json({
      success: false,
      error: geoResult.error,
      rejectionCode: geoResult.rejectionCode,
      evaluation: geoResult.evaluation,
    });
    return;
  }

  // 4. Success: Execute database transaction to record attendance and attempt
  const verificationMethod = isSimulation ? 'DEMO_SIMULATION' : 'GPS_GEOFENCE';

  const [record] = await prisma.$transaction([
    prisma.attendanceRecord.create({
      data: {
        assignmentId: assignment.id,
        studentId: req.user.id,
        internshipId,
        date: today,
        checkInTime: new Date(),
        checkInLat: latitude,
        checkInLng: longitude,
        checkInAccuracy: accuracy,
        checkInDistance: geoResult.evaluation!.distanceMeters,
        status: 'PRESENT',
        verificationMethod,
        notes: isSimulation ? 'Verified via GPS Geofence Test Simulator (DEMO)' : undefined,
      },
    }),
    prisma.attendanceAttempt.create({
      data: {
        studentId: req.user.id,
        internshipId,
        attemptType: 'CHECK_IN',
        reportedLat: latitude,
        reportedLng: longitude,
        reportedAccuracy: accuracy,
        calculatedDistance: geoResult.evaluation!.distanceMeters,
        allowedRadius: assignment.internship.geofenceRadiusMeters,
        isSuccess: true,
        clientIp: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    }),
  ]);

  res.status(200).json({
    success: true,
    message: isSimulation
      ? 'Check-in verified successfully (DEMO SIMULATION).'
      : 'Attendance check-in verified and recorded successfully.',
    data: record,
    evaluation: geoResult.evaluation,
  });
}

export async function checkOut(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'STUDENT') {
    res.status(403).json({ success: false, error: 'Only assigned students can mark attendance.' });
    return;
  }

  const { internshipId, latitude, longitude, accuracy, isSimulation = false } = req.body;
  const today = getTodayDateString();

  const assignment = await prisma.internshipAssignment.findFirst({
    where: {
      internshipId,
      studentId: req.user.id,
      status: 'ACTIVE',
    },
    include: {
      internship: true,
    },
  });

  if (!assignment) {
    res.status(403).json({ success: false, error: 'Active assignment not found.' });
    return;
  }

  const record = await prisma.attendanceRecord.findUnique({
    where: {
      studentId_internshipId_date: {
        studentId: req.user.id,
        internshipId,
        date: today,
      },
    },
  });

  if (!record || !record.checkInTime) {
    res.status(400).json({
      success: false,
      error: 'No check-in record found for today. You must check in before checking out.',
      rejectionCode: 'NO_CHECK_IN',
    });
    return;
  }

  if (record.checkOutTime) {
    res.status(409).json({
      success: false,
      error: 'You have already checked out for today.',
      rejectionCode: 'ALREADY_CHECKED_OUT',
      record,
    });
    return;
  }

  const geoResult = await evaluateGeofence(
    latitude,
    longitude,
    accuracy,
    assignment.internship.latitude,
    assignment.internship.longitude,
    assignment.internship.geofenceRadiusMeters,
    config.maxGpsAccuracyMeters
  );

  if (!geoResult.isValid) {
    await prisma.attendanceAttempt.create({
      data: {
        studentId: req.user.id,
        internshipId,
        attemptType: 'CHECK_OUT',
        reportedLat: latitude,
        reportedLng: longitude,
        reportedAccuracy: accuracy,
        calculatedDistance: geoResult.evaluation?.distanceMeters || 0,
        allowedRadius: assignment.internship.geofenceRadiusMeters,
        isSuccess: false,
        rejectionReason: `${geoResult.rejectionCode}: ${geoResult.error}`,
        clientIp: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    res.status(400).json({
      success: false,
      error: geoResult.error,
      rejectionCode: geoResult.rejectionCode,
      evaluation: geoResult.evaluation,
    });
    return;
  }

  const [updatedRecord] = await prisma.$transaction([
    prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        checkOutTime: new Date(),
        checkOutLat: latitude,
        checkOutLng: longitude,
        checkOutAccuracy: accuracy,
        checkOutDistance: geoResult.evaluation!.distanceMeters,
      },
    }),
    prisma.attendanceAttempt.create({
      data: {
        studentId: req.user.id,
        internshipId,
        attemptType: 'CHECK_OUT',
        reportedLat: latitude,
        reportedLng: longitude,
        reportedAccuracy: accuracy,
        calculatedDistance: geoResult.evaluation!.distanceMeters,
        allowedRadius: assignment.internship.geofenceRadiusMeters,
        isSuccess: true,
        clientIp: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    }),
  ]);

  res.status(200).json({
    success: true,
    message: isSimulation
      ? 'Check-out verified successfully (DEMO SIMULATION).'
      : 'Attendance check-out recorded successfully.',
    data: updatedRecord,
    evaluation: geoResult.evaluation,
  });
}

export async function getMyAttendanceHistory(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'STUDENT') {
    res.status(403).json({ success: false, error: 'Unauthorized.' });
    return;
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: req.user.id },
    include: {
      internship: {
        select: {
          id: true,
          title: true,
          district: true,
          city: true,
          geofenceRadiusMeters: true,
          employer: { select: { companyProfile: true } },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  // Calculate summary stats
  const totalDays = records.length;
  const completedCheckouts = records.filter((r) => r.checkOutTime != null).length;
  const avgDistance =
    totalDays > 0
      ? Math.round(records.reduce((acc, r) => acc + r.checkInDistance, 0) / totalDays)
      : 0;

  res.json({
    success: true,
    data: records,
    stats: {
      totalDays,
      completedCheckouts,
      avgDistance,
    },
  });
}

export async function getInternshipAttendance(req: Request, res: Response): Promise<void> {
  const internshipId = Array.isArray(req.params.internshipId) ? req.params.internshipId[0] : req.params.internshipId;
  const { date, studentId } = req.query;

  const internship = await prisma.internship.findUnique({ where: { id: internshipId } });
  if (!internship) {
    res.status(404).json({ success: false, error: 'Internship not found.' });
    return;
  }

  if (req.user?.role !== 'ADMIN' && internship.employerId !== req.user?.id) {
    res.status(403).json({ success: false, error: 'Unauthorized to view this attendance data.' });
    return;
  }

  const whereClause: any = { internshipId };
  if (date) whereClause.date = String(date);
  if (studentId) whereClause.studentId = String(studentId);

  const records = await prisma.attendanceRecord.findMany({
    where: whereClause,
    include: {
      student: {
        select: {
          id: true,
          email: true,
          studentProfile: true,
        },
      },
    },
    orderBy: [{ date: 'desc' }, { checkInTime: 'desc' }],
  });

  res.json({
    success: true,
    data: records,
  });
}

export async function getAttendanceAttempts(req: Request, res: Response): Promise<void> {
  // Only Admin or Employer can view audit attempts
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'EMPLOYER')) {
    res.status(403).json({ success: false, error: 'Unauthorized.' });
    return;
  }

  const { internshipId, isSuccess, limit = '50' } = req.query;
  const whereClause: any = {};

  if (req.user.role === 'EMPLOYER') {
    whereClause.internship = { employerId: req.user.id };
  }

  if (internshipId) {
    whereClause.internshipId = String(internshipId);
  }

  if (isSuccess !== undefined) {
    whereClause.isSuccess = isSuccess === 'true';
  }

  const attempts = await prisma.attendanceAttempt.findMany({
    where: whereClause,
    include: {
      student: {
        select: {
          id: true,
          email: true,
          studentProfile: { select: { fullName: true, collegeName: true, registerNumber: true } },
        },
      },
      internship: {
        select: {
          id: true,
          title: true,
          district: true,
          geofenceRadiusMeters: true,
        },
      },
    },
    orderBy: { attemptedAt: 'desc' },
    take: Math.min(100, parseInt(limit as string, 10)),
  });

  res.json({
    success: true,
    data: attempts,
  });
}

export async function exportAttendanceCsv(req: Request, res: Response): Promise<void> {
  const { internshipId } = req.query;

  if (!internshipId) {
    res.status(400).json({ success: false, error: 'internshipId parameter is required.' });
    return;
  }

  const internship = await prisma.internship.findUnique({
    where: { id: String(internshipId) },
  });

  if (!internship) {
    res.status(404).json({ success: false, error: 'Internship not found.' });
    return;
  }

  if (req.user?.role !== 'ADMIN' && internship.employerId !== req.user?.id) {
    res.status(403).json({ success: false, error: 'Unauthorized to export this data.' });
    return;
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { internshipId: String(internshipId) },
    include: {
      student: {
        include: { studentProfile: true },
      },
      internship: true,
    },
    orderBy: [{ date: 'desc' }, { checkInTime: 'desc' }],
  });

  const rows = records.map((r) => ({
    'Date': r.date,
    'Student Name': r.student.studentProfile?.fullName || 'N/A',
    'Register Number': r.student.studentProfile?.registerNumber || 'N/A',
    'College': r.student.studentProfile?.collegeName || 'N/A',
    'Check-In Time': r.checkInTime.toISOString(),
    'Check-In Distance (m)': r.checkInDistance,
    'Check-In GPS Accuracy (m)': r.checkInAccuracy,
    'Check-Out Time': r.checkOutTime ? r.checkOutTime.toISOString() : 'N/A',
    'Check-Out Distance (m)': r.checkOutDistance != null ? r.checkOutDistance : 'N/A',
    'Status': r.status,
    'Verification Method': r.verificationMethod,
  }));

  const csv = stringify(rows, { header: true });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="attendance_${internship.title.replace(/\s+/g, '_')}_${getTodayDateString()}.csv"`
  );
  res.status(200).send(csv);
}
