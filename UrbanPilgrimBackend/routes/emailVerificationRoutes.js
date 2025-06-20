// routes/emailVerificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  sendVerificationOTP,
  verifyEmail,
  getEmailVerificationStatus,
} = require('../controllers/emailVerificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Send verification OTP
router.post('/send-verification-otp', sendVerificationOTP);

// Verify email with OTP
router.post('/verify-email', verifyEmail);

// Check verification status
router.get('/email-verification-status', getEmailVerificationStatus);

module.exports = router;