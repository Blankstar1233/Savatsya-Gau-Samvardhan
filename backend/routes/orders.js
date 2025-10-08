import express from 'express';
import Order from '../models/Order.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Get all orders for current user
router.get('/', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const orders = await Order.find({ userId });
  res.json(orders);
});

// Create a new order
router.post('/', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const { items, total } = req.body;
  const order = new Order({ userId, items, total });
  await order.save();
  res.status(201).json(order);
});

// (Optional) Admin: get all orders
router.get('/all', authenticateJWT, async (req, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  const orders = await Order.find();
  res.json(orders);
});

export default router;
