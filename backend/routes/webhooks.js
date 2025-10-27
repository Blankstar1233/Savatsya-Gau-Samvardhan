import express from 'express';
import crypto from 'crypto';

const router = express.Router();

router.post('/incoming', express.raw({ type: '*/*' }), (req, res) => {
  const signature = req.headers['x-signature'] || req.headers['stripe-signature'];
 
 
 

  try {
   
    let payload = req.body;
    try { payload = JSON.parse(req.body.toString()); } catch (e) {}
    console.log('Received webhook', { signature, payload: payload && payload.type ? payload.type : 'raw' });
   
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook handling error', err);
    res.status(400).json({ ok: false, error: 'invalid payload' });
  }
});

export default router;
