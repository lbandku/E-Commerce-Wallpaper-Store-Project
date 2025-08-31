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
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`API running on :${PORT}`));
}).catch(err => {
  console.error('Mongo connection error', err);
  process.exit(1);
});


