import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { InternshipApplication } from '../../types/index.js';
import {
  FileCheck2,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<InternshipApplication[]>('/applications/my')
      .then((res) => {
        if (res.data) setApplications(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600">
          Application Tracking
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          My Submitted Applications
        </h1>
        <p className="text-xs text-slate-500">
          Track interview progression, employer feedback, and active internship assignment letters.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-navy-900">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse localized openings matching your engineering discipline and preferred Tamil Nadu districts.
          </p>
          <Link
            to="/student/internships"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs"
          >
            <span>Explore Internships</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-navy-700" />
                      {app.internship?.employer?.companyProfile?.companyName}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {app.internship?.district}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">{app.internship?.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Feedback Alert if available */}
              {app.feedback && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex items-start gap-2 text-slate-700">
                  <MessageSquare className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[11px] text-slate-500">Employer Feedback:</span>
                    <p className="mt-0.5">{app.feedback}</p>
                  </div>
                </div>
              )}

              {/* Onboarding letter / Supervisor alert if SELECTED */}
              {app.status === 'SELECTED' && app.assignment && (
                <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-emerald-900 block">
                      Internship Assignment Active!
                    </span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Supervisor: <span className="font-semibold">{app.assignment.supervisorName}</span> &bull;{' '}
                      Geofence: <span className="font-semibold">{app.internship?.geofenceRadiusMeters}m</span>
                    </p>
                  </div>

                  <Link
                    to="/student/attendance"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Launch GPS Attendance</span>
                  </Link>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </span>

                <Link
                  to={`/student/internships/${app.internshipId}`}
                  className="inline-flex items-center gap-1 font-semibold text-navy-900 hover:text-cyan-600"
                >
                  <span>View Listing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
