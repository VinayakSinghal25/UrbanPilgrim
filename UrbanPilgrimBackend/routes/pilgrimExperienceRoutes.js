// routes/pilgrimExperienceRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createPilgrimExperience,
  getAllPilgrimExperiences,
  getPilgrimExperienceById,
  updatePilgrimExperience,
  deletePilgrimExperience // Add this
} = require('../controllers/PilgrimExperienceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const ROLES = require('../models/RoleEnum');

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Public routes
router.get('/', getAllPilgrimExperiences);
router.get('/:id', getPilgrimExperienceById);

// Admin-only routes
router.post(
  '/',
  protect,
  authorize(ROLES.ADMIN),
  upload.array('images', 10),
  createPilgrimExperience
);

router.put(
  '/:id',
  protect,
  authorize(ROLES.ADMIN),
  upload.array('images', 10),
  updatePilgrimExperience
);

router.delete(
  '/:id',
  protect,
  authorize(ROLES.ADMIN),
  deletePilgrimExperience
);

module.exports = router;