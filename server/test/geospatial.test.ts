import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistance,
  validateCoordinates,
  evaluateGeofence,
} from '../src/lib/geospatial.js';

describe('Geospatial Geofencing Suite', () => {
  // Test site: TCS Siruseri IT Park, Chennai
  const siteLat = 12.8258;
  const siteLng = 80.2227;
  const allowedRadius = 150; // meters
  const maxAccuracy = 100; // meters

  describe('validateCoordinates', () => {
    it('should approve valid WGS84 coordinates', () => {
      expect(validateCoordinates(13.0827, 80.2707)).toBe(true);
      expect(validateCoordinates(0, 0)).toBe(true);
      expect(validateCoordinates(-34.6037, -58.3816)).toBe(true);
    });

    it('should reject invalid coordinate ranges', () => {
      expect(validateCoordinates(95.0, 80.0)).toBe(false);
      expect(validateCoordinates(-92.0, 80.0)).toBe(false);
      expect(validateCoordinates(13.0, 185.0)).toBe(false);
      expect(validateCoordinates(13.0, -190.0)).toBe(false);
      expect(validateCoordinates(NaN, 80.0)).toBe(false);
    });
  });

  describe('calculateHaversineDistance', () => {
    it('should return 0 meters for identical coordinates', () => {
      const dist = calculateHaversineDistance(siteLat, siteLng, siteLat, siteLng);
      expect(dist).toBe(0);
    });

    it('should accurately calculate small workplace distances', () => {
      // 0.0003 deg latitude is ~33.3 meters
      const offsetLat = siteLat + 0.0003;
      const dist = calculateHaversineDistance(siteLat, siteLng, offsetLat, siteLng);
      expect(dist).toBeGreaterThan(30);
      expect(dist).toBeLessThan(36);
    });

    it('should calculate inter-city distances correctly', () => {
      // Chennai to Coimbatore (~425 km)
      const chennaiLat = 13.0827;
      const chennaiLng = 80.2707;
      const coimbatoreLat = 11.0168;
      const coimbatoreLng = 76.9558;
      const distMeters = calculateHaversineDistance(chennaiLat, chennaiLng, coimbatoreLat, coimbatoreLng);
      const distKm = distMeters / 1000;
      expect(distKm).toBeGreaterThan(410);
      expect(distKm).toBeLessThan(440);
    });
  });

  describe('evaluateGeofence', () => {
    it('should approve student within permitted geofence with good GPS accuracy', async () => {
      // Inside: ~25 meters away from site
      const studentLat = siteLat + 0.0002;
      const studentLng = siteLng + 0.0001;
      const studentAccuracy = 15; // 15m GPS error

      const result = await evaluateGeofence(
        studentLat,
        studentLng,
        studentAccuracy,
        siteLat,
        siteLng,
        allowedRadius,
        maxAccuracy
      );

      expect(result.isValid).toBe(true);
      expect(result.evaluation?.isWithinGeofence).toBe(true);
      expect(result.evaluation?.distanceMeters).toBeLessThanOrEqual(allowedRadius);
    });

    it('should reject student location beyond allowed geofence radius', async () => {
      // Far outside: ~500 meters away
      const studentLat = siteLat + 0.0045;
      const studentLng = siteLng + 0.0045;
      const studentAccuracy = 10;

      const result = await evaluateGeofence(
        studentLat,
        studentLng,
        studentAccuracy,
        siteLat,
        siteLng,
        allowedRadius,
        maxAccuracy
      );

      expect(result.isValid).toBe(false);
      expect(result.rejectionCode).toBe('OUTSIDE_GEOFENCE');
      expect(result.evaluation?.distanceMeters).toBeGreaterThan(allowedRadius);
    });

    it('should reject when GPS accuracy is too low/inaccurate', async () => {
      // Within site coordinates, but reported accuracy is 120m (threshold is 100m)
      const studentAccuracy = 120;

      const result = await evaluateGeofence(
        siteLat,
        siteLng,
        studentAccuracy,
        siteLat,
        siteLng,
        allowedRadius,
        maxAccuracy
      );

      expect(result.isValid).toBe(false);
      expect(result.rejectionCode).toBe('ACCURACY_TOO_LOW');
    });

    it('should reject invalid coordinates gracefully', async () => {
      const result = await evaluateGeofence(
        105.0,
        siteLng,
        15,
        siteLat,
        siteLng,
        allowedRadius,
        maxAccuracy
      );

      expect(result.isValid).toBe(false);
      expect(result.rejectionCode).toBe('INVALID_COORDINATES');
    });
  });
});
