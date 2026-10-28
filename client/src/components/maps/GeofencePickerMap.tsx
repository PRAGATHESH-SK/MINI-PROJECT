import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import { siteIcon } from './mapUtils.js';

interface GeofencePickerMapProps {
  lat: number;
  lng: number;
  radiusMeters: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<{ onLocationChange: (lat: number, lng: number) => void }> = ({
  onLocationChange,
}) => {
  useMapEvents({
    click(e) {
      onLocationChange(
        Math.round(e.latlng.lat * 10000) / 10000,
        Math.round(e.latlng.lng * 10000) / 10000
      );
    },
  });
  return null;
};

const CenterUpdater: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [map, lat, lng]);
  return null;
};

export const GeofencePickerMap: React.FC<GeofencePickerMapProps> = ({
  lat,
  lng,
  radiusMeters,
  onLocationChange,
}) => {
  const presets = [
    { name: 'Chennai (Siruseri IT Park)', lat: 12.8258, lng: 80.2227 },
    { name: 'Coimbatore (Saravanampatti SEZ)', lat: 11.0831, lng: 76.9961 },
    { name: 'Madurai (ELCOT IT Park)', lat: 9.9482, lng: 78.1561 },
    { name: 'Tiruchirappalli (Navalpattu)', lat: 10.7490, lng: 78.7397 },
    { name: 'Salem (Jagir Ammapalayam)', lat: 11.6643, lng: 78.1460 },
  ];

  return (
    <div className="space-y-2">
      {/* Quick location presets */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 font-medium mr-1">Tamil Nadu IT Hubs:</span>
        {presets.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => onLocationChange(p.lat, p.lng)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200/60"
          >
            {p.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        <MapContainer
          center={[lat || 13.0827, lng || 80.2707]}
          zoom={15}
          scrollWheelZoom={false}
          className="w-full h-full cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {lat && lng && (
            <>
              <Marker position={[lat, lng]} icon={siteIcon} />
              <Circle
                center={[lat, lng]}
                radius={radiusMeters}
                pathOptions={{
                  color: '#0f2942',
                  fillColor: '#06b6d4',
                  fillOpacity: 0.2,
                  weight: 2,
                  dashArray: '4, 4',
                }}
              />
            </>
          )}

          <MapClickHandler onLocationChange={onLocationChange} />
          <CenterUpdater lat={lat} lng={lng} />
        </MapContainer>

        <div className="absolute bottom-2 left-2 z-[1000] bg-white/95 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-navy-900 shadow-sm pointer-events-none">
          Click anywhere on map to set office GPS coordinates
        </div>
      </div>
    </div>
  );
};
