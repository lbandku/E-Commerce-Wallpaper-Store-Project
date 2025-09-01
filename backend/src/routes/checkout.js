// backend/src/routes/checkout.js
import { Router } from 'express';
import Stripe from 'stripe';
import Product from '../models/Product.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/checkout/create-session
 * Body: { productId }
 * Auth: required
 *
 * Redirects to Stripe Checkout. On payment completion, Stripe redirects back to:
 *   <CLIENT_URL>/success?session_id={CHECKOUT_SESSION_ID}
 * On cancel:
 *   <CLIENT_URL>/cancel
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

    // IMPORTANT: set CLIENT_URL in backend .env (e.g., http://localhost:5173)
    const successUrl = `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/cancel`;

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card'],
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.title,
          images: [product.imageUrl],
          metadata: {
            productId: product._id.toString(), // <-- for confirm step
          },
        },
        unit_amount: Number(product.price),
      },
      quantity: 1,
    },
  ],

  // Send the user back WITH the session id in the URL
  success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.CLIENT_URL}/cancel`,

  // So we can correlate on the server when confirming
  customer_email: req.user?.email || undefined,
  metadata: {
    productId: product._id.toString(),
    userId: req.user?.id || '', // <-- must be non-empty & match your JWT payload id
  },
});


    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('create-session error:', err);
    return res.status(500).json({ message: 'Stripe session failed' });
  }
});

export default router;


