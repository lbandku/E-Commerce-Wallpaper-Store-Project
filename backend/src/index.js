// backend/src/index.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import { required } from './utils/validateEnv.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import checkoutRoutes from './routes/checkout.js';
import ordersRoutes from './routes/orders.js';
import usersRoutes from './routes/users.js';

// --- Validate required envs ---
required([
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'STRIPE_SECRET_KEY',
  'FRONTEND_URL',
]);

const app = express();

// --- CORS (safe allowlist, no throws on preflight) ---
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

/**
 * Use a non-throwing origin function:
 * - Allows requests with no Origin (health checks, server-to-server)
 * - Allows if Origin is in the allowlist
 * - Otherwise returns false (no CORS headers), but does not 500
 */
const corsHandler = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false); // not allowed, but don't error
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Must be before routes
app.use(corsHandler);
// Ensure OPTIONS preflights are handled
app.options('*', corsHandler);

// --- Middleware ---
app.use(morgan('dev'));
app.use(express.json());

// --- Health check ---
app.get('/health', (_req, res) => res.status(200).send('ok'));

// --- Routes ---
app.get('/', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);

// --- Start server ---
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ API running on port ${PORT}`);
      console.log('✅ CORS allowed origins:', allowedOrigins.join(', ') || '(none configured)');
    });
  })
  .catch(err => {
    console.error('❌ Mongo connection error:', err);
    process.exit(1);
  });


  