// models/WellnessGuide.js
const mongoose = require('mongoose');

const languagesEnum = ['English', 'Hindi', 'Spanish', 'French', 'Other'];

const wellnessGuideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
  },
  profileDescription: {
    type: String,
    required: [true, 'Profile description is required'],
    trim: true,
    minlength: [50, 'Profile description must be at least 50 characters'],
    maxlength: [1000, 'Profile description cannot exceed 1000 characters'],
  },
  // Removed address from here - will use User's address
  areaOfExpertise: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    required: [true, 'Area of expertise is required'],
  }],
  languages: {
    type: [String],
    enum: languagesEnum,
    required: [true, 'At least one language is required'],
    validate: {
      validator: function(languages) {
        return languages && languages.length > 0;
      },
      message: 'At least one language must be selected'
    }
  },
  profilePictures: {
    type: [{
        public_id: String, // Cloudinary public_id for deletion
        url: String        // Cloudinary URL for display
    }],
    required: [true, 'At least one profile picture is required'],
    validate: {
      validator: function(pictures) {
        return pictures && pictures.length > 0;
      },
      message: 'At least one profile picture is required'
    }
  },
  wellnessGuideClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WellnessGuideClass',
  }],
  isApproved: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Index for faster queries
// REMOVED: wellnessGuideSchema.index({ user: 1 }); // Redundant - 'unique: true' already creates an index
wellnessGuideSchema.index({ isApproved: 1, isActive: 1 });

const WellnessGuide = mongoose.model('WellnessGuide', wellnessGuideSchema);

module.exports = WellnessGuide;