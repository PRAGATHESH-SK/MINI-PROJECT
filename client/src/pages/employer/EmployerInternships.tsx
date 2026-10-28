import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Internship } from '../../types/index.js';
import { GeofencePickerMap } from '../../components/maps/GeofencePickerMap.js';
import {
  Briefcase,
  Plus,
  MapPin,
  Calendar,
  Users,
  X,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export const EmployerInternships: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requirements: '',
    responsibilities: '',
    skills: '',
    stipend: 15000,
    durationWeeks: 12,
    slots: 2,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    internshipType: 'ON_SITE',
    district: 'Chennai',
    city: 'Chennai',
    address: 'SIPCOT IT Park, Siruseri',
    latitude: 12.8258,
    longitude: 80.2227,
    geofenceRadiusMeters: 150,
  });

  const tnDistricts = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Chengalpattu',
    'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Krishnagiri'
  ];

  const fetchInternships = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get<{ data: Internship[] }>(`/internships?employerId=${user.id}`);
      if (res.data) setInternships(res.data as any);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  }, [user, toastError]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/internships', {
        ...formData,
        stipend: Number(formData.stipend),
        durationWeeks: Number(formData.durationWeeks),
        slots: Number(formData.slots),
        geofenceRadiusMeters: Number(formData.geofenceRadiusMeters),
        deadline: new Date(formData.deadline).toISOString(),
      });
      success('Internship listing created successfully.');
      setShowModal(false);
      fetchInternships();
    } catch (err: any) {
      toastError(err.message || 'Failed to create internship.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-cyan-600" />
            <span>Listing Management</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Manage Workplace Internships
          </h1>
          <p className="text-xs text-slate-500">
            Publish positions with precise GPS coordinates, geofence radii, and skill requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>Post New Internship</span>
        </button>
      </div>

      {/* Listings Table / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : internships.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-navy-900">No internship listings published yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first workplace listing to start accepting student applications.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-navy-900 text-white font-bold text-xs"
            >
              Post Internship Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {internships.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">{item.department}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {item.district}, {item.city}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-navy-900">{item.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Stipend</span>
                    <span className="font-bold text-navy-900">₹{item.stipend.toLocaleString()}/mo</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Open Slots</span>
                    <span className="font-bold text-navy-900">{item.slots} Positions</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Geofence Perimeter</span>
                    <span className="font-bold text-cyan-700">{item.geofenceRadiusMeters} meters</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">GPS Centroid</span>
                    <span className="font-mono text-slate-700 truncate block">
                      {item.latitude}, {item.longitude}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-navy-900">
                      <Users className="w-3.5 h-3.5 text-cyan-600" />
                      {item._count?.applications || 0} Candidates Applied
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: {new Date(item.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <a
                    href={`/employer/applications?internshipId=${item.id}`}
                    className="font-bold text-navy-900 hover:text-cyan-600"
                  >
                    View Applicants &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Internship Modal with Leaflet Map Coordinate Picker */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-navy-900">Create Internship Listing</h3>
                <p className="text-xs text-slate-500">
                  Configure role parameters, skills, and GPS workplace geofence radius
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internship Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Embedded AI & IoT Systems Intern"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department / Business Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Digital Transformation & Cloud"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Description & Project Scope</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the technical tasks, project mentorship, and day-to-day responsibilities..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Requirements & Qualifications</label>
                <input
                  type="text"
                  required
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="e.g. B.E. CSE/ECE with strong C++, React, and SQL fundamentals"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Stipend (INR)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min={4}
                    max={52}
                    required
                    value={formData.durationWeeks}
                    onChange={(e) => setFormData({ ...formData, durationWeeks: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Slots Available</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.slots}
                    onChange={(e) => setFormData({ ...formData, slots: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Python, Docker, Node.js, C++"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                />
              </div>

              {/* Workplace Address & Geofence Picker */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">District</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                    >
                      {tnDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City / Hub</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Siruseri / Saravanampatti"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Campus / Building Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Plot No 1, SIPCOT IT Park"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
                    />
                  </div>
                </div>

                {/* Radius Slider & Coordinate Preview */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <Sliders className="w-4 h-4 text-cyan-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">Geofence Radius: </span>
                      <span className="font-extrabold text-cyan-700">
                        {formData.geofenceRadiusMeters} meters
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={formData.geofenceRadiusMeters}
                    onChange={(e) => setFormData({ ...formData, geofenceRadiusMeters: Number(e.target.value) })}
                    className="w-48 accent-navy-900 cursor-pointer"
                  />
                  <div className="font-mono text-[11px] text-slate-500">
                    Centroid: {formData.latitude}, {formData.longitude}
                  </div>
                </div>

                {/* Leaflet Map Picker */}
                <GeofencePickerMap
                  lat={formData.latitude}
                  lng={formData.longitude}
                  radiusMeters={formData.geofenceRadiusMeters}
                  onLocationChange={(lat, lng) => setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>{submitting ? 'Publishing...' : 'Publish Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
