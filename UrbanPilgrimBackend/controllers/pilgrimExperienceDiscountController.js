// controllers/pilgrimExperienceDiscountController.js
const PilgrimExperience = require('../models/PilgrimExperience');
const PricingService = require('../services/pricingService');

class PilgrimExperienceDiscountController {
  
  /**
   * Enable simple discount for an experience
   * POST /api/admin/pilgrim-experiences/:experienceId/discount/simple
   */
  static async enableSimpleDiscount(req, res) {
    try {
      const { experienceId } = req.params;
      const { percentage, description, validFrom, validTo } = req.body;
      
      // Validate percentage
      if (!percentage || percentage < 0 || percentage > 50) {
        return res.status(400).json({
          success: false,
          error: 'Discount percentage must be between 0 and 50'
        });
      }
      
      const experience = await PilgrimExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({
          success: false,
          error: 'Experience not found'
        });
      }
      
      // Validate dates if provided
      let validFromDate = null;
      let validToDate = null;
      
      if (validFrom) {
        validFromDate = new Date(validFrom);
        if (validFromDate < new Date()) {
          return res.status(400).json({
            success: false,
            error: 'Valid from date cannot be in the past'
          });
        }
      }
      
      if (validTo) {
        validToDate = new Date(validTo);
        if (validFromDate && validToDate <= validFromDate) {
          return res.status(400).json({
            success: false,
            error: 'Valid to date must be after valid from date'
          });
        }
      }
      
      // Update simple discount
      experience.simpleDiscount = {
        enabled: true,
        percentage: parseFloat(percentage),
        description: description || `${percentage}% special discount`,
        validFrom: validFromDate,
        validTo: validToDate
      };
      
      experience.discountStatus = 'simple';
      
      // Initialize discountMetadata if not exists
      if (!experience.discountMetadata) {
        experience.discountMetadata = {
          lastUpdated: new Date(),
          updatedBy: req.user._id,
          totalDiscountGiven: 0,
          discountUsageCount: 0
        };
      } else {
        experience.discountMetadata.lastUpdated = new Date();
        experience.discountMetadata.updatedBy = req.user._id;
      }
      
      await experience.save();
      
      // Generate discount preview
      const preview = this.getDiscountPreview(experience);
      
      res.json({
        success: true,
        message: 'Simple discount enabled successfully',
        discount: experience.simpleDiscount,
        preview: preview
      });
      
    } catch (error) {
      console.error('Error in enableSimpleDiscount:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Disable simple discount
   * DELETE /api/admin/pilgrim-experiences/:experienceId/discount/simple
   */
  static async disableSimpleDiscount(req, res) {
    try {
      const { experienceId } = req.params;
      
      const experience = await PilgrimExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({
          success: false,
          error: 'Experience not found'
        });
      }
      
      // Reset simple discount
      experience.simpleDiscount = undefined;
      experience.discountStatus = 'none';
      
      if (!experience.discountMetadata) {
        experience.discountMetadata = {};
      }
      experience.discountMetadata.lastUpdated = new Date();
      experience.discountMetadata.updatedBy = req.user._id;
      
      await experience.save();
      
      res.json({
        success: true,
        message: 'Simple discount disabled successfully'
      });
      
    } catch (error) {
      console.error('Error in disableSimpleDiscount:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Add bulk discount rule
   * POST /api/admin/pilgrim-experiences/:experienceId/discount/bulk
   */
  static async addBulkDiscountRule(req, res) {
    try {
      const { experienceId } = req.params;
      const { minSessions, percentage, description } = req.body;
      
      // Validate inputs
      if (!minSessions || minSessions < 1 || minSessions > 20) {
        return res.status(400).json({
          success: false,
          error: 'Minimum sessions must be between 1 and 20'
        });
      }
      
      if (!percentage || percentage < 0 || percentage > 50) {
        return res.status(400).json({
          success: false,
          error: 'Discount percentage must be between 0 and 50'
        });
      }
      
      const experience = await PilgrimExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({
          success: false,
          error: 'Experience not found'
        });
      }
      
      // Initialize discountRules if not exists
      if (!experience.discountRules) {
        experience.discountRules = { bulk: [], couple: [], seasonal: [] };
      }
      
      if (!experience.discountRules.bulk) {
        experience.discountRules.bulk = [];
      }
      
      // Check if rule with same minSessions already exists
      const existingRule = experience.discountRules.bulk.find(rule => rule.minSessions === parseInt(minSessions));
      if (existingRule) {
        return res.status(400).json({
          success: false,
          error: `Bulk discount rule for ${minSessions} sessions already exists`
        });
      }
      
      // Add new bulk rule
      const newRule = {
        minSessions: parseInt(minSessions),
        percentage: parseFloat(percentage),
        description: description || `${percentage}% off for ${minSessions}+ sessions`
      };
      
      experience.discountRules.bulk.push(newRule);
      experience.discountStatus = 'advanced';
      
      // Update metadata
      if (!experience.discountMetadata) {
        experience.discountMetadata = {};
      }
      experience.discountMetadata.lastUpdated = new Date();
      experience.discountMetadata.updatedBy = req.user._id;
      
      await experience.save();
      
      res.json({
        success: true,
        message: 'Bulk discount rule added successfully',
        rule: newRule,
        preview: this.getDiscountPreview(experience)
      });
      
    } catch (error) {
      console.error('Error in addBulkDiscountRule:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Add couple discount rule
   * POST /api/admin/pilgrim-experiences/:experienceId/discount/couple
   */
  static async addCoupleDiscountRule(req, res) {
    try {
      const { experienceId } = req.params;
      const { minSessions, percentage, description } = req.body;
      
      // Validate inputs
      if (!minSessions || minSessions < 1 || minSessions > 10) {
        return res.status(400).json({
          success: false,
          error: 'Minimum sessions must be between 1 and 10'
        });
      }
      
      if (!percentage || percentage < 0 || percentage > 30) {
        return res.status(400).json({
          success: false,
          error: 'Couple discount percentage must be between 0 and 30'
        });
      }
      
      const experience = await PilgrimExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({
          success: false,
          error: 'Experience not found'
        });
      }
      
      // Initialize discountRules if not exists
      if (!experience.discountRules) {
        experience.discountRules = { bulk: [], couple: [], seasonal: [] };
      }
      
      if (!experience.discountRules.couple) {
        experience.discountRules.couple = [];
      }
      
      // Check if rule with same minSessions already exists
      const existingRule = experience.discountRules.couple.find(rule => rule.minSessions === parseInt(minSessions));
      if (existingRule) {
        return res.status(400).json({
          success: false,
          error: `Couple discount rule for ${minSessions} sessions already exists`
        });
      }
      
      // Add new couple rule
      const newRule = {
        minSessions: parseInt(minSessions),
        percentage: parseFloat(percentage),
        description: description || `${percentage}% couple discount for ${minSessions}+ sessions`
      };
      
      experience.discountRules.couple.push(newRule);
      experience.discountStatus = 'advanced';
      
      // Update metadata
      if (!experience.discountMetadata) {
        experience.discountMetadata = {};
      }
      experience.discountMetadata.lastUpdated = new Date();
      experience.discountMetadata.updatedBy = req.user._id;
      
      await experience.save();
      
      res.json({
        success: true,
        message: 'Couple discount rule added successfully',
        rule: newRule,
        preview: this.getDiscountPreview(experience)
      });
      
    } catch (error) {
      console.error('Error in addCoupleDiscountRule:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Get all discounts for an experience
   * GET /api/admin/pilgrim-experiences/:experienceId/discounts
   */
  static async getExperienceDiscounts(req, res) {
    try {
      const { experienceId } = req.params;
      
      const experience = await PilgrimExperience.findById(experienceId).select('name simpleDiscount discountRules discountStatus discountMetadata');
      if (!experience) {
        return res.status(404).json({
          success: false,
          error: 'Experience not found'
        });
      }
      
      res.json({
        success: true,
        experience: {
          id: experience._id,
          name: experience.name,
          discountStatus: experience.discountStatus || 'none',
          simpleDiscount: experience.simpleDiscount,
          discountRules: experience.discountRules,
          discountMetadata: experience.discountMetadata
        },
        preview: this.getDiscountPreview(experience)
      });
      
    } catch (error) {
      console.error('Error in getExperienceDiscounts:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Remove all discounts
   * DELETE /api/admin/pilgrim-experiences/:experienceId/discounts
   */
  static async removeAllDiscounts(req, res) {
    try {
      const { experienceId } = req.params;
      
      const experience = await PilgrimExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({
          success: false,
          error: 'Experience not found'
        });
      }
      
      // Reset all discounts
      experience.simpleDiscount = undefined;
      experience.discountRules = undefined;
      experience.discountStatus = 'none';
      
      // Update metadata
      if (!experience.discountMetadata) {
        experience.discountMetadata = {};
      }
      experience.discountMetadata.lastUpdated = new Date();
      experience.discountMetadata.updatedBy = req.user._id;
      
      await experience.save();
      
      res.json({
        success: true,
        message: 'All discounts removed successfully'
      });
      
    } catch (error) {
      console.error('Error in removeAllDiscounts:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Preview discount for different scenarios
   * GET /api/admin/pilgrim-experiences/:experienceId/discount/preview
   */
  static async previewDiscount(req, res) {
    try {
      const { experienceId } = req.params;
      
      const experience = await PilgrimExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({
          success: false,
          error: 'Experience not found'
        });
      }
      
      const preview = this.getDiscountPreview(experience);
      
      res.json({
        success: true,
        preview
      });
      
    } catch (error) {
      console.error('Error in previewDiscount:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Helper method to generate discount preview
   */
  static getDiscountPreview(experience) {
    const scenarios = [
      { occupancy: 'Single', sessionCount: 1 },
      { occupancy: 'Single', sessionCount: 3 },
      { occupancy: 'Single', sessionCount: 5 },
      { occupancy: 'Couple', sessionCount: 1 },
      { occupancy: 'Couple', sessionCount: 3 },
      { occupancy: 'Couple', sessionCount: 5 }
    ];
    
    const previews = scenarios.map(scenario => {
      const preview = PricingService.previewDiscount(experience, scenario.occupancy, scenario.sessionCount);
      return {
        ...scenario,
        ...preview
      };
    });
    
    return previews;
  }
}

module.exports = PilgrimExperienceDiscountController;