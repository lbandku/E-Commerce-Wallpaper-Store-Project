import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/orders
 * body: { productId }
 * NOTE: In real Stripe you’d confirm via webhook. For test/demo, we persist an
 * order immediately from the chosen product.
 */
router.post('/', auth, async (req, res) => {
  try {
    const { productId } = req.body || {};
    if (!productId) return res.status(400).json({ message: 'productId required' });

    const p = await Product.findById(productId);
    if (!p) return res.status(404).json({ message: 'Product not found' });

    const order = await Order.create({
      user: req.user.id,
      items: [{ product: p._id, title: p.title, imageUrl: p.imageUrl, price: p.price }],
      total: p.price,
      status: 'completed', // test flow; mark completed right away
    });

    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ message: 'Failed to create order' });
  }
});

/** GET /api/orders/my — current user’s orders */
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

/** GET /api/orders — admin: list all orders */
router.get('/', auth, requireAdmin, async (_req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'email name role');
  res.json(orders);
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

export default router;

