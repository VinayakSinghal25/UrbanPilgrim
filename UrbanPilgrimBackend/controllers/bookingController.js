// controllers/BookingController.js
const Booking = require('../models/Booking');
const PilgrimExperience = require('../models/PilgrimExperience');

// Get available dates and time slots for an experience
const getAvailability = async (req, res) => {
  try {
    const { experienceId } = req.params;
    
    const experience = await PilgrimExperience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    // Get existing bookings for this experience
    const existingBookings = await Booking.find({
      pilgrimExperience: experienceId,
      status: { $in: ['pending', 'confirmed'] }
    });

    // Calculate availability for each date and time slot
    const availability = [];
    
    for (const availableDate of experience.availableDates) {
      if (!availableDate.isActive) continue;
      
      const dateAvailability = {
        date: availableDate.date,
        dayOfWeek: availableDate.dayOfWeek,
        timeSlots: []
      };

      for (const timeSlot of availableDate.timeSlots) {
        // Count existing bookings for this date and time slot
        const bookedCount = existingBookings.reduce((count, booking) => {
          const isSameDate = booking.bookingDate.toDateString() === availableDate.date.toDateString();
          const isSameTime = booking.timeSlot.startTime === timeSlot.startTime && 
                           booking.timeSlot.endTime === timeSlot.endTime;
          
          if (isSameDate && isSameTime) {
            return count + booking.participants;
          }
          return count;
        }, 0);

        const availableSpots = timeSlot.capacity - bookedCount;

        if (availableSpots > 0) {
          dateAvailability.timeSlots.push({
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            capacity: timeSlot.capacity,
            availableSpots,
            bookedSpots: bookedCount
          });
        }
      }

      if (dateAvailability.timeSlots.length > 0) {
        availability.push(dateAvailability);
      }
    }

    res.status(200).json({
      message: 'Availability retrieved successfully',
      experienceId,
      experienceName: experience.name,
      availability
    });
  } catch (error) {
    console.error('Get Availability Error:', error);
    res.status(500).json({ message: 'Server error retrieving availability', error: error.message });
  }
};

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      experienceId,
      bookingDate,
      timeSlot, // { startTime, endTime }
      participants = 1
    } = req.body;

    // Validate experience exists
    const experience = await PilgrimExperience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    // Check if the selected date and time slot are available
    const selectedDate = new Date(bookingDate);
    const availableDate = experience.availableDates.find(
      date => date.date.toDateString() === selectedDate.toDateString() && date.isActive
    );

    if (!availableDate) {
      return res.status(400).json({ message: 'Selected date is not available' });
    }

    const availableTimeSlot = availableDate.timeSlots.find(
      slot => slot.startTime === timeSlot.startTime && slot.endTime === timeSlot.endTime
    );

    if (!availableTimeSlot) {
      return res.status(400).json({ message: 'Selected time slot is not available' });
    }

    // Check capacity
    const existingBookings = await Booking.find({
      pilgrimExperience: experienceId,
      bookingDate: selectedDate,
      'timeSlot.startTime': timeSlot.startTime,
      'timeSlot.endTime': timeSlot.endTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    const currentBookedCount = existingBookings.reduce((count, booking) => count + booking.participants, 0);
    
    if (currentBookedCount + participants > availableTimeSlot.capacity) {
      return res.status(400).json({ 
        message: 'Not enough spots available',
        available: availableTimeSlot.capacity - currentBookedCount,
        requested: participants
      });
    }

    // Calculate total price
    const totalPrice = experience.price * participants;

    // Create booking
    const booking = new Booking({
      user: req.user.userId,
      pilgrimExperience: experienceId,
      bookingDate: selectedDate,
      timeSlot,
      participants,
      totalPrice
    });

    await booking.save();

    // Populate the booking with experience and user details
    await booking.populate([
      { path: 'pilgrimExperience', select: 'name location price' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Server error creating booking', error: error.message });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .populate('pilgrimExperience', 'name location images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Bookings retrieved successfully',
      bookings
    });
  } catch (error) {
    console.error('Get User Bookings Error:', error);
    res.status(500).json({ message: 'Server error retrieving bookings', error: error.message });
  }
};

// Get single booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate('pilgrimExperience')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({
      message: 'Booking retrieved successfully',
      booking
    });
  } catch (error) {
    console.error('Get Booking Error:', error);
    res.status(500).json({ message: 'Server error retrieving booking', error: error.message });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking can be cancelled (e.g., not already completed)
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({ message: 'Server error cancelling booking', error: error.message });
  }
};

module.exports = {
  getAvailability,
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
};