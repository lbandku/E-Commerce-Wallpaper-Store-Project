import { Router } from 'express';
import Stripe from 'stripe';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session (test mode)
router.post('/create-session', async (req, res) => {
  console.log('DEBUG checkout body:', req.body);           // <- show what arrived

  try {
    const { productId } = req.body;
        console.log('DEBUG productId:', productId);            // <- show extracted value

    const product = await Product.findById(productId);
        console.log('DEBUG product:', !!product);              // <- true/false

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: product.title, images: [product.imageUrl] },
            unit_amount: product.price
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL}/success?productId=${product._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// (Optional MVP+) Record order after redirect using session_id
router.get('/record', async (req, res) => {
  try {
    const { session_id, productId } = req.query;
    if (!session_id) return res.status(400).json({ message: 'session_id required' });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') return res.status(400).json({ message: 'Not paid' });

    const exists = await Order.findOne({ stripeSessionId: session_id });
    if (!exists) {
      await Order.create({
        email: session.customer_details?.email,
        product: productId,
        amount: session.amount_total,
        currency: session.currency,
        stripeSessionId: session.id,
        status: 'paid'
      });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

