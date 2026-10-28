import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Internship } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { AttendanceMap } from '../../components/maps/AttendanceMap.js';
import {
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  DollarSign,
  Users,
  Clock,
  ArrowLeft,
  Send,
  ShieldCheck,
} from 'lucide-react';

export const InternshipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      api.get<{ data: Internship }>(`/internships/${id}`)
        .then((res) => {
          if (res.data) setInternship(res.data as any);
        })
        .catch((err) => toastError(err.message || 'Failed to load details.'))
        .finally(() => setLoading(false));
    }
  }, [id, toastError]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internship) return;
    setSubmitting(true);
    try {
      const res = await api.post('/applications', {
        internshipId: internship.id,
        coverLetter,
      });
      success('Application submitted successfully!');
      setShowApplyModal(false);
      // Update local state
      setInternship({
        ...internship,
        existingApplication: res.data as any,
      });
    } catch (err: any) {
      toastError(err.message || 'Application submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-200 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-navy-900">Internship Not Found</h3>
        <Link to="/student/internships" className="text-xs font-bold text-cyan-600 hover:underline">
          Return to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        to="/student/internships"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Internship Directory</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-navy-800" />
              <span>{internship.employer?.companyProfile?.companyName}</span>
              <span>&bull;</span>
              <span>{internship.employer?.companyProfile?.industry}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              {internship.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{internship.address}, {internship.district}, {internship.city}</span>
            </p>
          </div>

          {/* Action / Status Pill */}
          <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wider">
              ₹{internship.stipend.toLocaleString()} / Month
            </span>

            {internship.activeAssignment ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Active Intern
                </span>
                <Link
                  to="/student/attendance"
                  className="px-3 py-1.5 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800"
                >
                  Mark Attendance
                </Link>
              </div>
            ) : internship.existingApplication ? (
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-navy-900 border border-slate-200 text-xs font-bold">
                Application Status: {internship.existingApplication.status}
              </span>
            ) : user?.role === 'STUDENT' ? (
              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs transition-colors shadow-md shadow-cyan-500/20"
              >
                Apply for Internship
              </button>
            ) : null}
          </div>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mode</span>
            <span className="font-bold text-navy-900">{internship.internshipType.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Duration</span>
            <span className="font-bold text-navy-900">{internship.durationWeeks} Weeks</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Open Slots</span>
            <span className="font-bold text-navy-900">{internship.slots} Positions</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Geofence Radius</span>
            <span className="font-bold text-cyan-700">{internship.geofenceRadiusMeters} meters</span>
          </div>
        </div>

        {/* Description & Requirements */}
        <div className="space-y-6 pt-2">
          <div>
            <h3 className="font-bold text-sm text-navy-900 mb-2">Role Overview</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {internship.description}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm text-navy-900 mb-2">Key Requirements & Eligibility</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {internship.requirements}
            </p>
          </div>

          {internship.responsibilities && (
            <div>
              <h3 className="font-bold text-sm text-navy-900 mb-2">Responsibilities</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {internship.responsibilities}
              </p>
            </div>
          )}

          <div>
            <h3 className="font-bold text-sm text-navy-900 mb-2">Required Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {internship.skills.split(',').map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-lg bg-navy-50 text-navy-800 text-xs font-semibold border border-navy-100"
                >
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Authorized Workplace Geofence Preview Map */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-navy-900">Workplace Geofence Site Map</h3>
              <p className="text-xs text-slate-500">
                Leaflet OpenStreetMap view of the office perimeter & authorized {internship.geofenceRadiusMeters}m geofence radius.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
              Centroid: {internship.latitude}, {internship.longitude}
            </span>
          </div>

          <AttendanceMap
            siteLat={internship.latitude}
            siteLng={internship.longitude}
            siteName={internship.title}
            geofenceRadiusMeters={internship.geofenceRadiusMeters}
          />
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-navy-900">Apply for {internship.title}</h3>
              <p className="text-xs text-slate-500">
                {internship.employer?.companyProfile?.companyName} &bull; {internship.district}
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Statement of Purpose / Cover Letter
                </label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain your relevant project work, interest in this domain, and availability for on-site attendance..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 resize-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                <span className="font-semibold text-slate-700 block">Candidate Verification:</span>
                <p>
                  Your registered student profile, academic credentials from{' '}
                  <span className="font-semibold">{(user?.profile as any)?.collegeName}</span>, and contact details will be shared securely with this employer.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
