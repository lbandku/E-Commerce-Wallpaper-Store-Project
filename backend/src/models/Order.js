import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  email: String,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  amount: Number,
  currency: { type: String, default: 'usd' },
  stripeSessionId: String,
  status: { type: String, enum: ['paid', 'failed'], default: 'paid' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

