import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Internship, InternshipApplication } from '../../types/index.js';
import {
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  X,
  Send,
} from 'lucide-react';

export const EmployerApplicants: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>(
    searchParams.get('internshipId') || ''
  );
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Modal State
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);
  const [statusAction, setStatusAction] = useState<string>('SHORTLISTED');
  const [feedback, setFeedback] = useState<string>('');
  const [supervisorName, setSupervisorName] = useState<string>('Site Technical Lead');
  const [supervisorContact, setSupervisorContact] = useState<string>('supervisor@company.com');
  const [updating, setUpdating] = useState(false);

  // Fetch employer's internships
  useEffect(() => {
    if (!user) return;
    api.get<Internship[]>(`/internships?employerId=${user.id}`)
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setInternships(res.data);
          if (!selectedInternshipId && res.data.length > 0) {
            setSelectedInternshipId(res.data[0].id);
          }
        }
      })
      .catch(() => {});
  }, [user, selectedInternshipId]);

  // Fetch applicants for chosen internship
  const fetchApplicants = useCallback(async (internshipId: string) => {
    if (!internshipId) return;
    setLoading(true);
    try {
      const res = await api.get<InternshipApplication[]>(`/applications/internship/${internshipId}`);
      if (res.data) setApplications(res.data);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch applicants.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (selectedInternshipId) {
      fetchApplicants(selectedInternshipId);
      setSearchParams({ internshipId: selectedInternshipId });
    }
  }, [selectedInternshipId, fetchApplicants, setSearchParams]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setUpdating(true);
    try {
      await api.patch(`/applications/${selectedApp.id}/status`, {
        status: statusAction,
        feedback,
        ...(statusAction === 'SELECTED' && {
          supervisorName,
          supervisorContact,
        }),
      });
      success(`Candidate status updated to ${statusAction}.`);
      setSelectedApp(null);
      fetchApplicants(selectedInternshipId);
    } catch (err: any) {
      toastError(err.message || 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'SHORTLISTED':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'REVIEWING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-600" />
            <span>Applicant Evaluation</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Review Candidate Applications
          </h1>
          <p className="text-xs text-slate-500">
            Review university resumes, shortlist candidates, and onboard interns for geofenced attendance.
          </p>
        </div>

        {/* Filter by Internship */}
        <div className="shrink-0 w-full sm:w-64">
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Select Internship:</label>
          <select
            value={selectedInternshipId}
            onChange={(e) => setSelectedInternshipId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900"
          >
            {internships.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applicant Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-navy-900">No applicants for this position yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Students from Tamil Nadu universities will appear here once they submit applications.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-navy-900">
                        {app.student?.studentProfile?.fullName || 'Student Applicant'}
                      </h3>
                      {app.student?.studentProfile?.registerNumber && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Reg: {app.student.studentProfile.registerNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-cyan-600" />
                      <span>{app.student?.studentProfile?.collegeName}</span>
                      <span>&bull;</span>
                      <span>
                        {app.student?.studentProfile?.degree} in {app.student?.studentProfile?.department} (Year {app.student?.studentProfile?.yearOfStudy})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApp(app);
                        setStatusAction(app.status === 'APPLIED' ? 'SHORTLISTED' : app.status);
                        setFeedback(app.feedback || '');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors"
                    >
                      Manage Status
                    </button>
                  </div>
                </div>

                {/* Candidate Skills */}
                {app.student?.studentProfile?.skills && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-medium mr-1">Skills:</span>
                    {app.student.studentProfile.skills.split(',').map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Cover letter */}
                {app.coverLetter && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold block text-[10px] uppercase text-slate-400 mb-1">
                      Statement of Interest:
                    </span>
                    <p className="leading-relaxed">{app.coverLetter}</p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                  <span className="text-slate-600 font-medium">
                    Email: <span className="text-navy-900 font-semibold">{app.student?.email}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy-900">
                  Update Candidate Application
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedApp.student?.studentProfile?.fullName} &bull; {selectedApp.student?.studentProfile?.collegeName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Stage / Decision</label>
                <select
                  value={statusAction}
                  onChange={(e) => setStatusAction(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 font-semibold"
                >
                  <option value="REVIEWING">REVIEWING &mdash; Under HR Evaluation</option>
                  <option value="SHORTLISTED">SHORTLISTED &mdash; Technical Interview</option>
                  <option value="SELECTED">SELECTED &mdash; Offer Internship & Enable Geofenced Attendance</option>
                  <option value="REJECTED">REJECTED &mdash; Not Proceeding</option>
                </select>
              </div>

              {statusAction === 'SELECTED' && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Onboarding Assignment Parameters</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Selecting this student officially registers an active InternshipAssignment, allowing them to record daily verified GPS attendance at your site centroid.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Supervisor Name</label>
                      <input
                        type="text"
                        value={supervisorName}
                        onChange={(e) => setSupervisorName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Supervisor Email</label>
                      <input
                        type="email"
                        value={supervisorContact}
                        onChange={(e) => setSupervisorContact(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Feedback or Interview Notes for Student (optional)
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Cleared technical interview round with 85% score. Reporting date: Monday 9:00 AM."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{updating ? 'Saving...' : 'Confirm Decision'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
