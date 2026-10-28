import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { Layout } from './components/common/Layout.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';

// Public Pages
import { LandingPage } from './pages/LandingPage.js';
import { StudentLogin } from './pages/auth/StudentLogin.js';
import { EmployerLogin } from './pages/auth/EmployerLogin.js';
import { AdminLogin } from './pages/auth/AdminLogin.js';
import { RegisterStudent } from './pages/auth/RegisterStudent.js';
import { RegisterEmployer } from './pages/auth/RegisterEmployer.js';
import { ForgotPassword } from './pages/auth/ForgotPassword.js';
import { ForbiddenPage } from './pages/ForbiddenPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { ProfileSettings } from './pages/ProfileSettings.js';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { InternshipSearch } from './pages/student/InternshipSearch.js';
import { InternshipDetail } from './pages/student/InternshipDetail.js';
import { MyApplications } from './pages/student/MyApplications.js';
import { StudentAttendance } from './pages/student/StudentAttendance.js';

// Employer Pages
import { EmployerDashboard } from './pages/employer/EmployerDashboard.js';
import { EmployerInternships } from './pages/employer/EmployerInternships.js';
import { EmployerApplicants } from './pages/employer/EmployerApplicants.js';
import { EmployerAttendance } from './pages/employer/EmployerAttendance.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminUsers } from './pages/admin/AdminUsers.js';
import { AdminModeration } from './pages/admin/AdminModeration.js';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs.js';
import { AdminSettings } from './pages/admin/AdminSettings.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login/student" element={<StudentLogin />} />
              <Route path="/login/employer" element={<EmployerLogin />} />
              <Route path="/login/admin" element={<AdminLogin />} />
              <Route path="/register/student" element={<RegisterStudent />} />
              <Route path="/register/employer" element={<RegisterEmployer />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/403" element={<ForbiddenPage />} />

              {/* Protected Common Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfileSettings />} />
              </Route>

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/internships" element={<InternshipSearch />} />
                <Route path="/student/internships/:id" element={<InternshipDetail />} />
                <Route path="/student/applications" element={<MyApplications />} />
                <Route path="/student/attendance" element={<StudentAttendance />} />
              </Route>

              {/* Employer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']} />}>
                <Route path="/employer/dashboard" element={<EmployerDashboard />} />
                <Route path="/employer/internships" element={<EmployerInternships />} />
                <Route path="/employer/applications" element={<EmployerApplicants />} />
                <Route path="/employer/attendance" element={<EmployerAttendance />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/moderation" element={<AdminModeration />} />
                <Route path="/admin/attendance" element={<AdminAuditLogs />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
