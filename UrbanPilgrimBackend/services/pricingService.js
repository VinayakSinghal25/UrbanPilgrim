// services/pricingService.js
class PricingService {
  
  /**
   * Calculate pricing for Pilgrim Experience booking (with discount support)
   */
  static calculatePilgrimPricing(experience, occupancy, sessionCount) {
    // Validate inputs first
    this.validatePricingInputs(experience, occupancy, sessionCount);
    
    // Calculate base amount
    let baseAmount;
    if (occupancy === 'Single') {
      // Single occupancy: price is per person per day
      baseAmount = experience.priceSingle * sessionCount * experience.numberOfDays;
    } else if (occupancy === 'Couple') {
      // Twin/shared room: priceCouple is already for one person per day
      baseAmount = experience.priceCouple * sessionCount * experience.numberOfDays;
    } else {
      throw new Error('Invalid occupancy type');
    }
    
    // Calculate discounts - now experience-aware
    const discounts = this.calculateDiscounts(experience, baseAmount, sessionCount, occupancy);
    const discountedAmount = baseAmount - discounts.totalDiscount;
    
    // No taxes for now - all tax fields are 0
    const taxes = {
      gst: 0,
      serviceTax: 0,
      tds: 0,
      tourismTax: 0,
      totalTax: 0
    };
    
    // Calculate final amounts
    const totalAmount = discountedAmount + taxes.totalTax; // Currently same as discountedAmount
    
    return {
      baseAmount,
      discounts,
      taxes,
      totalAmount,
      // Empty tax fields for future use
      taxBreakdown: [],
      taxConfigReference: null,
      // Additional breakdown for transparency
      breakdown: {
        basePrice: baseAmount,
        totalDiscount: discounts.totalDiscount,
        subtotal: discountedAmount,
        totalTax: taxes.totalTax,
        finalAmount: totalAmount
      }
    };
  }
  
  /**
   * Calculate discounts based on experience configuration
   */
  static calculateDiscounts(experience, baseAmount, sessionCount, occupancy) {
    // If no discount configuration exists, return zero discounts
    if (!experience.discountStatus || experience.discountStatus === 'none') {
      return {
        bulkDiscount: 0,
        coupleDiscount: 0,
        simpleDiscount: 0,
        earlyBirdDiscount: 0,
        seasonalDiscount: 0,
        totalDiscount: 0,
        appliedRules: [],
        discountType: 'none',
        discountDescription: null
      };
    }
    
    let bulkDiscount = 0;
    let coupleDiscount = 0;
    let simpleDiscount = 0;
    let earlyBirdDiscount = 0;
    let seasonalDiscount = 0;
    let appliedRules = [];
    let discountType = 'none';
    
    // Priority 1: Simple discount (if enabled and valid)
    if (experience.simpleDiscount?.enabled) {
      const simple = experience.simpleDiscount;
      const now = new Date();
      
      // Check if simple discount is currently valid
      const isValidPeriod = (!simple.validFrom || now >= simple.validFrom) &&
                           (!simple.validTo || now <= simple.validTo);
      
      if (isValidPeriod && simple.percentage > 0) {
        simpleDiscount = baseAmount * (simple.percentage / 100);
        appliedRules.push(`simple_${simple.percentage}_percent`);
        discountType = 'simple';
        
        // If simple discount is active, return only this (skip other discounts)
        return {
          simpleDiscount,
          bulkDiscount: 0,
          coupleDiscount: 0,
          earlyBirdDiscount: 0,
          seasonalDiscount: 0,
          totalDiscount: simpleDiscount,
          appliedRules,
          discountType,
          discountDescription: simple.description || `${simple.percentage}% discount`
        };
      }
    }
    
    // Priority 2: Advanced discount rules (if no simple discount active)
    if (experience.discountRules) {
      const rules = experience.discountRules;
      discountType = 'advanced';
      
      // Apply bulk discounts
      if (rules.bulk && rules.bulk.length > 0) {
        let highestBulkDiscount = 0;
        let appliedBulkRule = null;
        
        rules.bulk.forEach(rule => {
          if (sessionCount >= rule.minSessions) {
            const discount = baseAmount * (rule.percentage / 100);
            if (discount > highestBulkDiscount) {
              highestBulkDiscount = discount;
              appliedBulkRule = rule;
            }
          }
        });
        
        if (appliedBulkRule) {
          bulkDiscount = highestBulkDiscount;
          appliedRules.push(`bulk_${appliedBulkRule.minSessions}_sessions_${appliedBulkRule.percentage}_percent`);
        }
      }
      
      // Apply couple-specific discounts
      if (occupancy === 'Couple' && rules.couple && rules.couple.length > 0) {
        let highestCoupleDiscount = 0;
        let appliedCoupleRule = null;
        
        rules.couple.forEach(rule => {
          if (sessionCount >= rule.minSessions) {
            const discount = baseAmount * (rule.percentage / 100);
            if (discount > highestCoupleDiscount) {
              highestCoupleDiscount = discount;
              appliedCoupleRule = rule;
            }
          }
        });
        
        if (appliedCoupleRule) {
          coupleDiscount = highestCoupleDiscount;
          appliedRules.push(`couple_${appliedCoupleRule.minSessions}_sessions_${appliedCoupleRule.percentage}_percent`);
        }
      }
      
      // Apply early bird discount
      if (rules.earlyBird?.enabled) {
        // For now, skip early bird - needs experience date logic
        // earlyBirdDiscount = this.calculateEarlyBirdDiscount(experience, rules.earlyBird, baseAmount);
      }
      
      // Apply seasonal discount
      if (rules.seasonal && rules.seasonal.length > 0) {
        const activeSeasonalDiscount = this.calculateSeasonalDiscount(rules.seasonal, baseAmount);
        if (activeSeasonalDiscount.discount > 0) {
          seasonalDiscount = activeSeasonalDiscount.discount;
          appliedRules.push(`seasonal_${activeSeasonalDiscount.season}_${activeSeasonalDiscount.percentage}_percent`);
        }
      }
    }
    
    // Priority 3: Default hardcoded rules (if no experience-specific rules)
    if (!experience.discountRules && !experience.simpleDiscount?.enabled) {
      discountType = 'default';
      // For now, return no discounts when no configuration exists
      return {
        bulkDiscount: 0,
        coupleDiscount: 0,
        simpleDiscount: 0,
        earlyBirdDiscount: 0,
        seasonalDiscount: 0,
        totalDiscount: 0,
        appliedRules: [],
        discountType: 'none',
        discountDescription: null
      };
    }
    
    // Combine discounts - take the highest single discount to avoid stacking
    const totalDiscount = Math.max(
      bulkDiscount,
      coupleDiscount,
      simpleDiscount,
      earlyBirdDiscount,
      seasonalDiscount
    );
    
    return {
      bulkDiscount,
      coupleDiscount,
      simpleDiscount,
      earlyBirdDiscount,
      seasonalDiscount,
      totalDiscount,
      appliedRules,
      discountType,
      discountDescription: this.getDiscountDescription(appliedRules, totalDiscount, baseAmount)
    };
  }
  
