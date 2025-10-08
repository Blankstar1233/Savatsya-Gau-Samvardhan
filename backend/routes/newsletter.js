import express from 'express';
import Subscriber from '../models/Subscriber.js';
import { sendEmail, isEmailEnabled } from '../utils/mailer.js';

const router = express.Router();

// Subscribe endpoint
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const normalized = String(email).toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: normalized });
    if (existing) return res.json({ ok: true, message: 'Already subscribed' });
    await Subscriber.create({ email: normalized });
    // Send welcome email (non-blocking for subscription)
    const emailSent = await sendEmail({
      to: normalized,
      subject: 'Subscribed to Savatsya Gau Samvardhan',
      html: `<p>Namaste! Thank you for subscribing to Savatsya Gau Samvardhan.</p>
             <p>We will keep you updated on new products and special offers.</p>`
    });
    return res.status(201).json({ ok: true, emailSent, emailEnabled: isEmailEnabled() });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;


