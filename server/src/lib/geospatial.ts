import { prisma } from './prisma.js';

export interface GeofenceEvaluation {
  isWithinGeofence: boolean;
  distanceMeters: number;
  reportedAccuracy: number;
  allowedRadiusMeters: number;
  methodUsed: 'POSTGIS' | 'POSTGRES_GEODESIC' | 'LOCAL_HAVERSINE';
}

/**
 * Validates coordinate ranges according to WGS84 standard
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) return false;
  if (typeof lng !== 'number' || isNaN(lng) || lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Native Haversine formula calculation in TypeScript (meters)
 * Earth mean radius = 6,371,000 meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Reliable server-side Geodesic / PostGIS distance calculation via PostgreSQL database.
 * Executes parameterized SQL to avoid SQL injection.
 * Tries PostGIS ST_Distance first if PostGIS is installed, otherwise uses PostgreSQL's
 * earth_distance or exact Great-Circle geodesic formula.
 */
export async function calculateDatabaseDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<{ distanceMeters: number; method: 'POSTGIS' | 'POSTGRES_GEODESIC' }> {
  try {
    // Try PostGIS ST_Distance query first
    const postgisResult: any[] = await prisma.$queryRaw`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint(${lon1}, ${lat1}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lon2}, ${lat2}), 4326)::geography
      ) AS distance_meters;
    `;
    if (postgisResult && postgisResult[0] && postgisResult[0].distance_meters != null) {
      return {
        distanceMeters: Math.round(Number(postgisResult[0].distance_meters) * 100) / 100,
        method: 'POSTGIS',
      };
    }
  } catch (_postgisErr) {
    // PostGIS extension not active; proceed to PostgreSQL geodesic query
  }

  try {
    // Try PostgreSQL earthdistance extension
    const earthResult: any[] = await prisma.$queryRaw`
      SELECT earth_distance(
        ll_to_earth(${lat1}, ${lon1}),
        ll_to_earth(${lat2}, ${lon2})
      ) AS distance_meters;
    `;
    if (earthResult && earthResult[0] && earthResult[0].distance_meters != null) {
      return {
        distanceMeters: Math.round(Number(earthResult[0].distance_meters) * 100) / 100,
        method: 'POSTGRES_GEODESIC',
      };
    }
  } catch (_earthErr) {
    // If earthdistance not available, use Great-Circle parameterized SQL
  }

  // Parameterized Great-Circle formula inside PostgreSQL
  const gcResult: any[] = await prisma.$queryRaw`
    SELECT (
      6371000 * 2 * ASIN(
        SQRT(
          POWER(SIN(RADIANS(${lat2} - ${lat1}) / 2.0), 2) +
          COS(RADIANS(${lat1})) * COS(RADIANS(${lat2})) *
          POWER(SIN(RADIANS(${lon2} - ${lon1}) / 2.0), 2)
        )
      )
    ) AS distance_meters;
  `;

  const dist = Number(gcResult[0]?.distance_meters || 0);
  return {
    distanceMeters: Math.round(dist * 100) / 100,
    method: 'POSTGRES_GEODESIC',
  };
}

/**
 * Full Geofence validation function:
 * 1. Validates coordinate ranges
 * 2. Checks accuracy threshold
 * 3. Calculates geodesic distance in database
 * 4. Compares against allowed radius
 */
export async function evaluateGeofence(
  reportedLat: number,
  reportedLng: number,
  reportedAccuracy: number,
  targetLat: number,
  targetLng: number,
  allowedRadiusMeters: number,
  maxAccuracyThreshold: number
): Promise<{
  isValid: boolean;
  evaluation?: GeofenceEvaluation;
  error?: string;
  rejectionCode?: 'INVALID_COORDINATES' | 'ACCURACY_TOO_LOW' | 'OUTSIDE_GEOFENCE';
}> {
  if (!validateCoordinates(reportedLat, reportedLng)) {
    return {
      isValid: false,
      error: 'Invalid reported GPS coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.',
      rejectionCode: 'INVALID_COORDINATES',
    };
  }

  if (reportedAccuracy <= 0 || reportedAccuracy > maxAccuracyThreshold) {
    return {
      isValid: false,
      error: `GPS accuracy too low (${Math.round(reportedAccuracy)}m reported, max allowed is ${maxAccuracyThreshold}m). Please ensure high accuracy GPS is enabled.`,
      rejectionCode: 'ACCURACY_TOO_LOW',
    };
  }

  const { distanceMeters, method } = await calculateDatabaseDistance(
    reportedLat,
    reportedLng,
    targetLat,
    targetLng
  );

  const isWithinGeofence = distanceMeters <= allowedRadiusMeters;

  if (!isWithinGeofence) {
    return {
      isValid: false,
      error: `Location is outside authorized geofence. Distance from site is ${distanceMeters}m (Allowed radius: ${allowedRadiusMeters}m).`,
      rejectionCode: 'OUTSIDE_GEOFENCE',
      evaluation: {
        isWithinGeofence: false,
        distanceMeters,
        reportedAccuracy,
        allowedRadiusMeters,
        methodUsed: method,
      },
    };
  }

  return {
    isValid: true,
    evaluation: {
      isWithinGeofence: true,
      distanceMeters,
      reportedAccuracy,
      allowedRadiusMeters,
      methodUsed: method,
    },
  };
}
