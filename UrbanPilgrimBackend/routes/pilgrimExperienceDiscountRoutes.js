// routes/pilgrimExperienceDiscountRoutes.js
const express = require('express');
const router = express.Router();
const PilgrimExperienceDiscountController = require('../controllers/pilgrimExperienceDiscountController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// Simple discount management
router.post('/:experienceId/discount/simple', PilgrimExperienceDiscountController.enableSimpleDiscount);
router.delete('/:experienceId/discount/simple', PilgrimExperienceDiscountController.disableSimpleDiscount);

// Advanced discount rules
router.post('/:experienceId/discount/bulk', PilgrimExperienceDiscountController.addBulkDiscountRule);
router.post('/:experienceId/discount/couple', PilgrimExperienceDiscountController.addCoupleDiscountRule);

// Get discount preview
router.get('/:experienceId/discount/preview', PilgrimExperienceDiscountController.previewDiscount);

// Get/Remove all discounts
router.get('/:experienceId/discounts', PilgrimExperienceDiscountController.getExperienceDiscounts);
router.delete('/:experienceId/discounts', PilgrimExperienceDiscountController.removeAllDiscounts);

module.exports = router;