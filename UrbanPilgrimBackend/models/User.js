// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ROLES = require('./RoleEnum');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: function() {
      // Password is required only for local auth (not Google auth)
      return this.provider === 'local';
    },
    minlength: 6,
    select: false,
  },
  // Google Auth fields
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values but unique non-null values
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  // Reference to WellnessGuide profile (null if user is not a wellness guide)
  wellnessGuide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WellnessGuide',
    default: null,
  },
  // 'about' can be a general bio for any user
  about: {
    type: String,
    trim: true,
  },
  // 'contactNumber' can be provided by any user
  contactNumber: {
    type: String,
    trim: true,
  },
  // 'profilePictures' can be used by any user
  profilePictures: {
    type: [{
        public_id: String, // Cloudinary public_id for deletion
        url: String        // Cloudinary URL for display
    }],
    default: [],
  },
  roles: {
    type: [String],
    enum: Object.values(ROLES),
    required: true,
    default: [ROLES.USER],
  },
  // 'isVerified' means profile reviewed by Admin (for any special verification)
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  address: [{
    street: { type: String },
    locality: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' },
    label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' }
  }],
}, { timestamps: true });

// Hash password before saving (only for local auth)
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified and exists (for local auth)
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false; // For Google auth users
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { 
      userId: this._id, 
      roles: this.roles, 
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    },
    process.env.JWT_SECRET || 'yourSuperSecretKeyForJWT',
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
};

// Create compound index for Google auth
userSchema.index({ googleId: 1, provider: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;