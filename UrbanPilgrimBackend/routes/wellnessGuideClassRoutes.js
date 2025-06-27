// routes/wellnessGuideClassRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createWellnessGuideClass,
  updateWellnessGuideClass,
  getMyAddresses,
  getMyClasses,
  getClassDetails,
  getScheduleRequestStatus,
  updatePlatformMargin,
  updateDiscountSettings,
  getPendingClasses,
  updateClassApproval,
  getAllClassesForAdmin,
  addTimeSlots,
  removeTimeSlot,
  addRecurringTimeSlots,
  getScheduleExtensionInfo,
  updateClassDetails,
  getAllApprovedClasses
} = require('../controllers/wellnessGuideClassController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleCheck');
const ROLES = require('../models/RoleEnum');

// Configure multer for file uploads (following your pattern)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', getAllApprovedClasses);
router.get('/:id', getClassDetails);

// Protected routes (require authentication) - SPECIFIC PATHS FIRST
router.get('/my/classes', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), getMyClasses);
router.get('/my/addresses', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), getMyAddresses);
router.get('/schedule-status/:requestId', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), getScheduleRequestStatus);

// NEW ROUTE - Schedule extension info
router.get('/:id/schedule-extension-info', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), getScheduleExtensionInfo);

// Class management routes
router.post('/', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), upload.array('photos', 5), createWellnessGuideClass);
router.put('/:id', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), upload.array('photos', 5), updateWellnessGuideClass);

// NEW ROUTE - Update class details (non-schedule changes)
router.put('/:id/details', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), upload.array('photos', 5), updateClassDetails);

// Time slot management routes - UPDATED TO ACCEPT CLASS ID
router.post('/:classId/time-slots', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), addTimeSlots);
router.post('/:classId/recurring-time-slots', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), addRecurringTimeSlots);
router.delete('/:classId/time-slots/:slotId', authMiddleware, authorize(ROLES.WELLNESS_GUIDE), removeTimeSlot);

// Admin routes - SPECIFIC PATHS FIRST
router.get('/admin/pending', authMiddleware, authorize(ROLES.ADMIN), getPendingClasses);
router.get('/admin/all', authMiddleware, authorize(ROLES.ADMIN), getAllClassesForAdmin);
router.put('/:id/approval', authMiddleware, authorize(ROLES.ADMIN), updateClassApproval);
router.patch('/:id/platform-margin', authMiddleware, authorize(ROLES.ADMIN), updatePlatformMargin);
router.patch('/:id/discount-settings', authMiddleware, authorize(ROLES.ADMIN), updateDiscountSettings);

module.exports = router;