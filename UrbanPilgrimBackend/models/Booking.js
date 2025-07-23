// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // ===== CORE IDENTIFICATION =====
  bookingId: {
    type: String,
    unique: true,
    required: true
    // Format: "BOK_20240115_00001"
  },
  
  requestId: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function(v) {
        return /^REQ_\d{13}_[A-Z0-9]{6}$/.test(v);
      },
      message: 'Invalid request ID format'
    }
    // Format: "REQ_1705234567890_ABC123"
  },
  
  bookingType: {
    type: String,
    enum: ['pilgrim_experience', 'wellness_class'],
    required: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // ===== POLYMORPHIC ENTITY REFERENCE =====
  entity: {
    entityType: {
      type: String,
      enum: ['PilgrimExperience', 'WellnessGuideClass'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    // Snapshot for historical accuracy
    entitySnapshot: {
      name: String,
      basicDetails: Object
    }
  },
  
  // ===== BOOKING DETAILS (TYPE-SPECIFIC) =====
  bookingDetails: {
    // For Pilgrim Experience
    selectedDates: {
      from: Date,
      to: Date
    },
    occupancyType: {
      type: String,
      enum: ['Single', 'Couple']
    },
    sessionCount: Number,        // Number of sessions (people/couples)
    totalGuestCount: Number,     // Always equals sessionCount (actual number of people booking)
    
    // For Wellness Class
    selectedSlots: [{
      date: Date,
      startTime: String, // "09:00"
      endTime: String,   // "10:00"
      mode: {
        type: String,
        enum: ['online', 'offline']
      },
      slotId: String
    }],
    attendeeCount: Number,       // For wellness classes
    classCount: Number,          // Number of time slots booked
    totalSlots: Number,          // classCount × attendeeCount (for discount calculation)
    
    // Post-payment traveler details (optional)
    travelers: [{
      name: String,
      age: Number,
      phone: String,
      email: String,
      emergencyContact: {
        name: String,
        phone: String,
        relation: String
      },
      specialRequirements: {
        dietary: [String],
        medical: String,
        accessibility: String
      }
    }],
    
    // Traveler details completion status
    travelerDetailsCompleted: {
      type: Boolean,
      default: false
    },
    travelerDetailsCompletedAt: Date,
    
    // General fields
    specialRequests: String,
    customerNotes: String
  },
  
  // ===== ENHANCED PRICING WITH TAX CONFIGURATION =====
  pricing: {
    baseAmount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be positive'],
      max: [1000000, 'Amount too large']
    },
    
    // Platform margin from WellnessGuideClass
    platformMargin: {
      percentage: Number,
      appliedTo: {
        type: String,
        enum: ['online', 'offline']
      },
      amount: Number
    },
    
    discounts: {
      couponCode: String,
      couponDiscount: {
        type: Number,
        default: 0
      },
      bulkDiscount: {
        type: Number,
        default: 0
      },
      loyaltyDiscount: {
        type: Number,
        default: 0
      },
      appliedRule: String,
      totalDiscount: {
        type: Number,
        default: 0
      }
    },
    
    fees: {
      platformFee: {
        type: Number,
        default: 0
      },
      processingFee: {
        type: Number,
        default: 0
      }
    },
    
    // 🆕 ENHANCED TAX CONFIGURATION
    taxes: {
      gst: {
        type: Number,
        default: 0
      },
      serviceTax: {
        type: Number,
        default: 0
      },
      tds: {
        type: Number,
        default: 0
      },
      tourismTax: {
        type: Number,
        default: 0
      },
      totalTax: {
        type: Number,
        default: 0
      }
    },
    
    // 🆕 TAX CALCULATION BREAKDOWN
    taxBreakdown: [{
      taxType: String,              // "GST", "Service_Tax", etc.
      rate: Number,                 // 18, 5, etc.
      calculationMethod: String,    // "percentage", "fixed_amount"
      applicableAmount: Number,     // Amount this tax was calculated on
      calculatedAmount: Number,     // Final tax amount
      description: String           // "18% GST on retreat services"
    }],
    
    // 🆕 TAX CONFIGURATION REFERENCE
    taxConfigReference: {
      configId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaxConfiguration'
      },
      configName: String,           // "Pilgrim Experience Tax Config"
      configCode: String,           // "PILGRIM_TAX_2024"
      configVersion: String,        // "1.0"
      appliedAt: {
        type: Date,
        default: Date.now
      }
    },
    
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Revenue distribution
    guideEarning: Number,
    platformEarning: Number,
    
    // Detailed breakdown for transparency
    breakdown: {
      type: Object,
      default: {}
    }
  },
  
  // ===== PAYMENT TRACKING =====
  payment: {
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String
    },
    
    internalTransactionId: String,
    
    method: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    
    paidAt: Date,
    failureReason: String,
    paymentDetails: {
      type: Object,
      default: {}
    }
  },
  
  // ===== BOOKING STATUS MANAGEMENT =====
  status: {
    type: String,
    enum: [
      'draft',
      'payment_pending',
      'payment_failed',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'refunded',
      'expired'
    ],
    default: 'draft'
  },
  
  // ===== CANCELLATION & REFUND =====
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: [
        'user_request',
        'guide_unavailable',
        'technical_issue',
        'weather',
        'emergency',
        'admin_action',
        'payment_failure'
      ]
    },
    refundStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'processed', 'failed', 'partial']
    },
    refundAmount: Number,
    refundDetails: {
      razorpayRefundId: String,
      processedAt: Date,
      refundMethod: String
    }
  },
  
  // ===== CUSTOMER INFORMATION =====
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    phone: {
      type: String,
      required: false, // Made optional
      validate: {
        validator: function(v) {
          // Allow empty or undefined; validate only if value present
          if (!v) return true;
          return /^[+]?[\d\s-()]{10,15}$/.test(v);
        },
        message: 'Invalid phone format'
      }
    },
    
    // Optional emergency contact
    emergencyContact: {
      name: String,
      phone: String,
      relation: {
        type: String,
        enum: ['spouse', 'parent', 'sibling', 'friend', 'other']
      }
    }
  },
  
  // ===== NOTIFICATIONS =====
  notifications: {
    confirmationSent: {
      type: Boolean,
      default: false
    },
    remindersSent: [Date],
    completionSent: {
      type: Boolean,
      default: false
    }
  },
  
  // ===== WEBHOOK TRACKING (PRODUCTION) =====
  integration: {
    webhooks: [{
      eventType: String,
      razorpayEventId: String,
      receivedAt: {
        type: Date,
        default: Date.now
      },
      processedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending'
      },
      attempts: {
        type: Number,
        default: 0,
        max: 5
      },
      lastError: String,
      payload: Object
    }]
  },
  
  // ===== PRIVACY & CONSENT =====
  privacy: {
    dataProcessingConsent: {
      type: Boolean,
      required: true
    },
    dataProcessingConsentAt: {
      type: Date,
      required: true
    },
    
    termsAccepted: {
      type: Boolean,
      required: true
    },
    termsAcceptedAt: Date,
    termsVersion: {
      type: String,
      default: '1.0'
    },
    
    consentMethod: {
      type: String,
      enum: ['checkbox', 'button'],
      default: 'checkbox'
    },
    consentIpAddress: String,
    consentUserAgent: String
  },
  
  // ===== METADATA & TRACKING =====
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile_app', 'admin_panel'],
      default: 'web'
    },
    
    requestInfo: {
      ipAddress: String,
      userAgent: String,
      referer: String
    },
    
    performance: {
      timeToComplete: Number,
      paymentTime: Number
    },
    
    adminNotes: String,
    tags: [String],
    
    errorCount: {
      type: Number,
      default: 0,
      max: 10
    },
    lastError: {
      message: String,
      occurredAt: Date
    }
  }
  
}, {
  timestamps: true,
  strict: true,
  strictQuery: true
});

