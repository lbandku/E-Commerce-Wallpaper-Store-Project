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
import adminUsersRoutes from './routes/adminUsers.js';

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

/**
 * HOTFIX: permissive CORS (reflects any origin) + no-store caching
 * This unblocks frontend requests while debug.
 * Later revert to the stricter CORS_ORIGIN allowlist.
 */
const corsHotfix = cors({
  origin: (origin, cb) => cb(null, true), // reflect request origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
app.use(corsHotfix);
app.options('*', corsHotfix);

// Disable caching / etag to avoid 304s
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

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
app.use('/api/orders',
