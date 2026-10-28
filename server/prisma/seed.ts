import { PrismaClient, Role, InternshipType, InternshipStatus, ApplicationStatus, AssignmentStatus, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Connecting Tech Database Seeding...');

  // Clean existing data
  await prisma.attendanceAttempt.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.internshipAssignment.deleteMany();
  await prisma.internshipApplication.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('Admin@123', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);
  const employerPasswordHash = await bcrypt.hash('Employer@123', 10);

  // 1. Create Administrator
  const admin = await prisma.user.create({
    data: {
      email: 'admin@connectingtech.tn.gov.in',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      isVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Admin user created: admin@connectingtech.tn.gov.in');

  // 2. Create Employers & Company Profiles
  const tcsUser = await prisma.user.create({
    data: {
      email: 'tcs.careers@tcs-demo.com',
      passwordHash: employerPasswordHash,
      role: Role.EMPLOYER,
      isVerified: true,
      companyProfile: {
        create: {
          companyName: 'Tata Consultancy Services',
          registrationNumber: 'TCS-TN-CORP-001',
          industry: 'Information Technology & Cloud Services',
          website: 'https://www.tcs.com',
          description: 'Global leader in IT services, consulting, and business solutions with Asia’s largest tech delivery centre in Siruseri, Chennai.',
          contactPerson: 'S. Rajesh, HR Director (Campus)',
          contactPhone: '+91 94440 12345',
          address: 'SIPCOT IT Park, Siruseri, Old Mahabalipuram Road',
          district: 'Chengalpattu',
          city: 'Chennai',
          isApproved: true,
        },
      },
    },
    include: { companyProfile: true },
  });

  const boschUser = await prisma.user.create({
    data: {
      email: 'bosch.talent@bosch-demo.com',
      passwordHash: employerPasswordHash,
      role: Role.EMPLOYER,
      isVerified: true,
      companyProfile: {
        create: {
          companyName: 'Bosch Global Software Technologies',
          registrationNumber: 'BGSW-COIM-002',
          industry: 'Automotive & Embedded Systems',
          website: 'https://www.bosch.in',
          description: 'Specializing in mobility solutions, industrial IoT, and embedded powertrain electronics at Coimbatore technology campus.',
          contactPerson: 'Deepak V., University Relations',
          contactPhone: '+91 98840 54321',
          address: 'CHIL SEZ IT Park, Keeranatham Village, Saravanampatti',
          district: 'Coimbatore',
          city: 'Coimbatore',
          isApproved: true,
        },
      },
    },
    include: { companyProfile: true },
  });

  const zohoUser = await prisma.user.create({
    data: {
      email: 'zoho.hiring@zoho-demo.com',
      passwordHash: employerPasswordHash,
      role: Role.EMPLOYER,
      isVerified: true,
      companyProfile: {
        create: {
          companyName: 'Zoho Corporation',
          registrationNumber: 'ZOHO-TN-CORP-003',
          industry: 'Enterprise Software & SaaS',
          website: 'https://www.zoho.com',
          description: 'Pioneering privacy-centric cloud software suites, enterprise AI, and distributed regional tech hubs across Tamil Nadu.',
          contactPerson: 'K. Meenakshi, Lead Recruiter',
          contactPhone: '+91 97720 11223',
          address: 'Estancia IT Park, Vallancheri, GST Road, Guduvanchery',
          district: 'Chengalpattu',
          city: 'Chennai',
          isApproved: true,
        },
      },
    },
    include: { companyProfile: true },
  });

  const hclUser = await prisma.user.create({
    data: {
      email: 'hcl.careers@hcl-demo.com',
      passwordHash: employerPasswordHash,
      role: Role.EMPLOYER,
      isVerified: true,
      companyProfile: {
        create: {
          companyName: 'HCL Technologies',
          registrationNumber: 'HCL-MDU-004',
          industry: 'Information Technology & Cybersecurity',
          website: 'https://www.hcltech.com',
          description: 'Leading global technology company operating tier-2 delivery excellence and cybersecurity ops center in Madurai ELCOT.',
          contactPerson: 'M. Senthilkumar, Campus Lead',
          contactPhone: '+91 96630 33445',
          address: 'ELCOT IT Park, Ilandhaikulam Main Road',
          district: 'Madurai',
          city: 'Madurai',
          isApproved: true,
        },
      },
    },
    include: { companyProfile: true },
  });
  console.log('✅ Created 4 Employers (TCS, Bosch, Zoho, HCL)');

  // 3. Create Students & Student Profiles
  const karthikUser = await prisma.user.create({
    data: {
      email: 'student.karthik@annauniv-demo.edu',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      isVerified: true,
      studentProfile: {
        create: {
          fullName: 'Karthik Subramanian',
          registerNumber: '2021103045',
          collegeName: 'College of Engineering, Guindy (Anna University)',
          degree: 'B.E.',
          department: 'Computer Science and Engineering',
          yearOfStudy: 4,
          district: 'Chennai',
          city: 'Chennai',
          skills: 'TypeScript, React, Node.js, PostgreSQL, Docker, AWS',
          resumeUrl: 'https://example.com/resumes/karthik_subramanian.pdf',
          phone: '+91 98401 23456',
          preferredDistricts: 'Chennai, Chengalpattu, Kanchipuram',
        },
      },
    },
    include: { studentProfile: true },
  });

  const priyaUser = await prisma.user.create({
    data: {
      email: 'student.priya@psg-demo.edu',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      isVerified: true,
      studentProfile: {
        create: {
          fullName: 'Priya Dharshini R.',
          registerNumber: '21IT089',
          collegeName: 'PSG College of Technology',
          degree: 'B.Tech',
          department: 'Information Technology',
          yearOfStudy: 3,
          district: 'Coimbatore',
          city: 'Coimbatore',
          skills: 'Python, C++, Embedded Linux, ROS, IoT, MQTT',
          resumeUrl: 'https://example.com/resumes/priya_dharshini.pdf',
          phone: '+91 97890 65432',
          preferredDistricts: 'Coimbatore, Tiruppur, Erode',
        },
      },
    },
    include: { studentProfile: true },
  });

  const anandUser = await prisma.user.create({
    data: {
      email: 'student.anand@tce-demo.edu',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      isVerified: true,
      studentProfile: {
        create: {
          fullName: 'Anand Kumar M.',
          registerNumber: '22ECE054',
          collegeName: 'Thiagarajar College of Engineering',
          degree: 'B.E.',
          department: 'Electronics and Communication',
          yearOfStudy: 3,
          district: 'Madurai',
          city: 'Madurai',
          skills: 'Cybersecurity, Linux Admin, Network Protocols, Python',
          resumeUrl: 'https://example.com/resumes/anand_kumar.pdf',
          phone: '+91 94432 98765',
          preferredDistricts: 'Madurai, Dindigul, Tirunelveli',
        },
      },
    },
    include: { studentProfile: true },
  });

  const deepaUser = await prisma.user.create({
    data: {
      email: 'student.deepa@gct-demo.edu',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      isVerified: true,
      studentProfile: {
        create: {
          fullName: 'Deepa Lakshmi V.',
          registerNumber: '22EEE031',
          collegeName: 'Government College of Technology, Coimbatore',
          degree: 'B.E.',
          department: 'Electrical and Electronics',
          yearOfStudy: 3,
          district: 'Salem',
          city: 'Salem',
          skills: 'MATLAB, PLC Automation, Power Electronics, SCADA',
          resumeUrl: 'https://example.com/resumes/deepa_lakshmi.pdf',
          phone: '+91 96550 44332',
          preferredDistricts: 'Salem, Coimbatore, Erode',
        },
      },
    },
    include: { studentProfile: true },
  });
  console.log('✅ Created 4 Students (Karthik, Priya, Anand, Deepa)');

  // 4. Create Realistic Internships with authentic coordinates across Tamil Nadu
  const deadlineDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000); // 45 days from now

  const tcsInternship = await prisma.internship.create({
    data: {
      employerId: tcsUser.id,
      title: 'Full Stack Cloud Platform Intern',
      department: 'Enterprise Cloud Application Unit',
      description: 'Hands-on industry internship designing microservices architecture, React dashboard interfaces, and geospatial mapping workflows for state digital transformation initiatives.',
      requirements: 'Proficiency in React/TypeScript, Node.js REST APIs, relational databases (PostgreSQL), and Git workflows. Strong algorithmic foundation.',
      responsibilities: 'Develop production microservices, build responsive portal components, write automated integration tests, and collaborate in daily standups.',
      skills: 'TypeScript, React, Node.js, PostgreSQL, Docker, Git',
      stipend: 18000,
      durationWeeks: 16,
      slots: 5,
      deadline: deadlineDate,
      internshipType: InternshipType.ON_SITE,
      status: InternshipStatus.ACTIVE,
      district: 'Chengalpattu',
      city: 'Chennai',
      address: 'TCS Siruseri IT Park, Plot No. 1, SIPCOT IT Park, Siruseri',
      latitude: 12.8258,
      longitude: 80.2227,
      geofenceRadiusMeters: 150.0,
    },
  });

  const boschInternship = await prisma.internship.create({
    data: {
      employerId: boschUser.id,
      title: 'Automotive Embedded Systems & Edge AI Intern',
      department: 'Cross-Domain Computing Solutions',
      description: 'Engage with leading embedded software engineers on automotive control units (ECU), edge AI anomaly detection, and vehicle telematics.',
      requirements: 'Solid understanding of C/C++, Embedded Linux, RTOS concepts, and serial protocols (CAN, UART, SPI).',
      responsibilities: 'Assist in writing device drivers, testing hardware-in-the-loop (HIL) simulators, and tuning machine learning models on microcontrollers.',
      skills: 'C++, Embedded Linux, RTOS, Python, CAN Protocol',
      stipend: 22000,
      durationWeeks: 20,
      slots: 4,
      deadline: deadlineDate,
      internshipType: InternshipType.ON_SITE,
      status: InternshipStatus.ACTIVE,
      district: 'Coimbatore',
      city: 'Coimbatore',
      address: 'CHIL SEZ IT Park, Keeranatham Village, Saravanampatti, Coimbatore',
      latitude: 11.0831,
      longitude: 76.9961,
      geofenceRadiusMeters: 120.0,
    },
  });

  const zohoInternship = await prisma.internship.create({
    data: {
      employerId: zohoUser.id,
      title: 'SaaS Architecture & Distributed Systems Intern',
      department: 'Zoho Workplace Infrastructure',
      description: 'Build high-throughput backend services handling millions of concurrent operations with zero downtime, distributed caching, and real-time collaboration engines.',
      requirements: 'Strong fundamentals in Java, C++, or Go. Good knowledge of concurrency, data structures, and database query optimization.',
      responsibilities: 'Optimize storage engine queries, enhance message queuing performance, and build monitoring dashboards.',
      skills: 'Java, PostgreSQL, Redis, Distributed Systems, Linux',
      stipend: 20000,
      durationWeeks: 12,
      slots: 6,
      deadline: deadlineDate,
      internshipType: InternshipType.HYBRID,
      status: InternshipStatus.ACTIVE,
      district: 'Chengalpattu',
      city: 'Chennai',
      address: 'Zoho Corporation, Estancia IT Park, Guduvanchery, Chennai',
      latitude: 12.8288,
      longitude: 80.0543,
      geofenceRadiusMeters: 150.0,
    },
  });

  const hclInternship = await prisma.internship.create({
    data: {
      employerId: hclUser.id,
      title: 'SOC & Cloud Cybersecurity Operations Intern',
      department: 'CyberSecurity GRC & Threat Intel',
      description: 'Internship within our 24x7 Security Operations Centre in Madurai monitoring network telemetries, SIEM log analysis, and automated threat hunting.',
      requirements: 'Knowledge of TCP/IP networking, Linux terminal, vulnerability scanning, and cybersecurity fundamentals.',
      responsibilities: 'Monitor security alerts, investigate anomalous network signatures, and document incident response playbooks.',
      skills: 'Cybersecurity, Linux, Wireshark, Python, SIEM',
      stipend: 15000,
      durationWeeks: 12,
      slots: 3,
      deadline: deadlineDate,
      internshipType: InternshipType.ON_SITE,
      status: InternshipStatus.ACTIVE,
      district: 'Madurai',
      city: 'Madurai',
      address: 'HCL Technologies, ELCOT IT Park, Ilandhaikulam, Madurai',
      latitude: 9.9482,
      longitude: 78.1561,
      geofenceRadiusMeters: 150.0,
    },
  });

  // Additional listings across Tamil Nadu districts
  await prisma.internship.create({
    data: {
      employerId: tcsUser.id,
      title: 'Industrial IoT & Smart Factory Automation',
      department: 'Manufacturing 4.0 Solutions',
      description: 'Developing edge telemetry collectors and digital twin visualizers for smart manufacturing clusters in Western Tamil Nadu.',
      requirements: 'Node.js, MQTT/WebSockets, Timeseries databases, and frontend dashboards.',
      skills: 'Node.js, React, MQTT, InfluxDB, WebSockets',
      stipend: 16000,
      durationWeeks: 14,
      slots: 2,
      deadline: deadlineDate,
      internshipType: InternshipType.ON_SITE,
      status: InternshipStatus.ACTIVE,
      district: 'Salem',
      city: 'Salem',
      address: 'ELCOT IT Park, Jagir Ammapalayam, Salem',
      latitude: 11.6643,
      longitude: 78.1460,
      geofenceRadiusMeters: 150.0,
    },
  });

  await prisma.internship.create({
    data: {
      employerId: zohoUser.id,
      title: 'Data Science & Predictive Analytics Intern',
      department: 'Zoho Analytics Core AI',
      description: 'Build predictive sales forecasting and automated NLP query pipelines for business intelligence dashboards.',
      requirements: 'Python, Pandas, Scikit-learn, SQL, and statistical modelling foundations.',
      skills: 'Python, SQL, Machine Learning, Statistics, FastAPI',
      stipend: 20000,
      durationWeeks: 16,
      slots: 4,
      deadline: deadlineDate,
      internshipType: InternshipType.HYBRID,
      status: InternshipStatus.ACTIVE,
      district: 'Tiruchirappalli',
      city: 'Tiruchirappalli',
      address: 'ELCOT IT Park, Navalpattu, Tiruchirappalli',
      latitude: 10.7490,
      longitude: 78.7397,
      geofenceRadiusMeters: 180.0,
    },
  });
  console.log('✅ Created 6 Tamil Nadu localized internship listings with GPS Geofences');

  // 5. Create Applications & Active Assignments
  // Karthik applied and SELECTED for TCS
  const karthikApp = await prisma.internshipApplication.create({
    data: {
      internshipId: tcsInternship.id,
      studentId: karthikUser.id,
      coverLetter: 'I have hands-on experience building full-stack cloud applications in React and Node.js with PostgreSQL. Looking forward to contributing to digital public infrastructure.',
      resumeUrl: 'https://example.com/resumes/karthik_subramanian.pdf',
      status: ApplicationStatus.SELECTED,
      feedback: 'Excellent coding test score and portfolio demonstration. Accepted for Siruseri campus.',
    },
  });

  const karthikAssignment = await prisma.internshipAssignment.create({
    data: {
      internshipId: tcsInternship.id,
      studentId: karthikUser.id,
      applicationId: karthikApp.id,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      endDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
      status: AssignmentStatus.ACTIVE,
      supervisorName: 'K. R. Venkataraman (Senior Architect)',
      supervisorContact: 'venkat.kr@tcs-demo.com',
    },
  });

  // Priya applied and SELECTED for Bosch
  const priyaApp = await prisma.internshipApplication.create({
    data: {
      internshipId: boschInternship.id,
      studentId: priyaUser.id,
      coverLetter: 'Passionate about embedded systems and RTOS programming on ARM Cortex-M and embedded Linux boards.',
      resumeUrl: 'https://example.com/resumes/priya_dharshini.pdf',
      status: ApplicationStatus.SELECTED,
      feedback: 'Strong grasp of C and hardware protocols. Selected for Saravanampatti team.',
    },
  });

  await prisma.internshipAssignment.create({
    data: {
      internshipId: boschInternship.id,
      studentId: priyaUser.id,
      applicationId: priyaApp.id,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: AssignmentStatus.ACTIVE,
      supervisorName: 'N. Srivatsan (Technical Lead)',
      supervisorContact: 'srivatsan.n@bosch-demo.com',
    },
  });

  // Anand applied for HCL (REVIEWING) and Zoho (SHORTLISTED)
  await prisma.internshipApplication.create({
    data: {
      internshipId: hclInternship.id,
      studentId: anandUser.id,
      coverLetter: 'Interested in SOC analyst workflows and cybersecurity operations at Madurai delivery centre.',
      status: ApplicationStatus.REVIEWING,
    },
  });

  await prisma.internshipApplication.create({
    data: {
      internshipId: zohoInternship.id,
      studentId: anandUser.id,
      coverLetter: 'Keen to work on high-throughput backend architecture and enterprise SaaS systems.',
      status: ApplicationStatus.SHORTLISTED,
      feedback: 'Shortlisted for technical round interview.',
    },
  });
  console.log('✅ Created Applications and Assignments');

  // 6. Pre-seed Verified Attendance Records & Attempts for Karthik
  // Past 3 days verified attendance:
  const dates = [
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  ];

  for (const d of dates) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const checkIn = new Date(d);
    checkIn.setHours(9, 15, 0);

    const checkOut = new Date(d);
    checkOut.setHours(17, 45, 0);

    // Realistic coordinates within 35 meters of TCS Siruseri (12.8258, 80.2227)
    const checkInLat = 12.8259;
    const checkInLng = 80.2228;

    await prisma.attendanceRecord.create({
      data: {
        assignmentId: karthikAssignment.id,
        studentId: karthikUser.id,
        internshipId: tcsInternship.id,
        date: dateStr,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        checkInLat,
        checkInLng,
        checkInAccuracy: 14.5,
        checkInDistance: 32.4, // 32.4 meters away from centroid (allowed: 150m)
        checkOutLat: checkInLat,
        checkOutLng: checkInLng,
        checkOutAccuracy: 12.0,
        checkOutDistance: 32.4,
        status: AttendanceStatus.PRESENT,
        verificationMethod: 'GPS_GEOFENCE',
      },
    });

    // Record corresponding audit attempts
    await prisma.attendanceAttempt.create({
      data: {
        studentId: karthikUser.id,
        internshipId: tcsInternship.id,
        attemptType: 'CHECK_IN',
        reportedLat: checkInLat,
        reportedLng: checkInLng,
        reportedAccuracy: 14.5,
        calculatedDistance: 32.4,
        allowedRadius: 150.0,
        isSuccess: true,
        attemptedAt: checkIn,
      },
    });
  }

  // Pre-seed an auditable rejected attempt (e.g. attempted check-in from 480 meters outside geofence)
  await prisma.attendanceAttempt.create({
    data: {
      studentId: karthikUser.id,
      internshipId: tcsInternship.id,
      attemptType: 'CHECK_IN',
      reportedLat: 12.8300,
      reportedLng: 80.2260,
      reportedAccuracy: 15.0,
      calculatedDistance: 486.2,
      allowedRadius: 150.0,
      isSuccess: false,
      rejectionReason: 'OUTSIDE_GEOFENCE: Location is outside authorized geofence. Distance from site is 486.2m (Allowed radius: 150m).',
      attemptedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Pre-seed notifications
  await prisma.notification.create({
    data: {
      userId: karthikUser.id,
      title: 'Welcome to Connecting Tech',
      message: 'Your internship at Tata Consultancy Services (Siruseri) is active. Remember to mark GPS geofenced attendance upon arrival.',
      type: 'INFO',
      link: '/student/attendance',
    },
  });

  await prisma.notification.create({
    data: {
      userId: tcsUser.id,
      title: 'Intern Onboarded',
      message: 'Karthik Subramanian (Anna University) has verified active assignment at Siruseri IT Park.',
      type: 'ATTENDANCE',
      link: `/employer/attendance?internshipId=${tcsInternship.id}`,
    },
  });

  // System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'MAX_GPS_ACCURACY_METERS', value: '100', description: 'Maximum acceptable GPS accuracy error in meters before rejection' },
      { key: 'DEFAULT_GEOFENCE_RADIUS_METERS', value: '150', description: 'Standard workplace geofence radius in meters' },
      { key: 'ALLOW_DEMO_SIMULATION', value: 'true', description: 'Enable developer demo coordinate simulation mode' },
    ],
  });

  console.log('🎉 Seeding successfully completed!');
  console.log('----------------------------------------------------');
  console.log('DEMO ACCOUNTS READY FOR EVALUATION:');
  console.log('1. Admin:      admin@connectingtech.tn.gov.in / Admin@123');
  console.log('2. Employer:   tcs.careers@tcs-demo.com       / Employer@123');
  console.log('3. Student:    student.karthik@annauniv-demo.edu / Student@123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
