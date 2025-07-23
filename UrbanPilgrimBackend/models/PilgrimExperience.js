const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: { type: String, required: true },
  displayTitle: { type: String, required: true },
  detailedTitle: { type: String, required: true },
  subheading: { type: String },
  description: { type: String, required: true },
});

const dayScheduleSchema = new mongoose.Schema({
  dayTitle: { type: String, required: true },
  activities: [activitySchema]
});

const pilgrimExperienceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{
    public_id: String,
    url: String
  }],
  about: [{ heading: String, paragraphs: [String] }], // Optional, for other about sections
  retreatGuideBio: { type: String, required: true }, // Main paragraph
  retreatGuideLink: { type: String, required: true }, // "Meet your guide" link
  retreatGuideImage: { type: String }, // Optional: guide's image
  whatToExpect: { type: String },
  programSchedule: [dayScheduleSchema],
  priceSingle: { type: Number, required: true },
  priceCouple: { type: Number, required: true },
  // NEW duration fields (required) [no. of days & nights]
  numberOfDays: { type: Number, required: true },
  numberOfNights: { type: Number, required: true },
  location: { type: String },
  address: { type: String }, // New field: Address paragraph
  mapLink: { type: String }, // New field: Google Maps location link
  availableDates: [{
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  }],
  whatsIncluded: [{ type: String }], // Array of strings
  whatsNotIncluded: [{ type: String }], // Array of strings
  termsAndConditions: [{ type: String, required: true }],
  trainerProfileLink: { type: String }, // Optional: direct link to trainer's profile
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  occupancyOptions: {
    type: [String],
    enum: ['Single', 'Couple'],
    default: ['Single']
  },
  
  // 🆕 NEW: Optimized discount configuration (no defaults - 0 storage cost when unused)
  discountRules: {
    // Bulk session discounts
    bulk: [{
      minSessions: {
        type: Number,
        min: 1,
        max: 20
      },
      percentage: {
        type: Number,
        min: 0,
        max: 50 // Max 50% discount
      },
      description: {
        type: String,
        maxlength: 200
      }
    }],
    
    // Couple-specific discounts
    couple: [{
      minSessions: {
        type: Number,
        min: 1,
        max: 10
      },
      percentage: {
        type: Number,
        min: 0,
        max: 30
      },
      description: {
        type: String,
        maxlength: 200
      }
    }],
    
    // Early bird discount
    earlyBird: {
      enabled: Boolean,
      daysBeforeExperience: {
        type: Number,
        min: 1,
        max: 90
      },
      percentage: {
        type: Number,
        min: 0,
        max: 25
      },
      description: {
        type: String,
        maxlength: 200
      }
    },
    
    // Seasonal discounts
    seasonal: [{
      season: {
        type: String,
        enum: ['summer', 'winter', 'monsoon', 'spring']
      },
      percentage: {
        type: Number,
        min: 0,
        max: 30
      },
      validFrom: Date, // Start date for season
      validTo: Date,   // End date for season
      description: {
        type: String,
        maxlength: 200
      }
    }]
  },
  
  // 🆕 NEW: Simple on/off discount (no defaults - only stored when enabled)
  simpleDiscount: {
    enabled: Boolean,        // No default - undefined if not set
    percentage: Number,      // No default - undefined if not set
    description: String,     // No default - undefined if not set
    validFrom: Date,
    validTo: Date
  },
  
  // 🆕 NEW: Discount status tracking (no default - undefined if not set)
  discountStatus: String,    // 'none', 'simple', 'advanced'
  
  // 🆕 NEW: Discount metadata (only stored when discount is used)
  discountMetadata: {
    lastUpdated: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    totalDiscountGiven: Number,    // No default - undefined if not set
    discountUsageCount: Number     // No default - undefined if not set
  }
});

// Indexes for performance
pilgrimExperienceSchema.index({ createdBy: 1 });
pilgrimExperienceSchema.index({ 'availableDates.from': 1, 'availableDates.to': 1 });
pilgrimExperienceSchema.index({ location: 1 });
pilgrimExperienceSchema.index({ discountStatus: 1 });
pilgrimExperienceSchema.index({ 'simpleDiscount.enabled': 1 });

// Methods
pilgrimExperienceSchema.methods.hasActiveDiscount = function() {
  if (this.simpleDiscount?.enabled) {
    const now = new Date();
    const validFrom = this.simpleDiscount.validFrom;
    const validTo = this.simpleDiscount.validTo;
    
    const isValidPeriod = (!validFrom || now >= validFrom) &&
                         (!validTo || now <= validTo);
    
    return isValidPeriod && this.simpleDiscount.percentage > 0;
  }
  
  return this.discountStatus && this.discountStatus !== 'none';
};

pilgrimExperienceSchema.methods.getActiveDiscountSummary = function() {
  if (this.simpleDiscount?.enabled && this.hasActiveDiscount()) {
    return {
      type: 'simple',
      percentage: this.simpleDiscount.percentage,
      description: this.simpleDiscount.description
    };
  }
  
  if (this.discountStatus === 'advanced' && this.discountRules) {
    const activeRules = [];
    
    if (this.discountRules.bulk?.length > 0) {
      activeRules.push(...this.discountRules.bulk);
    }
    
    if (this.discountRules.couple?.length > 0) {
      activeRules.push(...this.discountRules.couple);
    }
    
    return {
      type: 'advanced',
      rules: activeRules
    };
  }
  
  return null;
};

module.exports = mongoose.model('PilgrimExperience', pilgrimExperienceSchema);