import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import {
  ShieldCheck,
  Users,
  Building2,
  Briefcase,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  MapPin,
  CheckCircle2,
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

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/admin/analytics')
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis || {
    totalStudents: 4,
    totalEmployers: 4,
    verifiedEmployers: 4,
    activeInternships: 6,
    totalApplications: 4,
    activeAssignments: 2,
    todayAttendance: 2,
    failedAttemptsToday: 0,
  };

  const districtDistribution = data?.districtDistribution || [
    { district: 'Chennai', count: 3 },
    { district: 'Coimbatore', count: 2 },
    { district: 'Madurai', count: 1 },
    { district: 'Salem', count: 1 },
    { district: 'Tiruchirappalli', count: 1 },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Welcome */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
            Statewide Command & Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Connecting Tech &mdash; Executive Analytics
          </h1>
          <p className="text-xs text-slate-300 font-normal">
            Naan Mudhalvan University-Industry Network &bull; PostGIS Geofenced Attendance Compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/moderation"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs transition-colors shadow-md"
          >
            Moderate Listings
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold text-xs transition-colors border border-slate-700"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Registered Students</span>
            <Users className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{kpis.totalStudents}</p>
          <span className="text-[11px] text-slate-400 font-medium">Tamil Nadu Universities</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Corporate Employers</span>
            <Building2 className="w-4 h-4 text-navy-700" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{kpis.verifiedEmployers}</p>
          <span className="text-[11px] text-slate-400 font-medium">Verified industry partners</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Geofences</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-navy-900">{kpis.activeInternships}</p>
          <span className="text-[11px] text-slate-400 font-medium">Approved internship sites</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Today's Attendance</span>
            <CalendarCheck className="w-4 h-4 text-navy-900" />
          </div>
          <p className="text-2xl font-extrabold text-cyan-600">{kpis.todayAttendance}</p>
          <span className="text-[11px] text-slate-400 font-medium">Verified GPS check-ins</span>
        </div>
      </div>

      {/* District Distribution Chart & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Regional Opportunity Distribution by District</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Number of authorized industry internship sites mapped per Tamil Nadu district
              </p>
            </div>
            <span className="text-xs font-bold text-navy-900 bg-slate-100 px-2.5 py-1 rounded-lg">
              38 TN Districts Active
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Geofence Audit Log preview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-navy-900">Recent GPS Attempts</h3>
              <Link to="/admin/attendance" className="text-xs font-bold text-cyan-600 hover:underline">
                View Full Logs &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              {data?.recentAttempts?.length > 0 ? (
                data.recentAttempts.slice(0, 4).map((att: any) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-navy-900">
                        {att.student?.studentProfile?.fullName || 'Student'}
                      </p>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                        {att.internship?.title} ({att.calculatedDistance}m)
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        att.isSuccess
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {att.isSuccess ? 'PASS' : 'REJECT'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No GPS logs yet</p>
              )}
            </div>
          </div>

          <div className="bg-cyan-50 p-3 rounded-xl border border-cyan-200 text-[11px] text-cyan-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>PostGIS Geofence calculation actively enforces &le; 150m boundary threshold.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
