// routes/pilgrimBookingRoutes.js
const express = require('express');
const router = express.Router();
const PilgrimBookingController = require('../controllers/pilgrimBookingController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public routes (no auth required)
router.get('/pilgrim/review', PilgrimBookingController.getBookingReview);

// Protected routes (authentication required)
router.use(authMiddleware);

// HIGH PRIORITY - Core booking flow
router.post('/pilgrim/create', PilgrimBookingController.createBooking);
router.post('/pilgrim/payment-callback', PilgrimBookingController.handlePaymentCallback);
router.post('/pilgrim/payment-failed', PilgrimBookingController.handlePaymentFailure);

// HIGH PRIORITY - User booking management (MUST come before parameterized routes)
router.get('/pilgrim/user/history', PilgrimBookingController.getUserBookingHistory);
router.get('/pilgrim/user/active', PilgrimBookingController.getUserActiveBookings);

// Parameterized routes (MUST come after specific routes)
router.get('/pilgrim/:bookingId', PilgrimBookingController.getBookingDetails);

// MEDIUM PRIORITY - Booking modifications
router.post('/pilgrim/:bookingId/cancel', PilgrimBookingController.cancelBooking);
router.post('/pilgrim/:bookingId/request-refund', PilgrimBookingController.requestRefund);

// LOW PRIORITY - Additional features
router.get('/pilgrim/:bookingId/receipt', PilgrimBookingController.downloadReceipt);
router.post('/pilgrim/:bookingId/add-travelers', PilgrimBookingController.addTravelerDetails);

module.exports = router;