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
  'FRONTEND_URL'
]);

const app = express();

// --- CORS ---
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true,
}));

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

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ API running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Mongo connection error:', err);
    process.exit(1);
  });




  