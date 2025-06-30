// routes/adminPilgrimBookingRoutes.js
const express = require('express');
const router = express.Router();
const AdminPilgrimBookingController = require('../controllers/adminPilgrimBookingController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleCheck');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(authorize('admin'));

// Booking management
router.get('/pilgrim', AdminPilgrimBookingController.getAllBookings);

// Analytics and insights (MUST come before parameterized routes)
router.get('/pilgrim/analytics', AdminPilgrimBookingController.getBookingAnalytics);

// Parameterized routes (MUST come after specific routes)
router.get('/pilgrim/:bookingId', AdminPilgrimBookingController.getBookingDetails);

// Refund management
router.post('/pilgrim/:bookingId/process-refund', AdminPilgrimBookingController.processRefund);

// Maintenance
router.post('/cleanup-abandoned', AdminPilgrimBookingController.cleanupAbandonedBookings);

module.exports = router;