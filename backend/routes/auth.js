import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const user = new User({ email: email.toLowerCase(), password });
    await user.save();
    return res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, email: user.email, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, email: user.email, userId: user._id, isAdmin: false });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ email: user.email, userId: user._id, address: user.address || [], preferences: {} });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
