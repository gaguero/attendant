import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './lib/logger.js';
import { serverConfig } from './config/index.js';
import authRoutes from './routes/auth.js';
import supabaseAuthRoutes from './routes/supabaseAuth.js';
import userRoutes from './routes/users.js';
import profileRoutes from './routes/profile.js';
import guestRoutes from './routes/guests.js';
import vendorRoutes from './routes/vendors.js';

// Create Express application
const app: Express = express();

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Security middleware - should be first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: [
    serverConfig.frontendUrl,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://attendandt.vercel.app', // Future production frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log the request
  logger.http('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.http('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString(),
    });
  });

  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: serverConfig.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
app.get('/api/v1', (_req, res) => {
  res.json({
    message: 'Attendandt API v1',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes (Supabase Auth)
app.use('/api/v1/auth', supabaseAuthRoutes);

// Legacy authentication routes (custom auth - for migration)
app.use('/api/v1/auth-legacy', authRoutes);

// User management routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/guests', guestRoutes);
app.use('/api/v1/vendors', vendorRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Don't expose internal errors in production
  const isDevelopment = serverConfig.nodeEnv === 'development';
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack }),
  });
});

export default app; 