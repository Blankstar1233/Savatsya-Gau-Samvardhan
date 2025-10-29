import express from 'express';
import Subscriber from '../models/Subscriber.js';
import { sendEmail, isEmailEnabled } from '../utils/mailer.js';
import { sendNewsletterSubscriptionEmail } from '../utils/emailTemplates.js';

const router = express.Router();


router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email input
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const normalized = String(email).toLowerCase().trim();
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    console.log(`[newsletter] Subscription attempt for: ${normalized}`);
    
    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: normalized });
    if (existing) {
      console.log(`[newsletter] Email already subscribed: ${normalized}`);
      return res.json({ 
        ok: true, 
        message: 'Already subscribed',
        emailEnabled: isEmailEnabled()
      });
    }
    
    // Create new subscription
    await Subscriber.create({ email: normalized });
    console.log(`[newsletter] New subscription created for: ${normalized}`);
    
    // Check if email is enabled before attempting to send
    if (!isEmailEnabled()) {
      console.warn('[newsletter] Email not enabled, skipping welcome email');
      return res.status(201).json({
        ok: true,
        message: 'Subscribed successfully',
        emailEnabled: false,
        email: { sent: false, error: 'Email service not configured' }
      });
    }
    
    // Send newsletter subscription confirmation email
    console.log(`[newsletter] Sending subscription confirmation email to: ${normalized}`);
    const emailResult = await sendNewsletterSubscriptionEmail(normalized, 'Valued Subscriber');
    
    // Log email result
    if (emailResult && emailResult.ok) {
      console.log(`[newsletter] Welcome email sent successfully to: ${normalized}, messageId: ${emailResult.messageId}`);
    } else {
      console.error(`[newsletter] Welcome email failed for: ${normalized}, error: ${emailResult?.error || 'Unknown error'}`);
    }
    
    // Prepare response
    const response = { 
      ok: true, 
      message: 'Subscribed successfully',
      emailEnabled: isEmailEnabled() 
    };
    
    if (emailResult) {
      response.email = { 
        sent: Boolean(emailResult.ok), 
        details: emailResult 
      };
    }
    
    return res.status(201).json(response);
    
  } catch (err) {
    console.error('[newsletter] Subscription error:', err);
    return res.status(500).json({ 
      error: 'Server error', 
      details: err.message 
    });
  }
});

// Test endpoint for email functionality (development only)
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Test email address required' });
    }
    
    console.log(`[newsletter] Testing email functionality with: ${email}`);
    
    if (!isEmailEnabled()) {
      return res.status(400).json({ 
        error: 'Email service not enabled',
        emailEnabled: false,
        debug: {
          sendGridConfigured: !!process.env.SENDGRID_API_KEY,
          fromEmail: process.env.FROM_EMAIL,
          keyLength: process.env.SENDGRID_API_KEY?.length || 0,
          keyFormat: process.env.SENDGRID_API_KEY?.startsWith('SG.') || false
        }
      });
    }
    
    const testResult = await sendEmail({
      to: email,
      subject: 'Test Email from Savatsya Gau Samvardhan',
      html: `
        <h2>✅ Email Test Successful!</h2>
        <p>This is a test email from your Savatsya Gau Samvardhan backend.</p>
        <p>If you received this, your email configuration is working correctly.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `,
      text: 'Email test successful! Your email configuration is working.'
    });
    
    res.json({
      success: true,
      emailEnabled: true,
      testResult,
      message: testResult.ok ? 'Test email sent successfully' : 'Test email failed'
    });
    
  } catch (error) {
    console.error('[newsletter] Test email error:', error);
    res.status(500).json({ 
      error: 'Test failed', 
      details: error.message 
    });
  }
});

export default router;


