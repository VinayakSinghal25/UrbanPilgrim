// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import all controller functions
const {
  registerUser,
  googleAuth,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('../controllers/userController');

// Import middleware
const { protect } = require('../middleware/auth');
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
router.post('/register', upload.array('profilePictures', 3), registerUser);
router.post('/login', loginUser);
router.post('/google-auth', googleAuth);

// Protected routes (require authentication)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.array('profilePictures', 3), updateUserProfile);
router.post('/verify-email', protect, verifyEmail);

// Admin only routes (fixed - use string instead of ROLES constant)
router.get('/', protect, authorize('ADMIN'), getAllUsers);
router.get('/:id', protect, authorize('ADMIN'), getUserById);
router.put('/:id', protect, authorize('ADMIN'), updateUserById);
router.delete('/:id', protect, authorize('ADMIN'), deleteUserById);

module.exports = router;