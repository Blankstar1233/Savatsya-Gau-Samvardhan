import mongoose from 'mongoose';

const inboundEmailSchema = new mongoose.Schema({
  // Email headers and basic info
  to: {
    type: String,
    required: true,
    trim: true
  },
  from: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    default: ''
  },
  
  // Email content
  text: {
    type: String,
    default: ''
  },
  html: {
    type: String,
    default: ''
  },
  
  // Additional headers
  cc: {
    type: String,
    default: ''
  },
  bcc: {
    type: String,
    default: ''
  },
  
  // SendGrid specific fields
  attachments: {
    type: Number,
    default: 0
  },
  spf: {
    type: String,
    default: ''
  },
  envelope: {
    type: String,
    default: ''
  },
  
  // Processing status
  processed: {
    type: Boolean,
    default: false
  },
  processedAt: {
    type: Date
  },
  
  // Email classification
  emailType: {
    type: String,
    enum: ['support', 'contact', 'unsubscribe', 'order_inquiry', 'general', 'spam'],
    default: 'general'
  },
  
  // Auto-reply status
  autoReplySent: {
    type: Boolean,
    default: false
  },
  autoReplyAt: {
    type: Date
  },
  
  // Timestamps
  receivedAt: {
    type: Date,
    default: Date.now
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Processing notes (for admin review)
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
inboundEmailSchema.index({ from: 1, receivedAt: -1 });
inboundEmailSchema.index({ emailType: 1, processed: 1 });
inboundEmailSchema.index({ receivedAt: -1 });
inboundEmailSchema.index({ processed: 1, receivedAt: -1 });

// Virtual for formatted received date
inboundEmailSchema.virtual('formattedReceivedAt').get(function() {
  return this.receivedAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to mark email as processed
inboundEmailSchema.methods.markProcessed = function(notes = '') {
  this.processed = true;
  this.processedAt = new Date();
  if (notes) this.notes = notes;
  return this.save();
};

// Method to mark auto-reply as sent
inboundEmailSchema.methods.markAutoReplySent = function() {
  this.autoReplySent = true;
  this.autoReplyAt = new Date();
  return this.save();
};

// Static method to get unprocessed emails
inboundEmailSchema.statics.getUnprocessed = function(limit = 50) {
  return this.find({ processed: false })
    .sort({ receivedAt: -1 })
    .limit(limit);
};

// Static method to get emails by type
inboundEmailSchema.statics.getByType = function(emailType, limit = 50) {
  return this.find({ emailType })
    .sort({ receivedAt: -1 })
    .limit(limit);
};

// Static method to get recent emails
inboundEmailSchema.statics.getRecent = function(days = 7, limit = 100) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return this.find({ receivedAt: { $gte: since } })
    .sort({ receivedAt: -1 })
    .limit(limit);
};

export default mongoose.model('InboundEmail', inboundEmailSchema);