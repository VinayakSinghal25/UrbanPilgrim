const express = require('express');
const router = express.Router();
const { createSpecialty, getAllSpecialties } = require('../controllers/specialtyController');
// POST /api/specialties/create
router.post('/create', createSpecialty);
router.get('/', getAllSpecialties); // 🔥 GET /api/specialties
module.exports = router;
