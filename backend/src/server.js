import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import documentRoutes from './routes/document.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import { generalLimiter } from './middleware/rateLimiter.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required to start the backend securely.');
}

const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);

// Dynamic CORS configuration for Vercel and local environments
const allowedOrigins = new Set([
  'https://prodil-studio.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : [])
]);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isVercelPreview = /^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)*\.vercel\.app$/i.test(origin);
    return callback(null, allowedOrigins.has(origin) || isVercelPreview);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Prodil Studio Backend API',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: db.getDbStatus(),
    smtpConfigured: !!process.env.SMTP_USER
  });
});

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    brand: 'Prodil Studio',
    tagline: 'Craft Your Career & Creative Identity in Minutes',
    architecture: {
      frontend: 'Vercel (React + Tailwind CSS)',
      backend: 'Hostinger VPS (Node.js + Express.js)',
      database: 'PostgreSQL + High-Speed Local Cache',
    },
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        verifyEmail: 'POST /api/auth/verify-email',
        resendCode: 'POST /api/auth/resend-code',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      profile: {
        get: 'GET /api/profile',
        update: 'PUT /api/profile'
      },
      documents: {
        cvList: 'GET /api/documents/cv',
        saveCv: 'POST /api/documents/cv',
        coverLetters: 'GET /api/documents/cover-letter',
        saveCoverLetter: 'POST /api/documents/cover-letter'
      },
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', workspaceRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
  });
});

const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 [Prodil Studio API] Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Ready to connect with Vercel Frontend`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server process terminated.');
  });
});
