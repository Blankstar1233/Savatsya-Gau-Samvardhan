import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get current user
router.get('/me', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    email: user.email,
    userId: user._id,
    name: user.name,
    phone: user.phone,
    address: user.address || [],
    preferences: user.preferences || {},
    uiConfig: user.uiConfig || {}
  });
});

// Update profile basic info
router.put('/profile', authenticateJWT, async (req, res) => {
  const { name, email, phone } = req.body;
  const updates = { };
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email.toLowerCase();
  const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).lean();
  return res.json({ ok: true, user });
});

// Update preferences
router.put('/preferences', authenticateJWT, async (req, res) => {
  const { preferences, uiConfig } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (preferences) user.preferences = { ...user.preferences, ...preferences };
  if (uiConfig) user.uiConfig = { ...user.uiConfig, ...uiConfig };
  await user.save();
  return res.json({ ok: true });
});

// Address CRUD
router.post('/addresses', authenticateJWT, async (req, res) => {
  const addr = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (addr.isDefault) {
    user.address.forEach(a => a.isDefault = false);
  }
  user.address.push(addr);
  await user.save();
  return res.status(201).json({ ok: true });
});

router.put('/addresses/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.address = user.address.map(a => a.id === id ? { ...a.toObject(), ...updates } : a);
  if (updates.isDefault) {
    user.address.forEach(a => { if (a.id !== id) a.isDefault = false; });
  }
  await user.save();
  return res.json({ ok: true });
});

router.delete('/addresses/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.address = user.address.filter(a => a.id !== id);
  await user.save();
  return res.json({ ok: true });
});

export default router;


