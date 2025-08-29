import { Router } from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import Product from '../models/Product.js';
import { auth, requireAdmin } from '../middleware/auth.js';
import { configureCloudinary } from '../config/cloudinary.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = configureCloudinary();

// List (optional ?category=Nature)
router.get('/', async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const items = await Product.find(filter).sort({ createdAt: -1 });
  res.json(items);
});

// Get by id
router.get('/:id', async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
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

// Create (admin)
router.post('/', auth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, category, price, description } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image required' });

    const result = await uploadBuffer(req.file.buffer);

    const product = await Product.create({
      title,
      category,
      price: Number(price),
      description,
      imageUrl: result.secure_url,
      publicId: result.public_id
    });

    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete (admin)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  await cloudinary.uploader.destroy(product.publicId);
  await product.deleteOne();
  res.json({ message: 'Deleted' });
});

export default router;

