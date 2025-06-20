// routes/wellnessGuideClassRoutes.js
const express = require('express');
const router = express.Router();
const {
  createWellnessGuideClass,
  getMyClasses,
  getClassDetails,
  getScheduleRequestStatus
} = require('../controllers/wellnessGuideClassController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleCheck');
const ROLES = require('../models/RoleEnum');

// Public routes
router.get('/:id', getClassDetails);

// Protected routes (require authentication)
router.post('/', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), createWellnessGuideClass);
router.get('/my/classes', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), getMyClasses);
router.get('/schedule-status/:requestId', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), getScheduleRequestStatus);

module.exports = router;