import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, index: true },
  price: { type: Number, required: true }, // cents
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true } // Cloudinary public_id
}, { timestamps: true });

export default mongoose.model('Product', productSchema);

