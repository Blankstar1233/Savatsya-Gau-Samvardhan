import express from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { sendEmail, isEmailEnabled } from '../utils/mailer.js';
import InboundEmail from '../models/InboundEmail.js';

const router = express.Router();

// Configure multer for handling multipart/form-data from SendGrid inbound parse
const upload = multer();

// SendGrid Inbound Parse Webhook
router.post('/sendgrid/inbound', upload.none(), async (req, res) => {
  try {
    console.log('[webhook] Received inbound email from SendGrid');
    
    // Extract email data from SendGrid inbound parse
    const emailData = {
      to: req.body.to,
      from: req.body.from,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
      cc: req.body.cc,
      attachments: req.body.attachments || 0,
      spf: req.body.SPF,
      envelope: JSON.stringify({
        to: req.body.envelope ? JSON.parse(req.body.envelope).to : [],
        from: req.body.envelope ? JSON.parse(req.body.envelope).from : req.body.from
      })
    };

    console.log(`[webhook] Email from: ${emailData.from}, to: ${emailData.to}, subject: ${emailData.subject}`);

    // Save to database
    const inboundEmail = new InboundEmail({
      ...emailData,
      receivedAt: new Date(),
      processed: false
    });
    await inboundEmail.save();

    // Process different types of emails
    await processInboundEmail(emailData);

    res.status(200).json({ 
      ok: true, 
      message: 'Email processed successfully',
      emailId: inboundEmail._id 
    });
  } catch (error) {
    console.error('[webhook] Inbound email processing error:', error);
    res.status(500).json({ ok: false, error: 'Processing failed' });
  }
});

// Process inbound email based on type and content
async function processInboundEmail(emailData) {
  const { from, to, subject, text, html } = emailData;
  const emailBody = text || html || '';
  
  try {
    // Support email auto-reply
    if (to.includes('support@') || to.includes('help@')) {
      await handleSupportEmail(from, subject, emailBody);
    }
    
    // Newsletter unsubscribe requests
    if (emailBody.toLowerCase().includes('unsubscribe') && 
        (subject.toLowerCase().includes('unsubscribe') || emailBody.toLowerCase().includes('stop'))) {
      await handleUnsubscribeRequest(from);
    }
    
    // Order inquiries (contains order ID patterns)
    const orderIdMatch = emailBody.match(/order[:\s#]*([a-f0-9]{24})/i);
    if (orderIdMatch) {
      await handleOrderInquiry(from, orderIdMatch[1], emailBody);
    }
    
    // General contact form submissions
    if (to.includes('contact@') || to.includes('info@')) {
      await handleContactEmail(from, subject, emailBody);
    }

  } catch (processError) {
    console.error('[webhook] Email processing error:', processError);
  }
}

// Handle support email with auto-reply
async function handleSupportEmail(fromEmail, subject, body) {
  if (!isEmailEnabled()) return;
  
  const autoReply = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Thank you for contacting Savatsya Gau Samvardhan Support</h2>
      <p>Dear Customer,</p>
      <p>We have received your support request and will respond within 24 hours during business days.</p>
      
      <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <strong>Your Message:</strong><br>
        ${body.substring(0, 500)}${body.length > 500 ? '...' : ''}
      </div>
      
      <p>For urgent matters, please call us at +91-XXXXXXXXXX</p>
      <p>Thank you for choosing Savatsya Gau Samvardhan!</p>
      
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        This is an automated response. Please do not reply to this email.
      </p>
    </div>
  `;

  await sendEmail({
    to: fromEmail,
    subject: `Re: ${subject} - Support Request Received`,
    html: autoReply
  });

  console.log(`[email] Support auto-reply sent to: ${fromEmail}`);
}

// Handle newsletter unsubscribe requests
async function handleUnsubscribeRequest(fromEmail) {
  try {
    // Import Subscriber model dynamically to avoid circular imports
    const { default: Subscriber } = await import('../models/Subscriber.js');
    
    await Subscriber.findOneAndDelete({ email: fromEmail.toLowerCase() });
    
    if (isEmailEnabled()) {
      await sendEmail({
        to: fromEmail,
        subject: 'Unsubscribed from Savatsya Gau Samvardhan Newsletter',
        html: `
          <p>You have been successfully unsubscribed from our newsletter.</p>
          <p>We're sorry to see you go. If this was a mistake, you can resubscribe on our website.</p>
        `
      });
    }
    
    console.log(`[email] Unsubscribed: ${fromEmail}`);
  } catch (error) {
    console.error('[email] Unsubscribe error:', error);
  }
}

// Handle order-related inquiries
async function handleOrderInquiry(fromEmail, orderId, body) {
  try {
    // Import Order model dynamically
    const { default: Order } = await import('../models/Order.js');
    
    const order = await Order.findById(orderId);
    
    if (isEmailEnabled()) {
      if (order) {
        await sendEmail({
          to: fromEmail,
          subject: `Order Status - ${orderId}`,
          html: `
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Status:</strong> ${order.status || 'Processing'}</p>
            <p><strong>Total:</strong> ₹${order.total}</p>
            <p><strong>Items:</strong> ${order.items?.length || 0} item(s)</p>
            
            <p>Our support team will contact you shortly for further assistance.</p>
          `
        });
      } else {
        await sendEmail({
          to: fromEmail,
          subject: `Order Inquiry - ${orderId}`,
          html: `
            <p>Thank you for your inquiry about order ${orderId}.</p>
            <p>We could not find this order in our system. Please verify the order ID or contact our support team.</p>
          `
        });
      }
    }
    
    console.log(`[email] Order inquiry response sent for: ${orderId}`);
  } catch (error) {
    console.error('[email] Order inquiry error:', error);
  }
}

// Handle general contact emails
async function handleContactEmail(fromEmail, subject, body) {
  if (!isEmailEnabled()) return;
  
  await sendEmail({
    to: fromEmail,
    subject: `Thank you for contacting us - ${subject}`,
    html: `
      <h3>Thank you for reaching out!</h3>
      <p>We have received your message and will get back to you within 2 business days.</p>
      
      <div style="background: #f9f9f9; padding: 10px; margin: 15px 0;">
        <strong>Your message:</strong><br>
        ${body.substring(0, 300)}${body.length > 300 ? '...' : ''}
      </div>
      
      <p>Best regards,<br>Savatsya Gau Samvardhan Team</p>
    `
  });
  
  console.log(`[email] Contact auto-reply sent to: ${fromEmail}`);
}

// Generic webhook handler (for other services)
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
