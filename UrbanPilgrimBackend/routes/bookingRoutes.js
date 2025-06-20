// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAvailability,
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
} = require('../controllers/BookingController');
const { protect } = require('../middleware/auth');

// Public route - get availability for an experience
router.get('/availability/:experienceId', getAvailability);

// Protected routes - require authentication
router.use(protect); // All routes below require authentication

router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/:bookingId', getBookingById);
router.patch('/:bookingId/cancel', cancelBooking);

module.exports = router;