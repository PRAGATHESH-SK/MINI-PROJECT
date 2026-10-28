import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Internship } from '../../types/index.js';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const AdminModeration: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await api.get<{ data: Internship[] }>(`/internships?${params.toString()}`);
      if (res.data) setInternships(res.data as any);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch moderation queue.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toastError]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleModerate = async (id: string, status: 'ACTIVE' | 'REJECTED', comment?: string) => {
    try {
      await api.patch(`/internships/${id}/moderate`, { status, comment });
      success(`Internship listing marked as ${status}.`);
      fetchListings();
    } catch (err: any) {
      toastError(err.message || 'Moderation action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-cyan-600" />
            <span>State Compliance & Quality Gate</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Internship Moderation Queue
          </h1>
          <p className="text-xs text-slate-500">
            Audit employer listings, verify workplace geofence perimeters, and approve credit-eligible positions.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : internships.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-navy-900">Moderation queue clear</h3>
            <p className="text-xs text-slate-500">
              No listings currently require administrative review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {internships.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-navy-700" />
                        {item.employer?.companyProfile?.companyName || 'Corporate Partner'}
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {item.district}, {item.city}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-navy-900">{item.title}</h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                      item.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : item.status === 'PENDING_REVIEW'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Geofence Workplace Centroid
                    </span>
                    <span className="font-mono font-bold text-navy-900">
                      {item.latitude}, {item.longitude} ({item.geofenceRadiusMeters}m radius)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stipend</span>
                    <span className="font-bold text-emerald-600">₹{item.stipend.toLocaleString()}/month</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Slots</span>
                    <span className="font-bold text-navy-900">{item.slots} Interns</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => handleModerate(item.id, 'ACTIVE')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Listing</span>
                      </button>
                    )}
                    {item.status !== 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => handleModerate(item.id, 'REJECTED', 'Requires additional verification')}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Listing</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
