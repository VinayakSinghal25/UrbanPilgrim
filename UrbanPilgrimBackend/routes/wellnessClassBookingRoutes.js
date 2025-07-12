// UrbanPilgrimBackend/routes/wellnessClassBookingRoutes.js
const express = require('express');
const router = express.Router();
const WellnessClassBookingController = require('../controllers/wellnessClassBookingController');
const { authMiddleware } = require('../middleware/authMiddleware');

// -------- PUBLIC ROUTES ---------
router.get('/class/review', WellnessClassBookingController.getBookingReview);

// Payment callback routes (auth required)
router.post('/class/payment-callback', authMiddleware, WellnessClassBookingController.handlePaymentCallback);
router.post('/class/payment-failed', authMiddleware, WellnessClassBookingController.handlePaymentFailure);

// -------- PROTECTED ROUTES (requires auth) ---------
router.use(authMiddleware);

// Core booking flow
router.post('/class/create', WellnessClassBookingController.createBooking);
// TODO: Payment callbacks & further actions can be added later

module.exports = router; 