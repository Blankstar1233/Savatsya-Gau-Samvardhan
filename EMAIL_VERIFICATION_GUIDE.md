# Email Verification Implementation Guide

## Overview
Add email verification to ensure users confirm their email addresses before accessing the application.

---

## Step 1: Update User Model

Add email verification fields to `backend/models/User.js`:

```javascript
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  // ... existing fields
});
```

---

## Step 2: Update Registration Route

In `backend/routes/auth.js`, modify the register endpoint:

```javascript
import crypto from 'crypto';

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ... existing validation ...
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const user = new User({
      email: email.toLowerCase(),
      password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      isEmailVerified: false
    });
    
    await user.save();
    
    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(email, verificationUrl);
    
    return res.status(201).json({ 
      message: 'Registration successful. Please check your email to verify your account.',
      requiresVerification: true
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
```

---

## Step 3: Add Email Verification Route

Add to `backend/routes/auth.js`:

```javascript
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    return res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
```

---

## Step 4: Update Login Route

Modify `backend/routes/auth.js` login to check verification:

```javascript
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in',
        requiresVerification: true
      });
    }
    
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = signToken({ userId: user._id, email: user.email, isAdmin: user.isAdmin || false });
    return res.json({ token, email: user.email, userId: user._id, isAdmin: user.isAdmin || false });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
```

---

## Step 5: Add Resend Verification Email Route

```javascript
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }
    
    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(user.email, verificationUrl);
    
    return res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
```

---

## Step 6: Create Email Utility

Create `backend/utils/emailVerification.js`:

```javascript
import { sendMail } from './mailer.js';

export async function sendVerificationEmail(email, verificationUrl) {
  const subject = 'Verify Your Email - Savatsya Gau Samvardhan';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 15px 30px; background: #8B4513; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🐄 Welcome to Savatsya Gau Samvardhan!</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering! Please click the button below to verify your email address and activate your account.</p>
          
          <a href="${verificationUrl}" class="button">Verify Email</a>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #8B4513;">${verificationUrl}</p>
          
          <p><strong>This link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 Savatsya Gau Samvardhan. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Welcome to Savatsya Gau Samvardhan!
    
    Please verify your email by clicking this link:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create an account, please ignore this email.
  `;
  
  await sendMail({
    to: email,
    subject,
    text,
    html
  });
}
```

---

## Step 7: Frontend - Add Verification Page

Create `frontend/src/pages/VerifyEmail.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '@/config/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.AUTH.ME.replace('/me', '')}/verify-email/${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="section-container min-h-[80vh] flex items-center justify-center bg-sawatsya-cream dark:bg-gray-900">
      <div className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-sawatsya-earth" />
              <h1 className="text-2xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-2">
                Verifying Your Email...
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Redirecting to login...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <Link to="/login">
                <Button className="btn-primary">Go to Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
```

---

## Step 8: Update Frontend Login.tsx

Add verification message handling:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (isLogin) {
      await login(normalizedEmail, normalizedPassword);
      toast.success('Successfully logged in!');
      navigate(fromPath, { replace: true });
    } else {
      const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      if (data.requiresVerification) {
        toast.success('Account created! Please check your email to verify your account.');
        // Show verification message UI
      } else {
        await login(normalizedEmail, normalizedPassword);
        toast.success('Account created! You are now logged in.');
      }
      navigate('/', { replace: true });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    
    if (errorMessage.includes('verify your email')) {
      toast.error(errorMessage);
      // Show "Resend verification email" button
    } else {
      toast.error(errorMessage);
    }
    
    navigate('/login', { replace: true });
  }
};
```

---

## Step 9: Add Route to App.tsx

```tsx
import VerifyEmail from "./pages/VerifyEmail";

// Add to routes:
<Route path="/verify-email/:token" element={<VerifyEmail />} />
```

---

## Step 10: Environment Variables

Add to `backend/.env`:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
FRONTEND_URL=http://localhost:5173
```

Add to production (Render):
```env
FRONTEND_URL=https://savatsya-gau-samvardhan.vercel.app
```

---

## Testing Checklist

- [ ] Register new user → Receive verification email
- [ ] Click verification link → Email verified
- [ ] Try to login without verifying → Show error
- [ ] After verification → Can login successfully
- [ ] Test expired token → Show error
- [ ] Test resend verification email
- [ ] Test dark mode on verification page

---

## Email Service Options

### Option 1: SendGrid (Recommended)
- Free tier: 100 emails/day
- Signup: https://sendgrid.com
- Easy integration with existing mailer.js

### Option 2: Gmail SMTP
- Use existing Gmail account
- Less reliable for production
- May hit rate limits

### Option 3: Amazon SES
- Very affordable
- Requires AWS account
- Good for high volume

---

**Estimated Implementation Time:** 2-3 hours

**Priority:** Medium (Good for production, but not blocking for initial launch)
