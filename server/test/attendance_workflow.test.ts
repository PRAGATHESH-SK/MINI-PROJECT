import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { prisma } from '../src/lib/prisma.js';

describe('Attendance & Geofence Integration API Tests', () => {
  let studentToken: string;
  let employerToken: string;
  let adminToken: string;
  let tcsInternshipId: string;
  let unassignedInternshipId: string;

  beforeAll(async () => {
    // 1. Sign in as student Karthik (assigned to TCS)
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.karthik@annauniv-demo.edu', password: 'Student@123' });
    studentToken = studentLogin.body.token;

    // 2. Sign in as Employer TCS
    const employerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tcs.careers@tcs-demo.com', password: 'Employer@123' });
    employerToken = employerLogin.body.token;

    // 3. Sign in as Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@connectingtech.tn.gov.in', password: 'Admin@123' });
    adminToken = adminLogin.body.token;

    // Retrieve internships
    const tcsInternship = await prisma.internship.findFirst({
      where: { title: { contains: 'Full Stack Cloud' } },
    });
    tcsInternshipId = tcsInternship!.id;

    const boschInternship = await prisma.internship.findFirst({
      where: { title: { contains: 'Automotive' } },
    });
    unassignedInternshipId = boschInternship!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should reject check-in if student is not assigned to the internship', async () => {
    // Karthik tries to check in to Bosch Coimbatore (unassigned)
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        internshipId: unassignedInternshipId,
        latitude: 11.0831,
        longitude: 76.9961,
        accuracy: 10,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.rejectionCode).toBe('NOT_ASSIGNED');
  });

  it('should reject check-in if GPS accuracy exceeds maximum threshold', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        internshipId: tcsInternshipId,
        latitude: 12.8258,
        longitude: 80.2227,
        accuracy: 150, // exceeds 100m threshold
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.rejectionCode).toBe('ACCURACY_TOO_LOW');
  });

  it('should reject check-in when coordinates are outside authorized geofence radius', async () => {
    // Coordinates ~600m away from Siruseri IT Park
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        internshipId: tcsInternshipId,
        latitude: 12.8310,
        longitude: 80.2290,
        accuracy: 15,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.rejectionCode).toBe('OUTSIDE_GEOFENCE');
    expect(res.body.evaluation?.isWithinGeofence).toBe(false);
  });

  it('should successfully check in when within authorized geofence radius with good accuracy', async () => {
    // Make sure today's record doesn't exist yet for clean test run
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const studentUser = await prisma.user.findUnique({ where: { email: 'student.karthik@annauniv-demo.edu' } });

    await prisma.attendanceRecord.deleteMany({
      where: {
        studentId: studentUser!.id,
        internshipId: tcsInternshipId,
        date: today,
      },
    });

    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        internshipId: tcsInternshipId,
        latitude: 12.8259, // ~20 meters from centroid
        longitude: 80.2228,
        accuracy: 12,
        isSimulation: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PRESENT');
    expect(res.body.evaluation.distanceMeters).toBeLessThan(150);
  });

  it('should prevent duplicate check-in on the same day', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        internshipId: tcsInternshipId,
        latitude: 12.8259,
        longitude: 80.2228,
        accuracy: 12,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.rejectionCode).toBe('DUPLICATE_CHECK_IN');
  });

  it('should successfully check out after checking in', async () => {
    const res = await request(app)
      .post('/api/attendance/check-out')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        internshipId: tcsInternshipId,
        latitude: 12.8258,
        longitude: 80.2227,
        accuracy: 14,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.checkOutTime).not.toBeNull();
  });

  it('should allow employer to retrieve verified attendance records', async () => {
    const res = await request(app)
      .get(`/api/attendance/internship/${tcsInternshipId}`)
      .set('Authorization', `Bearer ${employerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
