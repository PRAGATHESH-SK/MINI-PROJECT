import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { siteIcon, studentIcon } from './mapUtils.js';

interface AttendanceMapProps {
  siteLat: number;
  siteLng: number;
  siteName: string;
  geofenceRadiusMeters: number;
  studentLat?: number | null;
  studentLng?: number | null;
  studentAccuracy?: number | null;
  distanceMeters?: number | null;
  isWithinGeofence?: boolean | null;
}

// Auto-adjust bounds when student position changes
const BoundsUpdater: React.FC<{
  siteLat: number;
  siteLng: number;
  studentLat?: number | null;
  studentLng?: number | null;
}> = ({ siteLat, siteLng, studentLat, studentLng }) => {
  const map = useMap();

  useEffect(() => {
    if (studentLat && studentLng) {
      const bounds = L.latLngBounds([
        [siteLat, siteLng],
        [studentLat, studentLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    } else {
      map.setView([siteLat, siteLng], 16);
    }
  }, [map, siteLat, siteLng, studentLat, studentLng]);

  return null;
};

export const AttendanceMap: React.FC<AttendanceMapProps> = ({
  siteLat,
  siteLng,
  siteName,
  geofenceRadiusMeters,
  studentLat,
  studentLng,
  studentAccuracy,
  distanceMeters,
  isWithinGeofence,
}) => {
  return (
    <div className="relative w-full h-[400px] md:h-[460px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <MapContainer
        center={[siteLat, siteLng]}
        zoom={16}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Workplace Site Marker */}
        <Marker position={[siteLat, siteLng]} icon={siteIcon}>
          <Popup>
            <div className="p-1 text-xs">
              <span className="font-bold text-navy-900 block">{siteName}</span>
              <span className="text-slate-500 block mt-0.5">Authorized Geofence Workplace</span>
              <span className="text-[11px] text-cyan-700 font-semibold block mt-1">
                Radius: {geofenceRadiusMeters} meters
              </span>
            </div>
          </Popup>
        </Marker>

        {/* Authorized Geofence Circle */}
        <Circle
          center={[siteLat, siteLng]}
          radius={geofenceRadiusMeters}
          pathOptions={{
            color: '#0f2942',
            fillColor: isWithinGeofence ? '#06b6d4' : '#0f2942',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '4, 4',
          }}
        />

        {/* Student Marker and GPS Accuracy Circle */}
        {studentLat && studentLng && (
          <>
            <Marker position={[studentLat, studentLng]} icon={studentIcon}>
              <Popup>
                <div className="p-1 text-xs">
                  <span className="font-bold text-navy-900 block">Your Current GPS Fix</span>
                  <span className="text-slate-500 block mt-0.5">
                    Accuracy: ±{Math.round(studentAccuracy || 0)}m
                  </span>
                  {distanceMeters != null && (
                    <span
                      className={`font-semibold block mt-1 ${
                        isWithinGeofence ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {distanceMeters}m from site ({isWithinGeofence ? 'Inside Radius' : 'Outside Radius'})
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* GPS Accuracy Circle */}
            {studentAccuracy && (
              <Circle
                center={[studentLat, studentLng]}
                radius={studentAccuracy}
                pathOptions={{
                  color: '#06b6d4',
                  fillColor: '#06b6d4',
                  fillOpacity: 0.1,
                  weight: 1,
                }}
              />
            )}

            {/* Connecting line between student & workplace */}
            <Polyline
              positions={[
                [siteLat, siteLng],
                [studentLat, studentLng],
              ]}
              pathOptions={{
                color: isWithinGeofence ? '#06b6d4' : '#e11d48',
                weight: 2,
                dashArray: '6, 6',
              }}
            />
          </>
        )}

        <BoundsUpdater
          siteLat={siteLat}
          siteLng={siteLng}
          studentLat={studentLat}
          studentLng={studentLng}
        />
      </MapContainer>

      {/* Floating Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-200/80 shadow-md text-xs space-y-1.5 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-navy-900 border border-white" />
          <span className="font-medium text-slate-700">Workplace Centroid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500 border border-white" />
          <span className="font-medium text-slate-700">Your GPS Fix</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-1.5 border border-dashed border-navy-900 bg-cyan-100" />
          <span className="text-[11px] text-slate-500 font-medium">{geofenceRadiusMeters}m Geofence</span>
        </div>
      </div>
    </div>
  );
};
