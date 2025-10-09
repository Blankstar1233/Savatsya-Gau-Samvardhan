import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import User from '../models/User.js';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Get current user
router.get('/me', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    email: user.email,
    userId: user._id,
    avatar: user.avatar || null,
    name: user.name,
    phone: user.phone,
    address: user.address || [],
    preferences: user.preferences || {},
    uiConfig: user.uiConfig || {}
  });
});

// Update profile basic info
router.put('/profile', authenticateJWT, async (req, res) => {
  const { name, email, phone, avatar } = req.body;
  const updates = { };
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email.toLowerCase();
  if (avatar !== undefined) updates.avatar = avatar; // store Data URL or URL
  const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).lean();
  return res.json({ ok: true, user });
});

// Upload avatar (multipart/form-data) -> stores on Cloudinary and saves URL on user
router.post('/avatar', authenticateJWT, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // upload buffer to cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'avatars' }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      stream.end(req.file.buffer);
    });
    const url = result.secure_url || result.url;
    const user = await User.findByIdAndUpdate(req.user.userId, { avatar: url }, { new: true }).lean();
    return res.json({ ok: true, url, user });
  } catch (err) {
    console.error('Avatar upload failed', err?.message || err);
    return res.status(500).json({ error: 'Upload failed' });
  }
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

// Delete entire account
router.delete('/account', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    await User.findByIdAndDelete(userId);
    // Optionally: delete user's orders, etc.
    return res.json({ ok: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Account deletion failed', err?.message || err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;


