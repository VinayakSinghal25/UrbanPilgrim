// models/EmailOTP.js
const mongoose = require('mongoose');

const emailOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: 4,
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    default: 'email_verification',
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3, // Maximum 3 attempts
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    expires: 0, // Let MongoDB use the expiresAt field value
  },
}, { timestamps: true });

// Index for efficient querying
emailOTPSchema.index({ email: 1, purpose: 1 });
// Removed duplicate index: emailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// The expires: 600 in the field definition already creates the TTL index

const EmailOTP = mongoose.model('EmailOTP', emailOTPSchema);

module.exports = EmailOTP;