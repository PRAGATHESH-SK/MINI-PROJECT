import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Internship } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Search,
  MapPin,
  Building2,
  Navigation,
  ArrowRight,
  Filter,
  Briefcase,
  Compass,
} from 'lucide-react';

export const InternshipSearch: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(50);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationActive, setLocationActive] = useState(false);

  const { info, error: toastError } = useToast();

  const tnDistricts = [
    'ALL', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Chengalpattu',
    'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Krishnagiri'
  ];

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedDistrict !== 'ALL') params.set('district', selectedDistrict);
      if (selectedType !== 'ALL') params.set('type', selectedType);

      if (userLocation && locationActive) {
        params.set('lat', String(userLocation.lat));
        params.set('lng', String(userLocation.lng));
        params.set('radiusKm', String(maxDistanceKm));
      }

      const res = await api.get<{ data: Internship[] }>(`/internships?${params.toString()}`);
      if (res.data) {
        setInternships(res.data as any);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load internships.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDistrict, selectedType, userLocation, locationActive, maxDistanceKm, toastError]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      toastError('Browser Geolocation is not supported by your device.');
      return;
    }

    info('Requesting current GPS coordinates for localized radius search...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationActive(true);
        info('GPS Location acquired. Filtering opportunities by distance.');
      },
      (err) => {
        toastError(`Unable to retrieve GPS: ${err.message}. Showing statewide results.`);
        setLocationActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Localized Discovery Engine</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Explore Tamil Nadu Industry Internships
          </h1>
          <p className="text-xs text-slate-500">
            Search verified on-site and hybrid opportunities by district, skills, stipend, and geodesic proximity.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or skills (e.g. React, IoT, Python)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs text-slate-900"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs text-slate-900"
            >
              <option value="ALL">All Tamil Nadu Districts</option>
              {tnDistricts.filter((d) => d !== 'ALL').map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs text-slate-900"
            >
              <option value="ALL">All Modes</option>
              <option value="ON_SITE">On-Site</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleRequestLocation}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                locationActive
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${locationActive ? 'text-cyan-600' : 'text-slate-400'}`} />
              <span>{locationActive ? 'GPS Active' : 'Use My GPS'}</span>
            </button>
          </div>
        </div>

        {/* Distance Range Slider (visible when GPS enabled) */}
        {locationActive && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs animate-in fade-in-50">
            <span className="font-semibold text-slate-700 shrink-0">Max Distance:</span>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-48 accent-cyan-500 cursor-pointer"
            />
            <span className="font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              Within {maxDistanceKm} km
            </span>
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-semibold text-slate-700">
            {internships.length} Available Opportunities Found
          </span>
          {selectedDistrict !== 'ALL' && (
            <span>Filtered for: {selectedDistrict} District</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : internships.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Filter className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-navy-900">No matching internships found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your district selection, broadening the search keywords, or increasing the GPS distance radius.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {internships.map((internship) => (
              <div
                key={internship.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-navy-700" />
                        {internship.employer?.companyProfile?.companyName || 'Verified Tech Enterprise'}
                      </span>
                      <h3 className="text-base font-bold text-navy-900 mt-1">{internship.title}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wider shrink-0">
                      ₹{internship.stipend.toLocaleString()}/mo
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {internship.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {internship.district}, {internship.city}
                    </span>
                    {internship.distanceKm != null && (
                      <span className="font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded text-[11px]">
                        {internship.distanceKm} km away
                      </span>
                    )}
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500 font-medium">{internship.durationWeeks} Weeks</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-navy-900 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {internship.geofenceRadiusMeters}m Geofence
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {internship.skills.split(',').slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {s.trim()}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/student/internships/${internship.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-colors"
                  >
                    <span>View Listing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
