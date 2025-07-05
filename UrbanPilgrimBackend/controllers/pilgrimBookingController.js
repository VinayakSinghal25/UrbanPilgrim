// controllers/pilgrimBookingController.js
const Booking = require('../models/Booking');
const PilgrimExperience = require('../models/PilgrimExperience');
const PricingService = require('../services/pricingService');
const RazorpayService = require('../services/razorpayService');

class PilgrimBookingController {

  /**
   * GET /api/bookings/pilgrim/review
   * Show booking details before payment (no DB object created yet)
   */
  static async getBookingReview(req, res) {
    try {
      const { experienceId, occupancy, sessionCount, selectedDates } = req.query;
      
      // Validate required parameters
      if (!experienceId || !occupancy || !sessionCount || !selectedDates) {
        return res.status(400).json({
          success: false,
          message: 'Missing required booking parameters'
        });
      }

      // Validate session count
      const sessions = parseInt(sessionCount);
      if (sessions < 1 || sessions > 10) {
        return res.status(400).json({
          success: false,
          message: 'Session count must be between 1 and 10'
        });
      }

      // Validate occupancy
      if (!['Single', 'Couple'].includes(occupancy)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid occupancy type'
        });
      }

      // Parse and validate dates
      const dates = JSON.parse(selectedDates);
      if (!dates.from || !dates.to) {
        return res.status(400).json({
          success: false,
          message: 'Both from and to dates are required'
        });
      }

