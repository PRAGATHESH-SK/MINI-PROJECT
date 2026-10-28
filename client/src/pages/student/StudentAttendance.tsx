import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { InternshipApplication, AttendanceRecord } from '../../types/index.js';
import { AttendanceMap } from '../../components/maps/AttendanceMap.js';
import {
  MapPin,
  ShieldCheck,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCw,
  Building2,
  CalendarCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError, warning, info } = useToast();

  const [activeApp, setActiveApp] = useState<InternshipApplication | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // GPS state
  const [gpsStatus, setGpsStatus] = useState<'IDLE' | 'ACQUIRING' | 'ACQUIRED' | 'DENIED' | 'ERROR'>('IDLE');
  const [reportedLat, setReportedLat] = useState<number | null>(null);
  const [reportedLng, setReportedLng] = useState<number | null>(null);
  const [reportedAccuracy, setReportedAccuracy] = useState<number | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean | null>(null);
  const [isDemoSimulation, setIsDemoSimulation] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchAssignmentData = useCallback(async () => {
    try {
      const [appsRes, attRes] = await Promise.all([
        api.get<InternshipApplication[]>('/applications/my'),
        api.get<AttendanceRecord[]>('/attendance/my'),
      ]);

      if (appsRes.data) {
        const found = appsRes.data.find(
          (a) => a.status === 'SELECTED' && a.assignment?.status === 'ACTIVE'
        );
        setActiveApp(found || null);
      }
      if (attRes.data) {
        setHistory(attRes.data);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch attendance state.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchAssignmentData();
  }, [fetchAssignmentData]);

  // Request real device GPS
  const requestRealLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('ERROR');
      toastError('Browser Geolocation is not supported by this browser.');
      return;
    }

    setGpsStatus('ACQUIRING');
    setIsDemoSimulation(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 100000) / 100000;
        const lng = Math.round(pos.coords.longitude * 100000) / 100000;
        const accuracy = Math.round(pos.coords.accuracy * 10) / 10;

        setReportedLat(lat);
        setReportedLng(lng);
        setReportedAccuracy(accuracy);
        setGpsStatus('ACQUIRED');

        // Estimate local distance for instant UX feedback (the server strictly re-validates)
        if (activeApp?.internship) {
          const R = 6371000;
          const dLat = ((activeApp.internship.latitude - lat) * Math.PI) / 180;
          const dLon = ((activeApp.internship.longitude - lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) *
              Math.cos((activeApp.internship.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const estDist = Math.round(R * c);

          setDistanceMeters(estDist);
          setIsWithinGeofence(estDist <= activeApp.internship.geofenceRadiusMeters);
        }

        success(`Acquired device GPS fix (Accuracy: ±${accuracy}m).`);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('DENIED');
          warning('Location permission was denied. You can allow location access or test using Demo Simulator.');
        } else {
          setGpsStatus('ERROR');
          toastError(`GPS error: ${err.message}.`);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  // Demo Simulation Presets
  const applyDemoPreset = (preset: 'INSIDE' | 'BORDERLINE' | 'OUTSIDE' | 'INACCURATE') => {
    if (!activeApp?.internship) return;
    const { latitude, longitude, geofenceRadiusMeters } = activeApp.internship;

    setIsDemoSimulation(true);
    setGpsStatus('ACQUIRED');

    let simLat = latitude;
    let simLng = longitude;
    let simAccuracy = 12.0;

    switch (preset) {
      case 'INSIDE': // ~25 meters from centroid
        simLat = latitude + 0.0002;
        simLng = longitude + 0.0001;
        simAccuracy = 12.0;
        break;
      case 'BORDERLINE': // ~140 meters (near 150m boundary)
        simLat = latitude + 0.0011;
        simLng = longitude + 0.0006;
        simAccuracy = 15.0;
        break;
      case 'OUTSIDE': // ~480 meters outside
        simLat = latitude + 0.0035;
        simLng = longitude + 0.0030;
        simAccuracy = 15.0;
        break;
      case 'INACCURATE': // 30m away, but terrible GPS error (130m > max 100m)
        simLat = latitude + 0.0002;
        simLng = longitude + 0.0002;
        simAccuracy = 135.0;
        break;
    }

    setReportedLat(simLat);
    setReportedLng(simLng);
    setReportedAccuracy(simAccuracy);

    // Approximate distance
    const R = 6371000;
    const dLat = ((latitude - simLat) * Math.PI) / 180;
    const dLon = ((longitude - simLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((simLat * Math.PI) / 180) *
        Math.cos((latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const estDist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    setDistanceMeters(estDist);
    setIsWithinGeofence(estDist <= geofenceRadiusMeters && simAccuracy <= 100);

    info(`Applied Demo Coordinate Preset: ${preset} (Distance: ~${estDist}m).`);
  };

  // Perform server-side Check-In
  const handleCheckIn = async () => {
    if (!activeApp?.internship || reportedLat == null || reportedLng == null || reportedAccuracy == null) {
      warning('Please acquire GPS location or select a demo simulation coordinate first.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/attendance/check-in', {
        internshipId: activeApp.internship.id,
        latitude: reportedLat,
        longitude: reportedLng,
        accuracy: reportedAccuracy,
        isSimulation: isDemoSimulation,
      });

      success(
        res.message || 'Check-in recorded and verified successfully!',
        isDemoSimulation ? 'Verified via Simulator (DEMO)' : 'Verified via PostGIS Geofence'
      );
      fetchAssignmentData();
    } catch (err: any) {
      toastError(err.message || 'Check-in rejected by geofence validator.', 'Geofence Verification Rejection');
    } finally {
      setActionLoading(false);
    }
  };

  // Perform server-side Check-Out
  const handleCheckOut = async () => {
    if (!activeApp?.internship || reportedLat == null || reportedLng == null || reportedAccuracy == null) {
      warning('Please acquire GPS location or select a demo simulation coordinate first.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/attendance/check-out', {
        internshipId: activeApp.internship.id,
        latitude: reportedLat,
        longitude: reportedLng,
        accuracy: reportedAccuracy,
        isSimulation: isDemoSimulation,
      });

      success(
        res.message || 'Check-out recorded successfully!',
        isDemoSimulation ? 'Verified via Simulator (DEMO)' : 'Verified via PostGIS Geofence'
      );
      fetchAssignmentData();
    } catch (err: any) {
      toastError(err.message || 'Check-out rejected by geofence validator.', 'Verification Rejection');
    } finally {
      setActionLoading(false);
    }
  };

  const todayRecord = history.find((h) => h.date === todayStr);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-200 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeApp || !activeApp.internship) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-xl mx-auto my-8">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold text-navy-900">No Active Internship Assignment</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          GPS geofenced attendance verification requires an official active internship assignment onboarded by an authorized employer.
        </p>
        <a
          href="/student/internships"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-sm"
        >
          Explore Internships
        </a>
      </div>
    );
  }

  const { internship } = activeApp;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              <span>PostGIS Geofence Attendance System</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-0.5">
              Workplace GPS Attendance
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <Building2 className="w-3.5 h-3.5 text-navy-800" />
              <span className="font-semibold text-slate-700">{internship.title}</span>
              <span>&bull;</span>
              <span>{internship.employer?.companyProfile?.companyName}</span>
              <span>&bull;</span>
              <span className="text-cyan-700 font-bold">{internship.geofenceRadiusMeters}m Allowed Radius</span>
            </p>
          </div>

          {/* Today's Status Badge */}
          <div className="shrink-0 flex items-center gap-2">
            {todayRecord?.checkOutTime ? (
              <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Completed For Today
              </span>
            ) : todayRecord?.checkInTime ? (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 animate-pulse">
                <Clock className="w-4 h-4 text-emerald-600" />
                Checked In &mdash; Active
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Pending Check-In
              </span>
            )}
          </div>
        </div>

        {/* Browser Geolocation Privacy Note */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
          <Compass className="w-4 h-4 text-navy-700 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold text-navy-900">Location Privacy & Accuracy Notice: </span>
            Connecting Tech requests your browser GPS coordinates exclusively when marking attendance. The server verifies your geodesic position against the employer's registered centroid ({internship.latitude}, {internship.longitude}) using PostgreSQL geography calculations. Attempts outside the {internship.geofenceRadiusMeters}m radius or with accuracy error &gt; 100m will be rejected.
          </p>
        </div>
      </div>

      {/* GPS Location & Geofence Simulator Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-600" />
              <span>Current GPS Status & Coordinates</span>
            </h3>
            <p className="text-xs text-slate-500">
              Obtain authentic GPS coordinates from your device, or test edge cases with the visible Demo Simulator.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={requestRealLocation}
              disabled={gpsStatus === 'ACQUIRING'}
              className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RotateCw className={`w-3.5 h-3.5 ${gpsStatus === 'ACQUIRING' ? 'animate-spin' : ''}`} />
              <span>{gpsStatus === 'ACQUIRING' ? 'Acquiring GPS...' : 'Acquire Device GPS'}</span>
            </button>
          </div>
        </div>

        {/* Demo Simulator Panel (Visible & Distinctly Labelled) */}
        <div className="bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>[DEMO SIMULATOR] Developer Test Scenarios</span>
            </span>
            <span className="text-[10px] bg-amber-200/60 text-amber-900 font-bold px-2 py-0.5 rounded">
              VISIBLY MARKED AS DEMO
            </span>
          </div>
          <p className="text-[11px] text-amber-800 leading-snug">
            Since automated or desktop environments may lack GPS hardware or be located outside Siruseri/Coimbatore workplace coordinates, use these pre-calculated test scenarios to evaluate server-side boundary validations:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => applyDemoPreset('INSIDE')}
              className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all shadow-xs"
            >
              <span className="font-bold text-emerald-800 block">1. Inside Office</span>
              <span className="text-[10px] text-slate-500 block">~25m away &bull; ±12m acc</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Expected: PASS</span>
            </button>

            <button
              type="button"
              onClick={() => applyDemoPreset('BORDERLINE')}
              className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-cyan-500 hover:bg-cyan-50/50 text-left transition-all shadow-xs"
            >
              <span className="font-bold text-navy-900 block">2. Borderline Edge</span>
              <span className="text-[10px] text-slate-500 block">~140m away &bull; ±15m acc</span>
              <span className="text-[10px] text-cyan-600 font-semibold mt-1 block">Expected: PASS</span>
            </button>

            <button
              type="button"
              onClick={() => applyDemoPreset('OUTSIDE')}
              className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-rose-500 hover:bg-rose-50/50 text-left transition-all shadow-xs"
            >
              <span className="font-bold text-rose-800 block">3. Far Outside</span>
              <span className="text-[10px] text-slate-500 block">~480m away &bull; ±15m acc</span>
              <span className="text-[10px] text-rose-600 font-semibold mt-1 block">Expected: REJECT</span>
            </button>

            <button
              type="button"
              onClick={() => applyDemoPreset('INACCURATE')}
              className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-rose-500 hover:bg-rose-50/50 text-left transition-all shadow-xs"
            >
              <span className="font-bold text-rose-800 block">4. Low Accuracy</span>
              <span className="text-[10px] text-slate-500 block">30m away &bull; ±135m acc</span>
              <span className="text-[10px] text-rose-600 font-semibold mt-1 block">Expected: REJECT</span>
            </button>
          </div>
        </div>

        {/* GPS Fix Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Reported Fix</span>
            <span className="font-mono font-bold text-navy-900 truncate block mt-0.5">
              {reportedLat ? `${reportedLat}, ${reportedLng}` : 'GPS Pending'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">GPS Accuracy</span>
            <span className="font-bold text-navy-900 block mt-0.5">
              {reportedAccuracy ? `±${reportedAccuracy} meters` : '--'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Distance to Site</span>
            <span className="font-bold text-navy-900 block mt-0.5">
              {distanceMeters != null ? `${distanceMeters} meters` : '--'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Geofence Status</span>
            {isWithinGeofence === true ? (
              <span className="font-bold text-emerald-600 block mt-0.5">Within Geofence</span>
            ) : isWithinGeofence === false ? (
              <span className="font-bold text-rose-600 block mt-0.5">Outside Radius</span>
            ) : (
              <span className="text-slate-400 font-medium block mt-0.5">Awaiting Fix</span>
            )}
          </div>
        </div>

        {/* Interactive Leaflet Map */}
        <AttendanceMap
          siteLat={internship.latitude}
          siteLng={internship.longitude}
          siteName={internship.title}
          geofenceRadiusMeters={internship.geofenceRadiusMeters}
          studentLat={reportedLat}
          studentLng={reportedLng}
          studentAccuracy={reportedAccuracy}
          distanceMeters={distanceMeters}
          isWithinGeofence={isWithinGeofence}
        />

        {/* Check-In / Check-Out Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {isDemoSimulation ? (
              <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulation Active: Verification will be recorded as DEMO_SIMULATION</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                <span>Genuine Device GPS fix will be cryptographically evaluated by PostgreSQL PostGIS</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={actionLoading || (todayRecord != null && todayRecord.checkInTime != null)}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-navy-950 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{todayRecord?.checkInTime ? 'Already Checked In' : 'Check In Now'}</span>
            </button>

            <button
              type="button"
              onClick={handleCheckOut}
              disabled={
                actionLoading ||
                !todayRecord?.checkInTime ||
                todayRecord.checkOutTime != null
              }
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Clock className="w-4 h-4" />
              <span>{todayRecord?.checkOutTime ? 'Checked Out' : 'Check Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-cyan-600" />
            <span>Verified Attendance History</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {history.length} Verified Days Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Check-In</th>
                <th className="py-3 px-3">Check-Out</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3">Verification</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No attendance records verified yet. Check in above to generate your first verified log.
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-navy-900">{record.date}</td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {new Date(record.checkInTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {record.checkOutTime
                        ? new Date(record.checkOutTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      <span className="font-semibold text-navy-900">{record.checkInDistance}m</span> from site
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          record.verificationMethod === 'DEMO_SIMULATION'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                        }`}
                      >
                        {record.verificationMethod === 'DEMO_SIMULATION' ? 'DEMO' : 'GPS GEOFENCE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {record.status}
                      </span>
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
