import express from 'express';
import User from '../models/User.js';
import { signToken, hashPassword, comparePassword, verifyToken } from '../utils/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
    console.log('Checking for existing user with email:', email.toLowerCase());
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('User already exists');
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    console.log('Creating new user');
    const user = new User({ email: email.toLowerCase(), password });
    await user.save();
    console.log('User created successfully');
    return res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken({ userId: user._id, email: user.email, isAdmin: false });
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
  const payload = verifyToken(token);
  const user = await User.findById(payload.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ email: user.email, userId: user._id, address: user.address || [], preferences: {} });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
