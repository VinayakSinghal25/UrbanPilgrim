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
  // Photos for the class
  photos: [{
    type: String, // Cloudinary URLs or file paths
    required: false
  }],
  // Guide's certifications (what the guide has) - OPTIONAL
  guideCertifications: [{
    type: String,
    trim: true,
  }],
  // Skills to learn - OPTIONAL
  skillsToLearn: [{
    type: String,
    trim: true,
  }],
  // About sections - OPTIONAL
  aboutSections: [{
    header: {
      type: String,
      required: false, // Made optional
      trim: true,
    },
    paragraph: {
      type: String,
      required: false, // Made optional
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
      },
      // Address for offline classes
      address: {
        street: {
          type: String,
          trim: true
        },
        city: {
          type: String,
          trim: true
        },
        state: {
          type: String,
          trim: true
        },
        zipCode: {
          type: String,
          trim: true
        },
        pincode: {
          type: String,
          trim: true
        },
        country: {
          type: String,
          trim: true,
          default: 'India'
        },
        landmark: {
          type: String,
          trim: true
        },
        addressType: {
          type: String,
          enum: ['home', 'office', 'studio', 'gym', 'other'],
          default: 'studio'
        }
      },
      // Location for offline classes (city name for sorting/filtering)
      location: {
        type: String,
        trim: true
      }
    }
  },
  // UPDATED Schedule configuration - separate for online and offline
  scheduleConfig: {
    online: {
      selectedDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      }],
      timeSlots: [{
        startTime: {
          type: String, // Format: "HH:MM"
          required: true,
        },
        endTime: {
          type: String, // Format: "HH:MM"
          required: true,
        }
      }],
      dateRange: {
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        }
      }
    },
    offline: {
      selectedDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      }],
      timeSlots: [{
        startTime: {
          type: String, // Format: "HH:MM"
          required: true,
        },
        endTime: {
          type: String, // Format: "HH:MM"
          required: true,
        }
      }],
      dateRange: {
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        }
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
  // Admin-only settings
  adminSettings: {
    // Platform margin settings (admin only)
    platformMargin: {
      online: {
        type: Number, // percentage with 2 decimal places (e.g., 12.50)
        default: 0,
        min: 0,
        max: 100
      },
      offline: {
        type: Number, // percentage with 2 decimal places (e.g., 12.50)
        default: 0,
        min: 0,
        max: 100
      }
    },
    // Online discount settings (admin only)
    onlineDiscount: {
      isEnabled: {
        type: Boolean,
        default: false
      },
      tiers: [{
        minClasses: {
          type: Number,
          required: true,
          min: 1
        },
        discountPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100
        }
      }]
    },
    // Offline discount settings (admin only)
    offlineDiscount: {
      isEnabled: {
        type: Boolean,
        default: false
      },
      tiers: [{
        minClasses: {
          type: Number,
          required: true,
          min: 1
        },
        discountPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100
        }
      }]
    }
  }
}, { timestamps: true });

// UPDATED Validation
wellnessGuideClassSchema.pre('save', function(next) {
  // At least one mode must be enabled
  if (!this.modes.online.enabled && !this.modes.offline.enabled) {
    return next(new Error('At least one mode (online or offline) must be enabled'));
  }
  
  // Validate online mode requirements
  if (this.modes.online.enabled) {
    if (!this.modes.online.maxCapacity || !this.modes.online.price) {
      return next(new Error('Online mode requires maxCapacity and price'));
    }
    
    // Validate online schedule if provided
    if (this.scheduleConfig.online.selectedDays && this.scheduleConfig.online.selectedDays.length > 0) {
      if (!this.scheduleConfig.online.dateRange.startDate || !this.scheduleConfig.online.dateRange.endDate) {
        return next(new Error('Online mode requires date range when days are selected'));
      }
      if (this.scheduleConfig.online.dateRange.startDate >= this.scheduleConfig.online.dateRange.endDate) {
        return next(new Error('Online start date must be before end date'));
      }
    }
  }
  
  // Validate offline mode requirements
  if (this.modes.offline.enabled) {
    if (!this.modes.offline.maxCapacity || !this.modes.offline.price) {
      return next(new Error('Offline mode requires maxCapacity and price'));
    }
    
    // Validate offline address and location
    if (!this.modes.offline.address || 
        !this.modes.offline.address.street || 
        !this.modes.offline.address.city || 
        !this.modes.offline.address.state || 
        (!this.modes.offline.address.zipCode && !this.modes.offline.address.pincode)) {
      return next(new Error('Offline address is required when offline mode is enabled'));
    }
    
    if (!this.modes.offline.location) {
      return next(new Error('Offline location is required when offline mode is enabled'));
    }
    
    // Validate offline schedule if provided
    if (this.scheduleConfig.offline.selectedDays && this.scheduleConfig.offline.selectedDays.length > 0) {
      if (!this.scheduleConfig.offline.dateRange.startDate || !this.scheduleConfig.offline.dateRange.endDate) {
        return next(new Error('Offline mode requires date range when days are selected'));
      }
      if (this.scheduleConfig.offline.dateRange.startDate >= this.scheduleConfig.offline.dateRange.endDate) {
        return next(new Error('Offline start date must be before end date'));
      }
    }
  }
  
  // Validate date ranges don't exceed 6 months
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  if (this.modes.online.enabled && this.scheduleConfig.online.dateRange.endDate) {
    if (this.scheduleConfig.online.dateRange.endDate > sixMonthsFromNow) {
      return next(new Error('Online classes cannot be scheduled more than 6 months in advance'));
    }
  }
  
  if (this.modes.offline.enabled && this.scheduleConfig.offline.dateRange.endDate) {
    if (this.scheduleConfig.offline.dateRange.endDate > sixMonthsFromNow) {
      return next(new Error('Offline classes cannot be scheduled more than 6 months in advance'));
    }
  }
  
  // Initialize adminSettings if not present
  if (!this.adminSettings) {
    this.adminSettings = {
      platformMargin: { online: 0, offline: 0 },
      onlineDiscount: { isEnabled: false, tiers: [] },
      offlineDiscount: { isEnabled: false, tiers: [] }
    };
  }
  
  next();
});

// Indexes
wellnessGuideClassSchema.index({ wellnessGuide: 1, status: 1 });
wellnessGuideClassSchema.index({ status: 1, isActive: 1 });
wellnessGuideClassSchema.index({ specialty: 1, status: 1 });

const WellnessGuideClass = mongoose.model('WellnessGuideClass', wellnessGuideClassSchema);

module.exports = WellnessGuideClass;