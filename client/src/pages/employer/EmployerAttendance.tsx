import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Internship, AttendanceRecord, AttendanceAttempt } from '../../types/index.js';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const EmployerAttendance: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [attempts, setAttempts] = useState<AttendanceAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<'VERIFIED' | 'AUDIT_ATTEMPTS'>('VERIFIED');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Load employer's internships
  useEffect(() => {
    if (!user) return;
    api.get<Internship[]>(`/internships?employerId=${user.id}`)
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setInternships(res.data);
          if (res.data.length > 0) {
            setSelectedInternshipId(res.data[0].id);
          }
        }
      })
      .catch(() => {});
  }, [user]);

  // Load records and attempts
  const fetchData = useCallback(async (internshipId: string) => {
    if (!internshipId) return;
    setLoading(true);
    try {
      const [recRes, attRes] = await Promise.all([
        api.get<AttendanceRecord[]>(`/attendance/internship/${internshipId}`),
        api.get<AttendanceAttempt[]>(`/attendance/attempts?internshipId=${internshipId}`),
      ]);
      if (recRes.data) setRecords(recRes.data);
      if (attRes.data) setAttempts(attRes.data);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch attendance data.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (selectedInternshipId) {
      fetchData(selectedInternshipId);
    }
  }, [selectedInternshipId, fetchData]);

  // Export CSV
  const handleExportCsv = async () => {
    if (!selectedInternshipId) return;
    setExporting(true);
    try {
      const token = localStorage.getItem('connecting_tech_token');
      const response = await fetch(`/api/attendance/export?internshipId=${selectedInternshipId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to download CSV');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      success('Attendance records exported to CSV successfully.');
    } catch (err: any) {
      toastError(err.message || 'CSV export failed.');
    } finally {
      setExporting(false);
    }
  };

  const selectedInternship = internships.find((i) => i.id === selectedInternshipId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Attendance Verification Logs</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Verified Intern Attendance Reports
          </h1>
          <p className="text-xs text-slate-500">
            Real-time PostGIS geodesic distance calculations, GPS accuracy checks, and tamper-resistant audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <select
            value={selectedInternshipId}
            onChange={(e) => setSelectedInternshipId(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900"
          >
            {internships.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting || records.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Geofence Perimeter Specs */}
      {selectedInternship && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-navy-900" />
            <span className="font-bold text-navy-900">{selectedInternship.title}</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-600 font-medium">
              Centroid: {selectedInternship.latitude}, {selectedInternship.longitude}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
              Geofence Radius: {selectedInternship.geofenceRadiusMeters} meters
            </span>
            <span className="text-slate-500 font-medium">
              Max GPS Error Allowed: 100 meters
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('VERIFIED')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'VERIFIED'
              ? 'border-navy-900 text-navy-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Verified Attendance ({records.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUDIT_ATTEMPTS')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'AUDIT_ATTEMPTS'
              ? 'border-navy-900 text-navy-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>GPS Audit Attempts ({attempts.length})</span>
        </button>
      </div>

      {/* Tab 1: Verified Records Table */}
      {activeTab === 'VERIFIED' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Student Intern</th>
                  <th className="py-3 px-3">University</th>
                  <th className="py-3 px-3">Check-In</th>
                  <th className="py-3 px-3">Check-Out</th>
                  <th className="py-3 px-3">Distance From Site</th>
                  <th className="py-3 px-3">GPS Accuracy</th>
                  <th className="py-3 px-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No verified attendance records found for this internship listing.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-navy-900">{r.date}</td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-navy-900 block">
                          {r.student?.studentProfile?.fullName || 'Assigned Intern'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {r.student?.studentProfile?.registerNumber || r.student?.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {r.student?.studentProfile?.collegeName || 'Tamil Nadu University'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {new Date(r.checkInTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {r.checkOutTime
                          ? new Date(r.checkOutTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '--'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-navy-900">{r.checkInDistance}m</span>
                        <span className="text-[10px] text-slate-400 block">
                          (Allowed &le; {selectedInternship?.geofenceRadiusMeters}m)
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        &plusmn;{Math.round(r.checkInAccuracy)}m
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            r.verificationMethod === 'DEMO_SIMULATION'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                          }`}
                        >
                          {r.verificationMethod === 'DEMO_SIMULATION' ? 'DEMO SIM' : 'GPS GEOFENCE'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: GPS Audit Attempts (Successes & Rejections) */}
      {activeTab === 'AUDIT_ATTEMPTS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-navy-900">Geofence Compliance & Anomaly Audit</h4>
            <p className="text-xs text-slate-500">
              Complete auditable record of all check-in attempts including rejections due to boundary excess, low GPS accuracy, or duplicate records.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Reported Coordinates</th>
                  <th className="py-3 px-3">Calc Distance</th>
                  <th className="py-3 px-3">Result</th>
                  <th className="py-3 px-3">Rejection Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No audit attempts recorded yet.
                    </td>
                  </tr>
                ) : (
                  attempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 text-slate-500">
                        {new Date(att.attemptedAt).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-navy-900">
                        {att.student?.studentProfile?.fullName || att.student?.email}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] font-bold text-slate-700">
                        {att.attemptType}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                        {att.reportedLat}, {att.reportedLng} (&plusmn;{Math.round(att.reportedAccuracy)}m)
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-navy-900">
                        {att.calculatedDistance}m
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            att.isSuccess
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {att.isSuccess ? 'VERIFIED' : 'REJECTED'}
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
      )}
    </div>
  );
};
