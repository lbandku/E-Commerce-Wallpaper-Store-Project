// backend/src/models/Order.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: String,
    imageUrl: String,
    price: { type: Number, required: true }, // price snapshot in cents
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true }, // total in cents
    status: { type: String, enum: ['pending', 'completed', 'canceled'], default: 'completed' },
    // stripeSessionId: String, // to be used later with real Stripe webhooks
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);

