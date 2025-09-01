// backend/src/routes/checkout.js
import { Router } from 'express';
import Stripe from 'stripe';
import Product from '../models/Product.js';
import { auth } from '../middleware/auth.js';

const router = Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Prefer FRONTEND_URL (can be comma-separated; use the first as canonical)
const RAW_FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const FRONTEND_URL = RAW_FRONTEND_URL.split(',')[0].trim();
const SUCCESS_URL = `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
const CANCEL_URL  = `${FRONTEND_URL}/cancel`;

/**
 * POST /api/checkout/create-session
 * Body: { productId }
 * Auth: required
 */
router.post('/create-session', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'productId required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Stripe expects unit_amount in the smallest currency unit (cents)
    const unitAmount = Number(product.price); // your data appears to be cents already

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Stripe recommends omitting payment_method_types (defaults appropriately)
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

      // Helps reconciliation and pre-fills email if Stripe can
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

export default router;





