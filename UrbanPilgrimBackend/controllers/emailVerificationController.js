// controllers/emailVerificationController.js
const User = require('../models/User');
const EmailOTP = require('../models/EmailOTP');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

// Generate 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// @desc    Send email verification OTP
// @route   POST /api/auth/send-verification-otp
// @access  Private
const sendVerificationOTP = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({ 
        message: 'Email is already verified' 
      });
    }

    // Check if there's a recent OTP request (rate limiting)
    const recentOTP = await EmailOTP.findOne({
      email: user.email,
      purpose: 'email_verification',
      createdAt: { $gte: new Date(Date.now() - 60000) } // Within last 1 minute
    });

    if (recentOTP) {
      return res.status(429).json({ 
        message: 'Please wait 1 minute before requesting another OTP' 
      });
    }

    // Invalidate any existing OTPs for this email
    await EmailOTP.deleteMany({ 
      email: user.email, 
      purpose: 'email_verification' 
    });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    const otpDoc = new EmailOTP({
      email: user.email,
      otp,
      purpose: 'email_verification',
    });

    await otpDoc.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp, user.firstName);

    res.json({
      message: 'Verification code sent to your email',
      email: user.email,
    });

  } catch (error) {
    console.error('Error sending verification OTP:', error);
    res.status(500).json({ 
      message: 'Error sending verification code',
      error: error.message 
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Private
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.userId;

    // Validate OTP format
    if (!otp || otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      return res.status(400).json({ 
        message: 'Please provide a valid 4-digit OTP' 
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({ 
        message: 'Email is already verified' 
      });
    }

    // Find the most recent valid OTP
    const otpDoc = await EmailOTP.findOne({
      email: user.email,
      purpose: 'email_verification',
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ 
        message: 'No valid OTP found. Please request a new one.' 
      });
    }

    // Check if OTP has expired
    if (otpDoc.expiresAt < new Date()) {
      await EmailOTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Check attempts limit
    if (otpDoc.attempts >= 3) {
      await EmailOTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ 
        message: 'Too many incorrect attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (otpDoc.otp !== otp) {
      // Increment attempts
      otpDoc.attempts += 1;
      await otpDoc.save();

      return res.status(400).json({ 
        message: `Invalid OTP. ${3 - otpDoc.attempts} attempts remaining.` 
      });
    }

    // OTP is valid - verify the email
    user.emailVerified = true;
    await user.save();

    // Mark OTP as used and delete it
    await EmailOTP.deleteOne({ _id: otpDoc._id });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName);

    res.json({
      message: 'Email verified successfully!',
      emailVerified: true,
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ 
      message: 'Error verifying email',
      error: error.message 
    });
  }
};

// @desc    Check email verification status
// @route   GET /api/auth/email-verification-status
// @access  Private
const getEmailVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('email emailVerified');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      email: user.email,
      emailVerified: user.emailVerified,
    });

  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({ 
      message: 'Error checking verification status',
      error: error.message 
    });
  }
};

module.exports = {
  sendVerificationOTP,
  verifyEmail,
  getEmailVerificationStatus,
};