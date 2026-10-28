import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { AttendanceAttempt } from '../../types/index.js';
import {
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [attempts, setAttempts] = useState<AttendanceAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSuccess, setFilterSuccess] = useState<string>('ALL');

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterSuccess !== 'ALL') params.set('isSuccess', filterSuccess === 'PASS' ? 'true' : 'false');

    api.get<AttendanceAttempt[]>(`/attendance/attempts?${params.toString()}`)
      .then((res) => {
        if (res.data) setAttempts(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterSuccess]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-cyan-600" />
            <span>State Compliance & Anti-Spoofing Audit</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Geofence Attempt Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Audit all verified check-ins and rejected attempts with geodesic distance calculations and error diagnostics.
          </p>
        </div>

        <select
          value={filterSuccess}
          onChange={(e) => setFilterSuccess(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900"
        >
          <option value="ALL">All Outcomes</option>
          <option value="PASS">Verified Passes Only</option>
          <option value="FAIL">Rejections Only</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Attempted At</th>
                <th className="py-3 px-3">Student Candidate</th>
                <th className="py-3 px-3">Workplace Listing</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Reported Fix</th>
                <th className="py-3 px-3">Distance From Site</th>
                <th className="py-3 px-3">Result</th>
                <th className="py-3 px-3">Diagnostic Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : attempts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No attempts logged matching filter.
                  </td>
                </tr>
              ) : (
                attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(att.attemptedAt).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-navy-900 block">
                        {att.student?.studentProfile?.fullName || 'Student'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {att.student?.studentProfile?.registerNumber || att.student?.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {att.internship?.title || 'Internship Site'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] font-bold text-slate-700">
                      {att.attemptType}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                      {att.reportedLat}, {att.reportedLng} (&plusmn;{Math.round(att.reportedAccuracy)}m)
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-navy-900">{att.calculatedDistance}m</span>
                      <span className="text-[10px] text-slate-400 block">
                        (Limit: {att.allowedRadius}m)
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          att.isSuccess
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {att.isSuccess ? 'PASS' : 'REJECT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">
                      {att.rejectionReason || 'Passed all geofence thresholds'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
