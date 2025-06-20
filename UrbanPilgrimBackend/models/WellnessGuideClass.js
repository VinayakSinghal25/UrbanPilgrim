// models/WellnessGuideClass.js
const mongoose = require('mongoose');

const wellnessGuideClassSchema = new mongoose.Schema({
  wellnessGuide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WellnessGuide',
    required: [true, 'Wellness guide reference is required'],
  },
  title: {
    type: String,
    required: [true, 'Class title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Class description is required'],
    trim: true,
  },
  about: {
    type: String,
    required: [true, 'About section is required'],
    trim: true,
  },
  certifications: [{
    type: String,
    trim: true,
  }],
  skillsToLearn: [{
    type: String,
    trim: true,
  }],
  aboutSections: [{
    header: {
      type: String,
      required: true,
      trim: true,
    },
    paragraph: {
      type: String,
      required: true,
      trim: true,
    }
  }],
  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    required: [true, 'Class specialty is required'],
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    default: 'Asia/Kolkata',
  },
  modes: {
    online: {
      enabled: {
        type: Boolean,
        default: false,
      },
      maxCapacity: {
        type: Number,
        min: 1,
        max: 100,
      },
      price: {
        type: Number,
        min: 0,
      }
    },
    offline: {
      enabled: {
        type: Boolean,
        default: false,
      },
      maxCapacity: {
        type: Number,
        min: 1,
        max: 100,
      },
      price: {
        type: Number,
        min: 0,
      }
    }
  },
  // Schedule configuration
  scheduleConfig: {
    selectedDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    }],
    timeSlots: {
      online: [{
        startTime: {
          type: String, // Format: "HH:MM"
          required: true,
        },
        endTime: {
          type: String, // Format: "HH:MM"
          required: true,
        }
      }],
      offline: [{
        startTime: {
          type: String, // Format: "HH:MM"
          required: true,
        },
        endTime: {
          type: String, // Format: "HH:MM"
          required: true,
        }
      }]
    },
    dateRange: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      }
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'active', 'paused', 'completed', 'rejected'],
    default: 'draft',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Admin approval fields
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectedAt: {
    type: Date,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
  },
  // Slot generation tracking
  slotsGenerated: {
    type: Boolean,
    default: false,
  },
  slotGenerationStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  slotGenerationError: {
    type: String,
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
}, { timestamps: true });

// Validation
wellnessGuideClassSchema.pre('save', function(next) {
  // At least one mode must be enabled
  if (!this.modes.online.enabled && !this.modes.offline.enabled) {
    return next(new Error('At least one mode (online or offline) must be enabled'));
  }
  
  // Validate date range (max 6 months)
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  if (this.scheduleConfig.dateRange.endDate > sixMonthsFromNow) {
    return next(new Error('Class cannot be scheduled more than 6 months in advance'));
  }
  
  if (this.scheduleConfig.dateRange.startDate >= this.scheduleConfig.dateRange.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  
  next();
});

// Indexes
wellnessGuideClassSchema.index({ wellnessGuide: 1, status: 1 });
wellnessGuideClassSchema.index({ status: 1, isActive: 1 });
wellnessGuideClassSchema.index({ specialty: 1, status: 1 });

const WellnessGuideClass = mongoose.model('WellnessGuideClass', wellnessGuideClassSchema);

module.exports = WellnessGuideClass;