// ===== PRE-SAVE MIDDLEWARE =====
bookingSchema.pre('save', function(next) {
  // Generate requestId if not present
  if (!this.requestId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.requestId = `REQ_${timestamp}_${random}`;
  }
  
  // Calculate total guest count for pilgrim experiences
  if (this.bookingType === 'pilgrim_experience' && this.bookingDetails.sessionCount) {
    // totalGuestCount should always equal sessionCount (actual number of people)
    // occupancyType is just room preference (Single room vs Shared room)
    this.bookingDetails.totalGuestCount = this.bookingDetails.sessionCount;
  }
  
  // Calculate total slots for wellness classes
  if (this.bookingType === 'wellness_class' && this.bookingDetails.classCount && this.bookingDetails.attendeeCount) {
    this.bookingDetails.totalSlots = this.bookingDetails.classCount * this.bookingDetails.attendeeCount;
  }
  
  // Validate pricing consistency
  if (this.pricing.totalAmount <= 0) {
    return next(new Error('Total amount must be positive'));
  }
  
  // Set consent timestamps
  if (this.privacy.dataProcessingConsent && !this.privacy.dataProcessingConsentAt) {
    this.privacy.dataProcessingConsentAt = new Date();
  }
  
  if (this.privacy.termsAccepted && !this.privacy.termsAcceptedAt) {
    this.privacy.termsAcceptedAt = new Date();
  }
  
  next();
});

// ===== INDEXES FOR PERFORMANCE =====
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ bookingType: 1, status: 1 });
// Note: bookingId and requestId already have unique indexes from field definitions
bookingSchema.index({ 'entity.entityType': 1, 'entity.entityId': 1 });
bookingSchema.index({ 'payment.razorpay.orderId': 1 }, { sparse: true });
bookingSchema.index({ 'payment.razorpay.paymentId': 1 }, { sparse: true });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'customerInfo.email': 1 });
bookingSchema.index({ 'bookingDetails.selectedSlots.date': 1 });
bookingSchema.index({ 'bookingDetails.selectedDates.from': 1, 'bookingDetails.selectedDates.to': 1 });
bookingSchema.index({ 'pricing.taxConfigReference.configId': 1 });
bookingSchema.index({ createdAt: -1 });

// ===== METHODS =====
bookingSchema.methods.generateBookingId = function() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `BOK_${dateStr}_${randomNum}`;
};

bookingSchema.methods.calculateTotalSlots = function() {
  if (this.bookingType === 'wellness_class') {
    return this.bookingDetails.classCount * this.bookingDetails.attendeeCount;
  }
  return 0;
};

// ===== PAGINATION PLUGIN =====
const mongoosePaginate = require('mongoose-paginate-v2');
bookingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Booking', bookingSchema);