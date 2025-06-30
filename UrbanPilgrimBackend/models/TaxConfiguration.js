// models/TaxConfiguration.js
const mongoose = require('mongoose');

const taxRuleSchema = new mongoose.Schema({
  taxType: {
    type: String,
    enum: ['GST', 'Service_Tax', 'TDS', 'Platform_Fee', 'Processing_Fee', 'Tourism_Tax', 'CGST', 'SGST', 'IGST'],
    required: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100 // For percentage, or can be higher for fixed amounts
  },
  calculationMethod: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'tiered'],
    default: 'percentage'
  },
  applicableOn: {
    type: String,
    enum: ['base_amount', 'total_amount', 'platform_earning', 'guide_earning'],
    default: 'base_amount'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: String // "18% GST on retreat services"
});

const taxConfigurationSchema = new mongoose.Schema({
  configName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  configCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
    // e.g., "PILGRIM_TAX_2024", "WELLNESS_TAX_2024"
  },
  
  taxRules: [taxRuleSchema],
  
  // Business rules
  applicableBookingTypes: [{
    type: String,
    enum: ['pilgrim_experience', 'wellness_class'],
    required: true
  }],
  
  // Amount thresholds
  minAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxAmount: {
    type: Number,
    default: null // null means no upper limit
  },
  
  // Geographic applicability
  applicableRegions: [{
    type: String,
    enum: ['India', 'International', 'Domestic', 'All'],
    default: 'All'
  }],
  
  // Date validity
  effectiveFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  effectiveTo: {
    type: Date,
    default: null // null means no expiry
  },
  
  // Configuration status
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Version control
  version: {
    type: String,
    default: '1.0'
  },
  previousConfigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxConfiguration'
  },
  
  // Admin fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  // Notes and documentation
  notes: String,
  changeReason: String // "Updated GST rate for FY 2024-25"
  
}, { 
  timestamps: true 
});

// Indexes for performance
taxConfigurationSchema.index({ applicableBookingTypes: 1, isDefault: 1, isActive: 1 });
taxConfigurationSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
taxConfigurationSchema.index({ configCode: 1 });
taxConfigurationSchema.index({ isActive: 1, isDefault: 1 });

// Validation middleware
taxConfigurationSchema.pre('save', function(next) {
  // Ensure at least one tax rule exists
  if (!this.taxRules || this.taxRules.length === 0) {
    return next(new Error('At least one tax rule is required'));
  }
  
  // Validate date range
  if (this.effectiveTo && this.effectiveFrom >= this.effectiveTo) {
    return next(new Error('Effective from date must be before effective to date'));
  }
  
  // Validate amount range
  if (this.maxAmount && this.minAmount >= this.maxAmount) {
    return next(new Error('Minimum amount must be less than maximum amount'));
  }
  
  next();
});

// Methods
taxConfigurationSchema.methods.isValidForBooking = function(bookingType, amount, bookingDate = new Date()) {
  // Check booking type
  if (!this.applicableBookingTypes.includes(bookingType)) {
    return false;
  }
  
  // Check amount range
  if (amount < this.minAmount) {
    return false;
  }
  
  if (this.maxAmount && amount > this.maxAmount) {
    return false;
  }
  
  // Check date validity
  if (bookingDate < this.effectiveFrom) {
    return false;
  }
  
  if (this.effectiveTo && bookingDate > this.effectiveTo) {
    return false;
  }
  
  // Check if active
  return this.isActive;
};

taxConfigurationSchema.methods.calculateTaxes = function(baseAmount) {
  let totalTax = 0;
  const taxBreakdown = [];
  
  for (const rule of this.taxRules) {
    if (!rule.isActive) continue;
    
    let taxAmount = 0;
    let applicableAmount = baseAmount; // Simplified for now
    
    if (rule.calculationMethod === 'percentage') {
      taxAmount = (applicableAmount * rule.rate) / 100;
    } else if (rule.calculationMethod === 'fixed_amount') {
      taxAmount = rule.rate;
    }
    
    taxAmount = Math.round(taxAmount * 100) / 100; // Round to 2 decimal places
    totalTax += taxAmount;
    
    taxBreakdown.push({
      taxType: rule.taxType,
      rate: rule.rate,
      calculationMethod: rule.calculationMethod,
      applicableAmount,
      calculatedAmount: taxAmount,
      description: rule.description
    });
  }
  
  return {
    totalTax: Math.round(totalTax * 100) / 100,
    taxBreakdown
  };
};

module.exports = mongoose.model('TaxConfiguration', taxConfigurationSchema);