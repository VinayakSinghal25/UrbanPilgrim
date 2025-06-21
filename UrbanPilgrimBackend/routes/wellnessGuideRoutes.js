// routes/wellnessGuideRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createWellnessGuide,
  getWellnessGuideProfile,
  updateWellnessGuideProfile,
  getAllWellnessGuides,
  updateWellnessGuideApproval,
  getPendingWellnessGuides,
  checkWellnessGuideEligibility
  //getWellnessGuideFormData
} = require('../controllers/wellnessGuideController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleCheck');
const ROLES = require('../models/RoleEnum');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public routes
router.get('/', getAllWellnessGuides);

// Protected routes (require authentication)
router.get('/eligibility', authMiddleware, checkWellnessGuideEligibility);
//router.get('/form-data', authMiddleware, getWellnessGuideFormData);
router.post('/', authMiddleware, upload.array('profilePictures', 5), createWellnessGuide);
router.get('/profile', authMiddleware, getWellnessGuideProfile);
router.put('/profile', authMiddleware, upload.array('profilePictures', 5), updateWellnessGuideProfile);

// Admin only routes
router.get('/pending', authMiddleware, authorize(ROLES.ADMIN), getPendingWellnessGuides);
router.put('/:id/approval', authMiddleware, authorize(ROLES.ADMIN), updateWellnessGuideApproval);

module.exports = router;