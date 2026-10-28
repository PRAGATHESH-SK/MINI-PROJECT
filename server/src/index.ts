import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config } from './config/index.js';
import { prisma } from './lib/prisma.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import internshipRoutes from './routes/internship.routes.js';
import applicationRoutes from './routes/application.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Leaflet tiles & OpenStreetMap in local development
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const extraOrigins = config.corsOrigin ? config.corsOrigin.split(',').map((s) => s.trim()) : [];
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', ...extraOrigins];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Cookie and Body parsers
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use(generalLimiter);

// Stricter Rate Limiter for Authentication and Attendance
const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Rate limit reached for security sensitive operations. Please wait 5 minutes.' },
});

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1;`;
    res.json({
      status: 'healthy',
      service: 'Connecting Tech API',
      timestamp: new Date().toISOString(),
      database: 'connected',
      demoMode: config.demoMode,
      maxGpsAccuracy: `${config.maxGpsAccuracyMeters}m`,
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
    });
  }
});

// Mount API routes
app.use('/api/auth', strictLimiter, authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/attendance', strictLimiter, attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend static build if present (enables single-service full-stack deployment)
const possibleDistPaths = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../../client/dist') : '',
].filter(Boolean);

const clientDistPath = possibleDistPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handling
app.use(errorHandler);

// Server listen
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Connecting Tech Backend Running on Port ${config.port}`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`🗺️  GPS Accuracy Threshold: ${config.maxGpsAccuracyMeters} meters`);
    console.log(`🌐 CORS Allowed Origin: ${config.corsOrigin}`);
    console.log(`=======================================================`);
  });
}

export default app;
