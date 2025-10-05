import express from 'express';
import Order from '../models/Order.js';
import { supabaseAuthMiddleware } from '../middleware/supabaseAuth.js';

const router = express.Router();

// Get all orders for current user
router.get('/', supabaseAuthMiddleware, async (req, res) => {
  const userId = req.supabaseUser.sub;
  const orders = await Order.find({ userId });
  res.json(orders);
});

// Create a new order
router.post('/', supabaseAuthMiddleware, async (req, res) => {
  const userId = req.supabaseUser.sub;
  const { items, total } = req.body;
  const order = new Order({ userId, items, total });
  await order.save();
  res.status(201).json(order);
});

// (Optional) Admin: get all orders
router.get('/all', supabaseAuthMiddleware, async (req, res) => {
  if (!req.supabaseUser.email || req.supabaseUser.email !== 'admin@ves.ac.in') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const orders = await Order.find();
  res.json(orders);
});

export default router;
