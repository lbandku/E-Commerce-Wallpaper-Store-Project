// backend/src/routes/checkout.js
import { Router } from 'express';
import Stripe from 'stripe';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { auth } from '../middleware/auth.js';
import { configureCloudinary } from '../config/cloudinary.js';

const router = Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const cloudinary = configureCloudinary();

// Prefer FRONTEND_URL (can be comma-separated; use the first as canonical)
const RAW_FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const FRONTEND_URL = RAW_FRONTEND_URL.split(',')[0].trim();
const SUCCESS_URL = `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
const CANCEL_URL  = `${FRONTEND_URL}/cancel`;

/**
 * POST /api/checkout/create-session
 * Body: { productId }
 * Auth: required
 * -> Single product “Buy Now” checkout
 */
router.post('/create-session', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const unitAmount = Number(product.price);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title || 'Wallpaper',
              images: product.imageUrl ? [product.imageUrl] : [],
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      customer_email: req.user?.email || undefined,
      metadata: {
        productId: product._id?.toString?.() || String(productId),
        userId: req.user?.id || req.user?._id || '',
      },
    });

    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('create-session error:', err);
    return res.status(500).json({ message: 'Stripe session failed' });
  }
});

/**
 * POST /api/checkout/create-cart-session
 * Body: { items: [{ productId, qty }] }
 * Auth: required
 * -> Multi-item checkout for the Cart
 */
router.post('/create-cart-session', auth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items required' });
    }

    const lineItems = [];
    for (const it of items) {
      const qty = Math.max(parseInt(it.qty || 1, 10), 1);
      const p = await Product.findById(it.productId);
      if (!p) return res.status(404).json({ message: `Product not found: ${it.productId}` });

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: p.title || 'Wallpaper',
            images: p.imageUrl ? [p.imageUrl] : [],
          },
          unit_amount: Number(p.price),
        },
        quantity: qty,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      customer_email: req.user?.email || undefined,
      metadata: {
        userId: req.user?.id || req.user?._id || '',
      },
    });

    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('create-cart-session error', err);
    return res.status(500).json({ message: 'Stripe cart session failed' });
  }
});

/**
 * POST /api/checkout/confirm
 * Body: { sessionId }
 * Auth: required
 *
 * Verifies the Stripe session and records an order.
 */
router.post('/confirm', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'],
    });

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Idempotency
    const existing = await Order.findOne({ stripeSessionId: session.id });
    if (existing) return res.json({ ok: true, order: existing });

    const userId = session.metadata?.userId || req.user?.id;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const email = session.customer_details?.email || req.user?.email || '';
    const lineItems = session.line_items?.data || [];
    const items = lineItems.map((li) => ({
      product: li.price?.product?._id || undefined,
      title: li.description || li.price?.product?.name || 'Wallpaper',
      imageUrl: (li.price?.product?.images?.[0]) || '',
      price: li.amount_subtotal ?? li.amount_total ?? 0,
    }));

    const total = session.amount_total ?? items.reduce((s, it) => s + (Number(it.price) || 0), 0);

    const order = await Order.create({
      user: userId,
      items,
      total,
      status: 'paid',
      stripeSessionId: session.id,
      email,
    });

    return res.json({ ok: true, order });
  } catch (err) {
    console.error('checkout/confirm error', err);
    return res.status(500).json({ message: `Order confirmation failed: ${err?.message || 'unknown'}` });
  }
});

export default router;


