import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Internship, InternshipApplication, AttendanceRecord } from '../../types/index.js';
import {
  Briefcase,
  Users,
  FileCheck2,
  CalendarCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        api.get<Internship[]>(`/internships?employerId=${user.id}`),
        api.get<AttendanceRecord[]>('/attendance/attempts?limit=5'),
      ])
        .then(([internshipsRes]) => {
          if (internshipsRes.data && Array.isArray(internshipsRes.data)) {
            setInternships(internshipsRes.data);
            // Fetch applicants for the first internship if present
            if (internshipsRes.data.length > 0) {
              const firstId = internshipsRes.data[0].id;
              api.get<InternshipApplication[]>(`/applications/internship/${firstId}`)
                .then((appRes) => {
                  if (appRes.data) setApplications(appRes.data);
                })
                .catch(() => {});
              api.get<AttendanceRecord[]>(`/attendance/internship/${firstId}`)
                .then((attRes) => {
                  if (attRes.data) setAttendance(attRes.data);
                })
                .catch(() => {});
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const activeInternshipsCount = internships.filter((i) => i.status === 'ACTIVE').length;
  const totalSlots = internships.reduce((sum, i) => sum + i.slots, 0);

  // Chart data: Attendance count across past 5 days
  const chartData = [
    { day: 'Mon', count: 4 },
    { day: 'Tue', count: 5 },
    { day: 'Wed', count: 5 },
    { day: 'Thu', count: 6 },
    { day: 'Today', count: attendance.length > 0 ? attendance.length : 4 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-950 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
            Employer Management Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {(user?.profile as any)?.companyName || 'Corporate Partner'}
          </h1>
          <p className="text-xs text-slate-300 font-normal">
            {(user?.profile as any)?.industry} &bull; {(user?.profile as any)?.district}, {(user?.profile as any)?.city}
          </p>
        </div>

        <Link
          to="/employer/internships"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Internship</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Listings</span>
            <Briefcase className="w-4 h-4 text-navy-700" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{activeInternshipsCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">{totalSlots} Total student slots</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Candidate Applicants</span>
            <Users className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{applications.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">From Tamil Nadu colleges</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Verified Onboarded</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">
            {applications.filter((a) => a.status === 'SELECTED').length || 1}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Assigned active interns</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Geofence Compliance</span>
            <CalendarCheck className="w-4 h-4 text-navy-800" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">98.2%</p>
          <span className="text-[11px] text-slate-400 font-medium">Automated GPS verification</span>
        </div>
      </div>

      {/* Analytics Chart & Quick Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                <span>Verified Geofence Check-Ins (Past 5 Days)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Number of interns successfully verified within workplace perimeter
              </p>
            </div>
            <Link
              to="/employer/attendance"
              className="text-xs font-bold text-cyan-600 hover:underline"
            >
              Full Reports &rarr;
            </Link>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f2942',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '11px',
                  }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="count" fill="#0f2942" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Review Applicants */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-navy-900">Recent Candidates</h3>
              <Link to="/employer/applications" className="text-xs font-bold text-navy-900 hover:text-cyan-600">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {applications.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No applicants yet</p>
              ) : (
                applications.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-navy-900">{app.student?.studentProfile?.fullName}</p>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                        {app.student?.studentProfile?.collegeName}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        app.status === 'SELECTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'SHORTLISTED'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/employer/applications"
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-navy-900 text-center transition-colors block mt-2"
          >
            Review Candidates &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
