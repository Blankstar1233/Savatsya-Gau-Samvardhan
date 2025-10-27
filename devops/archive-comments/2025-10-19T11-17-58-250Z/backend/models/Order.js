import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Supabase UID
  items: [{
    productId: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
