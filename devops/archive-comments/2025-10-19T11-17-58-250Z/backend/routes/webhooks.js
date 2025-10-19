import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Example: simple endpoint for incoming webhooks (Stripe, GitHub, etc.)
// NOTE: You'll want to add proper signature verification for production.
router.post('/incoming', express.raw({ type: '*/*' }), (req, res) => {
  const signature = req.headers['x-signature'] || req.headers['stripe-signature'];
  // If you have a secret, verify signature here. Placeholder:
  // const secret = process.env.WEBHOOK_SECRET;
  // verify with crypto or vendor SDK

  try {
    // If body is raw, try parse JSON
    let payload = req.body;
    try { payload = JSON.parse(req.body.toString()); } catch (e) {}
    console.log('Received webhook', { signature, payload: payload && payload.type ? payload.type : 'raw' });
    // TODO: handle events and trigger internal actions (orders, subscribers, etc.)
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook handling error', err);
    res.status(400).json({ ok: false, error: 'invalid payload' });
  }
});

export default router;
