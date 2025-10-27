import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { authenticateJWT } from '../middleware/auth.js';
import { sendEmail, isEmailEnabled } from '../utils/mailer.js';

const router = express.Router();

router.get('/', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const orders = await Order.find({ userId });
  res.json(orders);
});

router.post('/', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const { items, total } = req.body;
  const order = new Order({ userId, items, total });
  await order.save();
 
  try {
    const broadcast = req.app?.locals?.broadcast;
    if (typeof broadcast === 'function') {
      broadcast({ type: 'order.created', data: order });
    }
  } catch (e) {
   
    console.warn('Failed to broadcast order.created', e?.message || e);
  }

 
  try {
    const user = await User.findById(userId).lean();
    const emailEnabled = isEmailEnabled();
    if (user && user.email && emailEnabled) {
     
      const itemsHtml = (order.items || []).map(i => `
        <li>Product: ${i.productId} — Qty: ${i.quantity} — Price: ${i.price}</li>`).join('');
      const html = `
        <p>Namaste ${user.name || ''},</p>
        <p>Thank you for your order. Your order id is <strong>${order._id}</strong>.</p>
        <p>Order total: <strong>${order.total}</strong></p>
        <ul>${itemsHtml}</ul>
        <p>We will notify you once your order is dispatched.</p>
      `;

     
      sendEmail({ to: user.email, subject: 'Order confirmation — Savatsya Gau Samvardhan', html })
        .then(sent => console.info('[mailer] order confirmation sent:', !!sent))
        .catch(err => console.warn('[mailer] order confirmation failed:', err?.message || err));
    }
  } catch (e) {
    console.warn('Failed to send order confirmation email', e?.message || e);
  }

 
  res.status(201).json({ order, emailEnabled: isEmailEnabled() });
});

router.get('/all', authenticateJWT, async (req, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  const orders = await Order.find();
  res.json(orders);
});

export default router;