  /**
   * Calculate seasonal discount
   */
  static calculateSeasonalDiscount(seasonalRules, baseAmount) {
    const now = new Date();
    
    for (const rule of seasonalRules) {
      if (!rule.validFrom || !rule.validTo) continue;
      
      const validFrom = new Date(rule.validFrom);
      const validTo = new Date(rule.validTo);
      
      if (now >= validFrom && now <= validTo) {
        return {
          discount: baseAmount * (rule.percentage / 100),
          season: rule.season,
          percentage: rule.percentage
        };
      }
    }
    
    return { discount: 0, season: null, percentage: 0 };
  }
  
  /**
   * Get human-readable discount description
   */
  static getDiscountDescription(appliedRules, totalDiscount, baseAmount) {
    if (appliedRules.length === 0 || totalDiscount === 0) {
      return null;
    }
    
    const percentage = ((totalDiscount / baseAmount) * 100).toFixed(0);
    
    if (appliedRules.some(rule => rule.includes('simple'))) {
      return `${percentage}% special discount applied`;
    }
    
    if (appliedRules.some(rule => rule.includes('bulk'))) {
      return `${percentage}% bulk booking discount`;
    }
    
    if (appliedRules.some(rule => rule.includes('couple'))) {
      return `${percentage}% couple discount`;
    }
    
    if (appliedRules.some(rule => rule.includes('seasonal'))) {
      return `${percentage}% seasonal discount`;
    }
    
    return `${percentage}% discount applied`;
  }
  
  /**
   * Validate pricing inputs
   */
  static validatePricingInputs(experience, occupancy, sessionCount) {
    if (!experience) {
      throw new Error('Experience not found');
    }
    
    if (!['Single', 'Couple'].includes(occupancy)) {
      throw new Error('Invalid occupancy type. Must be Single or Couple');
    }
    
    if (!experience.occupancyOptions.includes(occupancy)) {
      throw new Error(`${occupancy} occupancy not available for this experience`);
    }
    
    if (!sessionCount || sessionCount < 1 || sessionCount > 20) {
      throw new Error('Session count must be between 1 and 20');
    }
    
    if (occupancy === 'Single' && !experience.priceSingle) {
      throw new Error('Single occupancy price not set for this experience');
    }
    
    if (occupancy === 'Couple' && !experience.priceCouple) {
      throw new Error('Couple occupancy price not set for this experience');
    }
  }
  
