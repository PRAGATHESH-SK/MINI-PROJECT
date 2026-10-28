export type Role = 'STUDENT' | 'EMPLOYER' | 'ADMIN';

export type InternshipStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';
export type InternshipType = 'ON_SITE' | 'HYBRID' | 'REMOTE';
export type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';
export type AssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
export type AttendanceStatus = 'PRESENT' | 'HALF_DAY' | 'LATE' | 'IRREGULAR';

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  registerNumber?: string;
  collegeName: string;
  degree: string;
  department: string;
  yearOfStudy: number;
  district: string;
  city: string;
  skills: string;
  resumeUrl?: string;
  phone?: string;
  preferredDistricts?: string;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  registrationNumber?: string;
  industry: string;
  website?: string;
  description: string;
  logoUrl?: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  district: string;
  city: string;
  isApproved: boolean;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  profile?: StudentProfile | CompanyProfile;
}

export interface Internship {
  id: string;
  employerId: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  skills: string;
  stipend: number;
  durationWeeks: number;
  slots: number;
  deadline: string;
  internshipType: InternshipType;
  status: InternshipStatus;
  moderationComment?: string;
  district: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  createdAt: string;
  updatedAt: string;
  distanceKm?: number | null;
  employer?: {
    id: string;
    email: string;
    companyProfile?: CompanyProfile;
  };
  _count?: {
    applications: number;
    assignments: number;
  };
  existingApplication?: InternshipApplication | null;
  activeAssignment?: InternshipAssignment | null;
}

export interface InternshipApplication {
  id: string;
  internshipId: string;
  studentId: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  feedback?: string;
  appliedAt: string;
  updatedAt: string;
  internship?: Internship;
  student?: {
    id: string;
    email: string;
    studentProfile?: StudentProfile;
  };
  assignment?: InternshipAssignment;
}

export interface InternshipAssignment {
  id: string;
  internshipId: string;
  studentId: string;
  applicationId: string;
  startDate: string;
  endDate: string;
  status: AssignmentStatus;
  supervisorName?: string;
  supervisorContact?: string;
  assignedAt: string;
  internship?: Internship;
}

export interface AttendanceRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  internshipId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string | null;
  checkInLat: number;
  checkInLng: number;
  checkInAccuracy: number;
  checkInDistance: number;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkOutAccuracy?: number | null;
  checkOutDistance?: number | null;
  status: AttendanceStatus;
  verificationMethod: string;
  notes?: string;
  internship?: {
    id: string;
    title: string;
    district: string;
    city: string;
    geofenceRadiusMeters: number;
    employer?: {
      companyProfile?: CompanyProfile;
    };
  };
  student?: {
    id: string;
    email: string;
    studentProfile?: StudentProfile;
  };
}

export interface AttendanceAttempt {
  id: string;
  studentId: string;
  internshipId: string;
  attemptType: 'CHECK_IN' | 'CHECK_OUT';
  reportedLat: number;
  reportedLng: number;
  reportedAccuracy: number;
  calculatedDistance: number;
  allowedRadius: number;
  isSuccess: boolean;
  rejectionReason?: string;
  attemptedAt: string;
  student?: {
    email: string;
    studentProfile?: {
      fullName: string;
      collegeName: string;
      registerNumber?: string;
    };
  };
  internship?: {
    title: string;
    district: string;
    geofenceRadiusMeters: number;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  rejectionCode?: string;
  evaluation?: any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
