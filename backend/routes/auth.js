import express from 'express';
import User from '../models/User.js';
import { signToken, hashPassword, comparePassword, verifyToken } from '../utils/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
   
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    console.log('Checking for existing user with email:', email.toLowerCase());
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('User already exists');
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    console.log('Creating new user');
    const userData = { 
      email: email.toLowerCase(), 
      password,
      twoFactorAuth: {
        enabled: false,
        backupCodes: []
      }
    };
    const user = new User(userData);
    await user.save();
    console.log('User created successfully');
    return res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Registration error details:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.errors) {
      console.error('Validation errors:', err.errors);
      Object.keys(err.errors).forEach(key => {
        console.error(`Field ${key}:`, err.errors[key].message);
      });
    }
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt with body:', req.body);
    console.log('Request headers:', req.headers['content-type']);
    
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing credentials - email:', !!email, 'password:', !!password);
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    console.log('Looking for user:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found, checking password');
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful');
    const token = signToken({ userId: user._id, email: user.email, isAdmin: user.isAdmin || false });
    return res.json({ token, email: user.email, userId: user._id, isAdmin: user.isAdmin || false });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const existing = await User.findOne({ email: email.toLowerCase() });
    return res.json({ exists: !!existing, email: email.toLowerCase() });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

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
    console.log('=== /me endpoint called ===');
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
      const payload = verifyToken(token);
      const user = await User.findById(payload.userId).lean();
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ email: user.email, userId: user._id, address: user.address || [], preferences: {} });
    } catch (err) {
      console.error('Token verification failed', err?.message || err);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (err) {
    console.error('Token verification error:', err.name, err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