      // Get experience details
      const experience = await PilgrimExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience not found'
        });
      }

      // Validate availability
      const isAvailable = await PilgrimBookingController.validateAvailability(
        experienceId, 
        dates
      );
      
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Selected dates are not available'
        });
      }

      // Calculate pricing with discounts
      const pricingDetails = PricingService.calculatePilgrimPricing(
        experience,
        occupancy,
        sessions,
        dates
      );

      // Generate preview booking ID (not saved to DB)
      const previewBookingId = `PREVIEW_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      // Return booking review data
      res.json({
        success: true,
        data: {
          previewBookingId,
          experience: {
            id: experience._id,
            name: experience.name,
            location: experience.location,
            images: experience.images
          },
          bookingDetails: {
            occupancy,
            sessionCount: sessions,
            selectedDates: dates,
            totalPeople: occupancy === 'Single' ? sessions : sessions * 2
          },
          pricing: pricingDetails,
          termsAndConditions: experience.termsAndConditions,
          whatsIncluded: experience.whatsIncluded,
          whatsNotIncluded: experience.whatsNotIncluded
        }
      });

    } catch (error) {
      console.error('Get booking review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get booking review',
        error: error.message
      });
    }
  }

  /**
   * POST /api/bookings/pilgrim/create
   * Create booking and initiate payment
   */
  static async createBooking(req, res) {
    try {
      const { experienceId, occupancy, sessionCount, selectedDates, userConsent } = req.body;

      // JWT may store userId or id depending on generator
      const userId = req.user.userId || req.user.id;

      // Fetch fresh user document to get name / phone / email (avoids stale token data)
      const userDoc = await require('../models/User').findById(userId).lean();

      if (!userDoc) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }

      // Validate user consent
      if (!userConsent) {
        return res.status(400).json({
          success: false,
          message: 'User consent is required to proceed'
        });
      }

      // Re-validate all parameters (security check)
      const experience = await PilgrimExperience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience not found'
        });
      }

      const isAvailable = await PilgrimBookingController.validateAvailability(
        experienceId, 
        selectedDates
      );
      
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Selected dates are no longer available'
        });
      }

      // Calculate final pricing
      const pricingDetails = PricingService.calculatePilgrimPricing(
        experience,
        occupancy,
        parseInt(sessionCount),
        selectedDates
      );

      // Generate unique IDs quickly (timestamp + random) to avoid duplicate key collisions
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
      const bookingId = `BOK_${timestamp}_${randomStr}`;
      const requestId = `REQ_${timestamp}_${Math.random().toString(36).substr(2,6).toUpperCase()}`;

      // Create booking object
      const bookingData = {
        bookingId,
        requestId,
        bookingType: 'pilgrim_experience',
        user: userId,
        entity: {
          entityType: 'PilgrimExperience',
          entityId: experienceId
        },
        bookingDetails: {
          occupancy,
          sessionCount: parseInt(sessionCount),
          selectedDates,
          totalPeople: occupancy === 'Single' ? parseInt(sessionCount) : parseInt(sessionCount) * 2
        },
        pricing: pricingDetails,
        status: 'payment_pending',
        // ===== REQUIRED PRIVACY & CUSTOMER INFO =====
        privacy: {
          dataProcessingConsent: true,
          dataProcessingConsentAt: new Date(),
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          consentMethod: 'checkbox',
          consentIpAddress: req.ip || req.connection.remoteAddress,
          consentUserAgent: req.get('User-Agent')
        },

        customerInfo: {
          name: `${userDoc.firstName} ${userDoc.lastName}`.trim(),
          email: userDoc.email,
          phone: userDoc.contactNumber || userDoc.phone || ''
        }
        // ... existing code ...
      };

      // Save booking to database
      const booking = new Booking(bookingData);
      await booking.save();

      // Create Razorpay order
      const razorpayOrder = await RazorpayService.createOrder({
        amount: pricingDetails.totalAmount,
        currency: 'INR',
        requestId: requestId,
        bookingId: bookingId,
        customerEmail: req.user.email,
        customerName: req.user.name,
        description: `Pilgrim Experience: ${experience.name}`
      });

      // Update booking with payment details
      booking.payment.razorpay.orderId = razorpayOrder.id;
      booking.payment.razorpay.orderCreatedAt = new Date();
      await booking.save();

      // Return payment URL for redirect
      res.json({
        success: true,
        data: {
          bookingId: booking.bookingId,
          paymentUrl: razorpayOrder.paymentUrl,
          orderId: razorpayOrder.id,
          amount: pricingDetails.totalAmount
        }
      });

    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }
  }

  /**
   * POST /api/bookings/pilgrim/payment-callback
   * Handle Razorpay payment success webhook
   */
  static async handlePaymentCallback(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // Verify payment signature
      const isValid = RazorpayService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      // Find booking by Razorpay order ID
      const booking = await Booking.findOne({
        'payment.razorpay.orderId': razorpay_order_id
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Update booking with successful payment
      booking.status = 'confirmed';
      booking.payment.razorpay.paymentId = razorpay_payment_id;
      booking.payment.razorpay.signature = razorpay_signature;
      booking.payment.status = 'completed';
      booking.payment.paidAt = new Date();
      booking.payment.paidAmount = booking.pricing.totalAmount;

      await booking.save();

      // TODO: Send confirmation email
      // TODO: Update availability

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          bookingId: booking.bookingId,
          status: booking.status
        }
      });

    } catch (error) {
      console.error('Payment callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process payment callback',
        error: error.message
      });
    }
  }

  /**
   * POST /api/bookings/pilgrim/payment-failed
   * Handle Razorpay payment failure
   */
  static async handlePaymentFailure(req, res) {
    try {
      const { razorpay_order_id, error_code, error_description } = req.body;

      // Find booking by Razorpay order ID
      const booking = await Booking.findOne({
        'payment.razorpay.orderId': razorpay_order_id
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Update booking with failed payment
      booking.status = 'payment_failed';
      booking.payment.status = 'failed';
      booking.payment.failureReason = error_description || 'Payment failed';
      booking.payment.errorCode = error_code;
      booking.payment.failedAt = new Date();

      await booking.save();

      res.json({
        success: true,
        message: 'Payment failure recorded',
        data: {
          bookingId: booking.bookingId,
          status: booking.status,
          canRetry: true // User can try payment again
        }
      });

    } catch (error) {
      console.error('Payment failure error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process payment failure',
        error: error.message
      });
    }
  }

  /**
   * GET /api/bookings/pilgrim/:bookingId
   * Get booking details
   */
  static async getBookingDetails(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      const booking = await Booking.findOne({
        bookingId,
        user: userId
      }).populate('entity.entityId');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      res.json({
        success: true,
        data: booking
      });

    } catch (error) {
      console.error('Get booking details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get booking details',
        error: error.message
      });
    }
  }

  /**
   * GET /api/bookings/pilgrim/user/history
   * Get user's booking history
   */
  static async getUserBookingHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const query = {
        user: userId,
        bookingType: 'pilgrim_experience'
      };

      // Filter by status if provided
      if (status && ['confirmed', 'payment_pending', 'payment_failed', 'cancelled'].includes(status)) {
        query.status = status;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: {
          path: 'entity.entityId',
          select: 'name location images'
        }
      };

      const result = await Booking.paginate(query, options);

      res.json({
        success: true,
        data: {
          bookings: result.docs,
          totalBookings: result.totalDocs,
          totalPages: result.totalPages,
          currentPage: result.page,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage
        }
      });

    } catch (error) {
      console.error('Get user booking history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get booking history',
        error: error.message
      });
    }
  }

  /**
   * GET /api/bookings/pilgrim/user/active
   * Get user's active bookings (confirmed + upcoming)
   */
  static async getUserActiveBookings(req, res) {
    try {
      const userId = req.user.id;
      const currentDate = new Date();

      const activeBookings = await Booking.find({
        user: userId,
        bookingType: 'pilgrim_experience',
        status: 'confirmed',
        'bookingDetails.selectedDates.from': { $gte: currentDate }
      })
      .populate('entity.entityId', 'name location images')
      .sort({ 'bookingDetails.selectedDates.from': 1 });

      res.json({
        success: true,
        data: {
          activeBookings,
          count: activeBookings.length
        }
      });

    } catch (error) {
      console.error('Get active bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active bookings',
        error: error.message
      });
    }
  }

  /**
   * POST /api/bookings/pilgrim/:bookingId/cancel
   * Cancel a booking
   */
  static async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { cancellationReason } = req.body;
      const userId = req.user.id;

      // Find booking
      const booking = await Booking.findOne({
        bookingId,
        user: userId,
        bookingType: 'pilgrim_experience'
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if booking can be cancelled
      if (booking.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Only confirmed bookings can be cancelled'
        });
      }

      // Check cancellation deadline (48 hours before experience)
      const experienceDate = new Date(booking.bookingDetails.selectedDates.from);
      const currentDate = new Date();
      const hoursUntilExperience = (experienceDate - currentDate) / (1000 * 60 * 60);

      if (hoursUntilExperience < 48) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation not allowed within 48 hours of experience'
        });
      }

      // Calculate refund amount (example: 90% refund)
      const refundPercentage = 0.90;
      const refundAmount = Math.round(booking.pricing.totalAmount * refundPercentage);

      // Update booking status
      booking.status = 'cancelled';
      booking.cancellation = {
        cancelledAt: new Date(),
        cancelledBy: userId,
        reason: cancellationReason || 'User requested cancellation',
        refundAmount: refundAmount,
        refundStatus: 'pending'
      };

      await booking.save();

      // TODO: Initiate refund process with Razorpay
      // TODO: Send cancellation email

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: {
          bookingId: booking.bookingId,
          status: booking.status,
          refundAmount: refundAmount,
          refundStatus: 'pending'
        }
      });

    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: error.message
      });
    }
  }

  /**
   * POST /api/bookings/pilgrim/:bookingId/request-refund
   * Request refund for a cancelled booking
   */
  static async requestRefund(req, res) {
    try {
      const { bookingId } = req.params;
      const { refundReason } = req.body;
      const userId = req.user.id;

      // Find cancelled booking
      const booking = await Booking.findOne({
        bookingId,
        user: userId,
        status: 'cancelled',
        bookingType: 'pilgrim_experience'
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Cancelled booking not found'
        });
      }

      // Check if refund already processed
      if (booking.cancellation?.refundStatus === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Refund already processed'
        });
      }

      // Update refund request
      booking.cancellation.refundReason = refundReason;
      booking.cancellation.refundRequestedAt = new Date();
      booking.cancellation.refundStatus = 'requested';

      await booking.save();

      // TODO: Notify admin for manual refund processing

      res.json({
        success: true,
        message: 'Refund request submitted successfully',
        data: {
          bookingId: booking.bookingId,
          refundAmount: booking.cancellation.refundAmount,
          refundStatus: booking.cancellation.refundStatus
        }
      });

    } catch (error) {
      console.error('Request refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to request refund',
        error: error.message
      });
    }
  }

  /**
   * POST /api/bookings/pilgrim/:bookingId/add-travelers
   * Add traveler details after payment (optional)
   */
  static async addTravelerDetails(req, res) {
    try {
      const { bookingId } = req.params;
      const { travelers } = req.body;
      const userId = req.user.id;

      // Find confirmed booking
      const booking = await Booking.findOne({
        bookingId,
        user: userId,
        status: 'confirmed',
        bookingType: 'pilgrim_experience'
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Confirmed booking not found'
        });
      }

      // Validate traveler count
      const expectedTravelers = booking.bookingDetails.totalPeople;
      if (travelers.length !== expectedTravelers) {
        return res.status(400).json({
          success: false,
          message: `Expected ${expectedTravelers} travelers, but received ${travelers.length}`
        });
      }

      // Validate traveler details
      for (let traveler of travelers) {
        if (!traveler.name || !traveler.age) {
          return res.status(400).json({
            success: false,
            message: 'Each traveler must have name and age'
          });
        }
      }

      // Update booking with traveler details
      booking.travelers = travelers;
      booking.travelersAddedAt = new Date();

      await booking.save();

      res.json({
        success: true,
        message: 'Traveler details added successfully',
        data: {
          bookingId: booking.bookingId,
          travelers: booking.travelers
        }
      });

    } catch (error) {
      console.error('Add traveler details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add traveler details',
        error: error.message
      });
    }
  }

  /**
   * GET /api/bookings/pilgrim/:bookingId/receipt
   * Download booking receipt/invoice
   */
  static async downloadReceipt(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      const booking = await Booking.findOne({
        bookingId,
        user: userId,
        status: 'confirmed',
        bookingType: 'pilgrim_experience'
      }).populate('entity.entityId');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Confirmed booking not found'
        });
      }

      // Generate receipt data
      const receiptData = {
        bookingId: booking.bookingId,
        bookingDate: booking.createdAt,
        experience: booking.entity.entityId,
        customer: req.user,
        bookingDetails: booking.bookingDetails,
        pricing: booking.pricing,
        payment: booking.payment
      };

      // TODO: Generate PDF receipt
      // For now, return JSON receipt data

      res.json({
        success: true,
        message: 'Receipt generated successfully',
        data: receiptData
      });

    } catch (error) {
      console.error('Download receipt error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate receipt',
        error: error.message
      });
    }
  }

  // Helper Methods
  static async validateAvailability(experienceId, selectedDates) {
    try {
      const experience = await PilgrimExperience.findById(experienceId);
      if (!experience) return false;

      const requestedFrom = new Date(selectedDates.from);
      const requestedTo = new Date(selectedDates.to);

      // Check if requested dates fall within any available date range
      const isAvailable = experience.availableDates.some(dateRange => {
        const availableFrom = new Date(dateRange.from);
        const availableTo = new Date(dateRange.to);
        
        return requestedFrom >= availableFrom && requestedTo <= availableTo;
      });

      return isAvailable;
    } catch (error) {
      console.error('Validate availability error:', error);
      return false;
    }
  }

  static async generateBookingId() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get today's booking count for sequential numbering
    const todayStart = new Date(date.setHours(0, 0, 0, 0));
    const todayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const todayBookingsCount = await Booking.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      bookingType: 'pilgrim_experience'
    });

    const sequentialNumber = String(todayBookingsCount + 1).padStart(5, '0');
    return `BOK_${dateStr}_${sequentialNumber}`;
  }

  static generateRequestId() {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `REQ_${timestamp}_${randomStr}`;
  }
}

module.exports = PilgrimBookingController;