  /**
   * Format pricing for display
   */
  static formatPricingDisplay(pricing) {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    });
    
    return {
      baseAmount: formatter.format(pricing.baseAmount),
      totalDiscount: formatter.format(pricing.discounts.totalDiscount),
      subtotal: formatter.format(pricing.breakdown.subtotal),
      totalTax: formatter.format(pricing.taxes.totalTax),
      totalAmount: formatter.format(pricing.totalAmount),
      savings: pricing.discounts.totalDiscount > 0 ? formatter.format(pricing.discounts.totalDiscount) : null,
      discountDescription: pricing.discounts.discountDescription
    };
  }
  
  /**
   * Preview discount for given parameters (useful for admin)
   */
  static previewDiscount(experience, occupancy, sessionCount) {
    try {
      const pricing = this.calculatePilgrimPricing(experience, occupancy, sessionCount);
      return {
        success: true,
        baseAmount: pricing.baseAmount,
        discount: pricing.discounts.totalDiscount,
        finalAmount: pricing.totalAmount,
        discountPercentage: pricing.baseAmount > 0 ? 
          ((pricing.discounts.totalDiscount / pricing.baseAmount) * 100).toFixed(2) : 0,
        appliedRules: pricing.discounts.appliedRules,
        discountType: pricing.discounts.discountType
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate pricing for Wellness Guide Class booking
   * @param {Object} wellnessClass - WellnessGuideClass document
   * @param {Array} selectedSlots - Array of TimeSlot documents (must belong to the class)
   * @param {Number} attendeeCount - Number of attendees being booked for every slot
   * @returns {Object} pricing breakdown similar to pilgrim pricing structure
   */
  static calculateWellnessClassPricing(wellnessClass, selectedSlots, attendeeCount) {
    // ----- Basic validation -----
    if (!wellnessClass) {
      throw new Error('Class not found');
    }
    if (!selectedSlots || selectedSlots.length === 0) {
      throw new Error('At least one time slot must be selected');
    }
    if (!attendeeCount || attendeeCount < 1 || attendeeCount > 100) {
      throw new Error('attendeeCount must be between 1 and 100');
    }

    // Make sure all slots share the same mode (online/offline) for margin/discount logic
    const mode = selectedSlots[0].mode;
    if (!selectedSlots.every((s) => s.mode === mode)) {
      throw new Error('Mixed booking modes are not supported. Select slots of the same mode.');
    }

    // ----- Base Amount -----
    const slotPriceTotal = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    const baseAmount = slotPriceTotal * attendeeCount;

    // ----- Discount calculation (tier-based defined in adminSettings) -----
    let totalDiscount = 0;
    let appliedRule = null;
    const discountConfigKey = mode === 'online' ? 'onlineDiscount' : 'offlineDiscount';
    const discountConfig = wellnessClass.adminSettings?.[discountConfigKey];

    if (discountConfig?.isEnabled && Array.isArray(discountConfig.tiers)) {
      const classCount = selectedSlots.length;
      discountConfig.tiers.forEach((tier) => {
        if (classCount >= tier.minClasses) {
          const discountAmt = (baseAmount * tier.discountPercentage) / 100;
          if (discountAmt > totalDiscount) {
            totalDiscount = discountAmt;
            appliedRule = `${tier.minClasses}_classes_${tier.discountPercentage}_percent`;
          }
        }
      });
    }

    // ----- Taxes (placeholder – all zeros for now) -----
    const taxes = {
      gst: 0,
      serviceTax: 0,
      tds: 0,
      tourismTax: 0,
      totalTax: 0,
    };

    const discountedAmount = baseAmount - totalDiscount;
    const totalAmount = discountedAmount + taxes.totalTax; // currently same as discountedAmount

    // ----- Platform Margin -----
    const platformMarginPerc = wellnessClass.adminSettings?.platformMargin?.[mode] || 0;
    const platformMarginAmount = (discountedAmount * platformMarginPerc) / 100;
    const guideEarning = discountedAmount - platformMarginAmount;

    return {
      baseAmount,
      discounts: {
        bulkDiscount: totalDiscount,
        totalDiscount,
        appliedRule,
      },
      taxes,
      platformMargin: {
        percentage: platformMarginPerc,
        appliedTo: mode,
        amount: platformMarginAmount,
      },
      totalAmount,
      guideEarning,
      platformEarning: platformMarginAmount,
      breakdown: {
        slotPriceTotal,
        attendeeCount,
        classCount: selectedSlots.length,
        totalDiscount,
        totalTax: taxes.totalTax,
        finalAmount: totalAmount,
      },
    };
  }
}

module.exports = PricingService;