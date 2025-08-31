// backend/src/routes/orders.js
import { Router } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/orders/confirm
 * Body: { session_id }
 * Auth: required
 *
 * Retrieves the Stripe Checkout session, verifies payment is complete,
 * verifies the session belongs to the current user, and 
 * creates a paid Order.
 */
router.post('/confirm', auth, async (req, res) => {
  try {
    const { session_id } = req.body;
    const currentUserIdStr = String(req.user?.id || req.user?._id || '');

    if (!session_id) return res.status(400).json({ message: 'session_id required' });
    if (!currentUserIdStr) return res.status(401).json({ message: 'Not authenticated' });

    console.log('[CONFIRM] start', { session_id, currentUserIdStr });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items.data.price.product'],
    });

    console.log('[CONFIRM] session.status', {
      payment_status: session?.payment_status,
      amount_total: session?.amount_total,
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Idempotency
    const existing = await Order.findOne({ stripeSessionId: session.id });
    if (existing) {
      console.log('[CONFIRM] existing order found, returning it');
      return res.json(existing);
    }

    const metaUserIdStr = String(session.metadata?.userId || '');
    const metaProductIdStr = String(session.metadata?.productId || '');

    console.log('[CONFIRM] metadata', { metaUserIdStr, metaProductIdStr });

    // Ensure the session belongs to the current user
    if (!metaUserIdStr || metaUserIdStr !== currentUserIdStr) {
      console.log('[CONFIRM] user mismatch', { metaUserIdStr, currentUserIdStr });
      return res.status(403).json({ message: 'Session does not belong to current user' });
    }

    // Build order items — prefer DB product from metadata
    let items = [];
    let total = session.amount_total ?? 0;

    if (metaProductIdStr) {
      try {
        const p = await Product.findById(metaProductIdStr);
        if (p) {
          items = [{
            product: p._id,
            title: p.title,
            imageUrl: p.imageUrl,
            price: Number(p.price) || 0,
          }];
          if (!total) total = Number(p.price) || 0;
        }
      } catch (e) {
        console.log('[CONFIRM] product lookup failed (fallback to line items):', e?.message);
      }
    }

    // Fallback to Stripe line items if needed
    if (!items.length) {
      const li = (session.line_items?.data || [])[0];
      items = [{
        product: undefined,
        title: (li?.description) || (li?.price?.product?.name) || 'Wallpaper',
        imageUrl: (li?.price?.product?.images?.[0]) || '',
        price: (li?.amount_subtotal ?? li?.amount_total ?? 0),
      }];
      if (!total) {
        total = session.amount_total ??
                items.reduce((s, it) => s + (Number(it.price) || 0), 0);
      }
    }

    const order = await Order.create({
      user: currentUserIdStr,              // ensure string/ObjectId acceptable by your schema
      items,
      total,
      status: 'paid',
      stripeSessionId: session.id,
    });

    console.log('[CONFIRM] order created', { orderId: order._id.toString() });

    return res.status(201).json(order);
  } catch (err) {
    console.error('[CONFIRM] error', err?.message, err);
    return res.status(500).json({ message: `Order confirm failed: ${err?.message || 'unknown'}` });
  }
});


/** GET /api/orders/my — current user’s orders */
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch {
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders — admin: list orders
 */
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const status = (req.query.status || 'paid').toLowerCase();
    const filter = status === 'all' ? {} : { status: 'paid' };

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'email name role');

    return res.json(orders);
  } catch {
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

export default router;


