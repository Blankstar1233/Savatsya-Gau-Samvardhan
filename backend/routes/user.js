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
    profilePicture: user.profilePicture,
    address: user.address || [],
    preferences: user.preferences || {},
    uiConfig: user.uiConfig || {}
  });
});

// Update profile basic info
router.put('/profile', authenticateJWT, async (req, res) => {
  const { name, email, phone, avatar, profilePicture } = req.body;
  console.log(`Profile update request for user ${req.user.userId}:`, { name, email, phone, avatar: avatar ? 'provided' : 'not provided', profilePicture: profilePicture ? 'provided' : 'not provided' });
  
  const updates = { };
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email.toLowerCase();
  if (avatar !== undefined) updates.avatar = avatar; // store Data URL or URL from Cloudinary
  if (profilePicture !== undefined) updates.profilePicture = profilePicture; // support both fields
  
  console.log('Applying updates:', { ...updates, avatar: updates.avatar ? 'provided' : undefined, profilePicture: updates.profilePicture ? 'base64 data' : undefined });
  
  const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).lean();
  console.log('Updated user profile:', { name: user.name, email: user.email, phone: user.phone, avatar: user.avatar ? 'saved' : 'none', profilePicture: user.profilePicture ? 'saved' : 'none' });
  
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

// Change Password
router.put('/change-password', authenticateJWT, async (req, res) => {
  console.log('=== CHANGE PASSWORD REQUEST ===');
  console.log('User ID:', req.user?.userId);
  console.log('Request body keys:', Object.keys(req.body));
  
  try {
    const { currentPassword, newPassword } = req.body;
    console.log('Current password provided:', !!currentPassword);
    console.log('New password provided:', !!newPassword);
    console.log('New password length:', newPassword?.length);
    
    if (!currentPassword || !newPassword) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user.email);

    // Verify current password
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    console.log('Current password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid current password');
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('New password hashed successfully');
    
    // Update password
    user.password = hashedNewPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    console.log('Password updated successfully');

    return res.json({ 
      ok: true, 
      message: 'Password changed successfully',
      passwordChangedAt: user.passwordChangedAt 
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Enable/Disable Two-Factor Authentication
router.put('/two-factor', authenticateJWT, async (req, res) => {
  try {
    const { enable, method = 'email' } = req.body; // email, sms, or app
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (enable) {
      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      user.twoFactorAuth = {
        enabled: true,
        method,
        backupCodes: backupCodes.map(code => ({ code, used: false })),
        enabledAt: new Date()
      };

      await user.save();

      return res.json({
        ok: true,
        message: 'Two-factor authentication enabled',
        backupCodes,
        method
      });
    } else {
      user.twoFactorAuth = {
        enabled: false,
        method: null,
        backupCodes: [],
        disabledAt: new Date()
      };

      await user.save();

      return res.json({
        ok: true,
        message: 'Two-factor authentication disabled'
      });
    }
  } catch (error) {
    console.error('Two-factor auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Download user data (GDPR compliance)
router.get('/download-data', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get user's orders (if Order model exists)
    let orders = [];
    try {
      const Order = (await import('../models/Order.js')).default;
      orders = await Order.find({ userId: req.user.userId }).lean();
    } catch (e) {
      // Order model might not exist
    }

    // Prepare user data export
    const userData = {
      profile: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      addresses: user.address || [],
      preferences: user.preferences || {},
      uiConfig: user.uiConfig || {},
      orders: orders.map(order => ({
        id: order._id,
        items: order.items,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      })),
      exportedAt: new Date(),
      exportVersion: '1.0'
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="my-data-${user.email}-${new Date().toISOString().split('T')[0]}.json"`);
    
    return res.json(userData);
  } catch (error) {
    console.error('Download data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account (soft delete with grace period)
router.delete('/account', authenticateJWT, async (req, res) => {
  try {
    const { password, confirmation } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password confirmation is required' });
    }

    if (confirmation !== 'DELETE') {
      return res.status(400).json({ error: 'Please type DELETE to confirm account deletion' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Soft delete with 30-day grace period
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    user.deletionScheduled = {
      scheduledAt: new Date(),
      deletionDate,
      reason: 'user_request'
    };
    user.isActive = false;

    await user.save();

    return res.json({
      ok: true,
      message: 'Account deletion scheduled',
      deletionDate,
      gracePeriodDays: 30
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel account deletion (during grace period)
router.post('/cancel-deletion', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.deletionScheduled) {
      return res.status(400).json({ error: 'No account deletion scheduled' });
    }

    // Remove deletion schedule and reactivate account
    user.deletionScheduled = undefined;
    user.isActive = true;
    await user.save();

    return res.json({
      ok: true,
      message: 'Account deletion cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


