import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'connecting_tech_secure_jwt_secret_key_2026_super_safe',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  maxGeofenceRadiusMeters: parseFloat(process.env.MAX_GEOFENCE_RADIUS_METERS || '1000'),
  minGeofenceRadiusMeters: 50,
  defaultGeofenceRadiusMeters: 150,
  maxGpsAccuracyMeters: parseFloat(process.env.MAX_GPS_ACCURACY_METERS || '100'), // Reject GPS fixes with accuracy > 100m
  demoMode: process.env.DEMO_MODE !== 'false',
};
