import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const preferencesSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  currency: { type: String, default: 'INR' },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, { _id: false });

const uiConfigSchema = new mongoose.Schema({
  colorScheme: { type: String, default: 'default' },
  fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  animations: { type: Boolean, default: true },
  highContrast: { type: Boolean, default: false },
  reduceMotion: { type: Boolean, default: false }
}, { _id: false });

const twoFactorAuthSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  method: { type: String, enum: ['email', 'sms', 'app'], default: null },
  backupCodes: [{
    code: String,
    used: { type: Boolean, default: false }
  }],
  enabledAt: Date,
  disabledAt: Date
}, { _id: false });

const deletionScheduleSchema = new mongoose.Schema({
  scheduledAt: Date,
  deletionDate: Date,
  reason: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  phone: { type: String },
  profilePicture: { type: String }, // Base64 encoded image or URL
  address: [addressSchema],
  preferences: { type: preferencesSchema, default: () => ({}) },
  uiConfig: { type: uiConfigSchema, default: () => ({}) },
  cart: [{ type: Object }],
  
  // Security fields
  passwordChangedAt: Date,
  twoFactorAuth: { type: twoFactorAuthSchema, default: () => ({}) },
  isActive: { type: Boolean, default: true },
  deletionScheduled: deletionScheduleSchema,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
