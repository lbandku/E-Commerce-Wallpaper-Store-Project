// backend/src/routes/products.js
import { Router } from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { auth, requireAdmin } from '../middleware/auth.js';
import { configureCloudinary } from '../config/cloudinary.js';

const router = Router();
const cloudinary = configureCloudinary();

// --- Multer: in-memory, 10MB limit, images only ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(png|jpeg|jpg|webp|gif|svg\+xml)/i.test(file.mimetype);
    if (!ok) return cb(new Error('Only image uploads are allowed'));
    cb(null, true);
  },
});

// Helper: upload buffer to Cloudinary as a Promise
const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'wallpapers', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// --- GET /api/products  (optional ?category=Nature) ---
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await Product.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list products' });
  }
});

// --- GET /api/products/search ---
router.get('/search', async (req, res) => {
  try {
    const {
      q = '',
      category = '',
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    const filter = {};
    if (category) filter.category = category;
    if (q) {
      // escape regex specials in q
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { description: rx }];
    }

    const sortMap = {
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      newest: { createdAt: -1 },
    };
    const sortSpec = sortMap[sort] || sortMap.newest;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortSpec)
        .skip((pageNum - 1) * perPage)
        .limit(perPage),
      Product.countDocuments(filter),
    ]);

    const pages = Math.max(Math.ceil(total / perPage), 1);
    res.json({ items, total, page: pageNum, pages });
  } catch (e) {
    res.status(500).json({ message: 'Search failed' });
  }
});

// --- GET /api/products/:id ---
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const item = await Product.findById(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// --- POST /api/products  (admin) ---
// multipart/form-data with field: image
router.post('/', auth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, category, price, description } = req.body;
    if (!title || !category || !price) {
      return res.status(400).json({ message: 'title, category, price are required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Image required' });
    }

    const result = await uploadBuffer(req.file.buffer);

    const product = await Product.create({
      title,
      category,
      price: Number(price), // assumes cents already
      description: description ?? '',
      imageUrl: result?.secure_url || '',
      publicId: result?.public_id || '',
    });

    res.status(201).json(product);
  } catch (e) {
    // Multer fileFilter/fileSize errors bubble as Error
    const msg = e?.message || 'Create failed';
    res.status(400).json({ message: msg });
  }
});

// --- DELETE /api/products/:id  (admin) ---
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Not found' });

    // Best-effort Cloudinary delete; don't fail the whole op if missing
    try {
      if (product.publicId) {
        await cloudinary.uploader.destroy(product.publicId);
      }
    } catch {
      // ignore cloudinary errors here
    }

    await product.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

export default router;


