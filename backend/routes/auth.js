import express from 'express';
import User from '../models/User.js';
import { signToken, hashPassword, comparePassword, verifyToken } from '../utils/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    console.log('Checking for existing user with email:', email.toLowerCase());
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
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('User found, checking password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
  console.log('Login successful');
  // Use centralized signToken helper which validates JWT_SECRET
  const token = signToken({ userId: user._id, email: user.email, isAdmin: false });
  return res.json({ token, email: user.email, userId: user._id, isAdmin: false });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Check if email exists (for testing)
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const existing = await User.findOne({ email: email.toLowerCase() });
    return res.json({ exists: !!existing, email: email.toLowerCase() });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (for testing only)
router.delete('/delete-test-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await User.deleteOne({ email: email.toLowerCase() });
    return res.json({ 
      deleted: result.deletedCount > 0,
      email: email.toLowerCase(),
      count: result.deletedCount
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    
    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
  console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
  const payload = verifyToken(token);
  console.log('Token verified successfully. User ID:', payload.userId);
    
    const user = await User.findById(payload.userId).lean();
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User found:', user.email);
    return res.json({ email: user.email, userId: user._id, address: user.address || [], preferences: {} });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
