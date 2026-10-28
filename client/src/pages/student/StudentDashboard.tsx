import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { InternshipApplication, AttendanceRecord, Internship } from '../../types/index.js';
import {
  FileCheck2,
  CalendarCheck,
  MapPin,
  Clock,
  ArrowRight,
  Briefcase,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [recommendedInternships, setRecommendedInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<InternshipApplication[]>('/applications/my'),
      api.get<AttendanceRecord[]>('/attendance/my'),
      api.get<{ data: Internship[] }>('/internships?limit=3'),
    ])
      .then(([appsRes, attRes, recRes]) => {
        if (appsRes.data) setApplications(appsRes.data);
        if (attRes.data) setAttendanceRecords(attRes.data);
        if (recRes.data) setRecommendedInternships(recRes.data as any);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Find active assignment
  const activeAssignmentApp = applications.find(
    (a) => a.status === 'SELECTED' && a.assignment?.status === 'ACTIVE'
  );

  const totalApplied = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED').length;
  const verifiedAttendanceDays = attendanceRecords.length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Naan Mudhalvan Student Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Vanakkam, {(user?.profile as any)?.fullName || user?.email.split('@')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            {(user?.profile as any)?.collegeName} &bull; {(user?.profile as any)?.degree} in {(user?.profile as any)?.department}
          </p>
        </div>
      </div>

      {/* Active Assignment Alert / Card */}
      {activeAssignmentApp ? (
        <div className="bg-white rounded-2xl p-6 border-2 border-cyan-500/30 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Internship Onboarded
              </span>
              <h3 className="text-xl font-extrabold text-navy-900 mt-1">
                {activeAssignmentApp.internship?.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-navy-700" />
                <span>{activeAssignmentApp.internship?.employer?.companyProfile?.companyName}</span>
                <span>&bull;</span>
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {activeAssignmentApp.internship?.district}, {activeAssignmentApp.internship?.city}
                </span>
              </p>
            </div>

            <Link
              to="/student/attendance"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs transition-colors shadow-md shadow-cyan-500/20 shrink-0"
            >
              <MapPin className="w-4 h-4" />
              <span>Mark GPS Attendance</span>
            </Link>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 border border-slate-200/60">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Authorized Geofence</span>
              <span className="font-bold text-navy-900">{activeAssignmentApp.internship?.geofenceRadiusMeters} meters</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Site Supervisor</span>
              <span className="font-bold text-navy-900">
                {activeAssignmentApp.assignment?.supervisorName || 'Site Coordinator'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Stipend Allowance</span>
              <span className="font-bold text-emerald-600">
                ₹{activeAssignmentApp.internship?.stipend.toLocaleString()}/month
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">No active internship assignment yet.</span>
            <p className="mt-0.5 text-amber-800">
              Explore localized internships in your preferred district to submit applications and unlock GPS geofenced attendance tracking.
            </p>
          </div>
          <Link
            to="/student/internships"
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0"
          >
            Find Internships
          </Link>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Applications</span>
            <FileCheck2 className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{totalApplied}</p>
          <span className="text-[11px] text-slate-400 font-medium">Submitted across Tamil Nadu</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Shortlisted</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{shortlistedCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">Under interview review</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Verified Days</span>
            <CalendarCheck className="w-4 h-4 text-navy-700" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{verifiedAttendanceDays}</p>
          <span className="text-[11px] text-slate-400 font-medium">GPS Geofence verified</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Attendance Rate</span>
            <Clock className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">100%</p>
          <span className="text-[11px] text-slate-400 font-medium">Compliance on schedule</span>
        </div>
      </div>

      {/* Recommended Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-900">Recommended Internships For Your Skills</h3>
          <Link
            to="/student/internships"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedInternships.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-navy-900 line-clamp-1">{item.title}</h4>
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 shrink-0">
                      ₹{item.stipend.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>{item.district}, {item.city}</span>
                  </div>
                </div>

                <Link
                  to={`/student/internships/${item.id}`}
                  className="mt-4 pt-3 border-t border-slate-100 inline-flex items-center justify-between text-xs font-bold text-navy-900 hover:text-cyan-600"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
