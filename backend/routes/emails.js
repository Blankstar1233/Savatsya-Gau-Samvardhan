import express from 'express';
import InboundEmail from '../models/InboundEmail.js';
import { authenticateJWT } from '../middleware/auth.js';
import { sendEmail, isEmailEnabled } from '../utils/mailer.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all inbound emails (with pagination and filtering)
router.get('/', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters
    if (req.query.emailType) filter.emailType = req.query.emailType;
    if (req.query.processed !== undefined) filter.processed = req.query.processed === 'true';
    if (req.query.from) filter.from = new RegExp(req.query.from, 'i');
    if (req.query.subject) filter.subject = new RegExp(req.query.subject, 'i');
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.receivedAt = {};
      if (req.query.startDate) filter.receivedAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.receivedAt.$lte = new Date(req.query.endDate);
    }
    
    const [emails, total] = await Promise.all([
      InboundEmail.find(filter)
        .sort({ receivedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InboundEmail.countDocuments(filter)
    ]);
    
    res.json({
      emails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filter
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get email statistics
router.get('/stats', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [
      totalEmails,
      unprocessedEmails,
      todayEmails,
      weekEmails,
      monthEmails,
      emailsByType,
      autoRepliesSent
    ] = await Promise.all([
      InboundEmail.countDocuments(),
      InboundEmail.countDocuments({ processed: false }),
      InboundEmail.countDocuments({ receivedAt: { $gte: today } }),
      InboundEmail.countDocuments({ receivedAt: { $gte: thisWeek } }),
      InboundEmail.countDocuments({ receivedAt: { $gte: thisMonth } }),
      InboundEmail.aggregate([
        { $group: { _id: '$emailType', count: { $sum: 1 } } }
      ]),
      InboundEmail.countDocuments({ autoReplySent: true })
    ]);
    
    res.json({
      totalEmails,
      unprocessedEmails,
      todayEmails,
      weekEmails,
      monthEmails,
      emailsByType: emailsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      autoRepliesSent,
      emailEnabled: isEmailEnabled()
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get single email by ID
router.get('/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const email = await InboundEmail.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// Mark email as processed
router.patch('/:id/process', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { notes } = req.body;
    const email = await InboundEmail.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    await email.markProcessed(notes);
    res.json({ message: 'Email marked as processed', email });
  } catch (error) {
    console.error('Process email error:', error);
    res.status(500).json({ error: 'Failed to process email' });
  }
});

// Send manual reply to an email
router.post('/:id/reply', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { subject, html, text } = req.body;
    const email = await InboundEmail.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    if (!isEmailEnabled()) {
      return res.status(400).json({ error: 'Email service not configured' });
    }
    
    const replyResult = await sendEmail({
      to: email.from,
      subject: subject || `Re: ${email.subject}`,
      html,
      text
    });
    
    if (replyResult.ok) {
      // Add reply info to email metadata
      email.metadata.manualReply = {
        sentAt: new Date(),
        subject,
        messageId: replyResult.messageId,
        sentBy: req.user.userId
      };
      await email.save();
      
      res.json({
        message: 'Reply sent successfully',
        messageId: replyResult.messageId
      });
    } else {
      res.status(500).json({
        error: 'Failed to send reply',
        details: replyResult.error
      });
    }
  } catch (error) {
    console.error('Reply email error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// Update email classification
router.patch('/:id/classify', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { emailType, notes } = req.body;
    
    const validTypes = ['support', 'contact', 'unsubscribe', 'order_inquiry', 'general', 'spam'];
    if (!validTypes.includes(emailType)) {
      return res.status(400).json({ error: 'Invalid email type' });
    }
    
    const email = await InboundEmail.findByIdAndUpdate(
      req.params.id,
      { 
        emailType,
        notes: notes || email.notes,
        'metadata.classifiedBy': req.user.userId,
        'metadata.classifiedAt': new Date()
      },
      { new: true }
    );
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    res.json({ message: 'Email classified successfully', email });
  } catch (error) {
    console.error('Classify email error:', error);
    res.status(500).json({ error: 'Failed to classify email' });
  }
});

// Delete email (admin only, for spam/unwanted emails)
router.delete('/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const email = await InboundEmail.findByIdAndDelete(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

// Bulk operations
router.post('/bulk/process', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { emailIds, notes } = req.body;
    
    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({ error: 'Email IDs array required' });
    }
    
    const result = await InboundEmail.updateMany(
      { _id: { $in: emailIds } },
      { 
        processed: true,
        processedAt: new Date(),
        notes: notes || '',
        'metadata.bulkProcessedBy': req.user.userId
      }
    );
    
    res.json({
      message: 'Emails processed successfully',
      processedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk process error:', error);
    res.status(500).json({ error: 'Failed to process emails' });
  }
});

export default router;