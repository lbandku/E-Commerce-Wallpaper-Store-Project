// backend/src/models/Order.js
import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    price: { type: Number, required: true }, // stored in cents
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], default: [], required: true },
    total: { type: Number, required: true }, // cents
    status: {
      type: String,
      enum: ['pending', 'paid', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'paid', // or can be set as 'pending'
      required: true,
    },
    stripeSessionId: { type: String, index: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);

