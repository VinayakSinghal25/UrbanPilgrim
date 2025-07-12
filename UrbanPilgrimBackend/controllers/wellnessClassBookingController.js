// UrbanPilgrimBackend/controllers/wellnessClassBookingController.js
const Booking = require('../models/Booking');
const WellnessGuideClass = require('../models/WellnessGuideClass');
const TimeSlot = require('../models/TimeSlot');
const RazorpayService = require('../services/razorpayService');
const User = require('../models/User');
const PricingService = require('../services/pricingService');

// -----------------------------------------------------------------------------
// Helper: update booking payment success/failure (internal)
// -----------------------------------------------------------------------------

class WellnessClassBookingController {
  /**
   * GET /api/bookings/class/review
   * Public – preview booking & pricing before payment
   */
  static async getBookingReview(req, res) {
    try {
      const { classId, slotIds, attendeeCount } = req.query;

      if (!classId || !slotIds || !attendeeCount) {
        return res.status(400).json({
          success: false,
          message: 'classId, slotIds and attendeeCount are required',
        });
      }

      const attendeeNum = parseInt(attendeeCount);
      if (attendeeNum < 1 || attendeeNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'attendeeCount must be between 1 and 100',
        });
      }

      // Parse slotIds (comma-separated or JSON array)
      let slotIdArr;
      try {
        slotIdArr = Array.isArray(slotIds)
          ? slotIds
          : typeof slotIds === 'string' && slotIds.startsWith('[')
          ? JSON.parse(slotIds)
          : slotIds.split(',');
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid slotIds format' });
      }

      // Fetch class & slots
      const wellnessClass = await WellnessGuideClass.findById(classId)
        .populate({
          path: 'wellnessGuide',
          select: 'user profilePictures',
          populate: { path: 'user', select: 'firstName lastName email' }
        });
      if (!wellnessClass) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }

      const slots = await TimeSlot.find({ _id: { $in: slotIdArr }, wellnessGuideClass: classId, isActive: true });
      if (slots.length !== slotIdArr.length) {
        return res.status(400).json({ success: false, message: 'One or more slots not available' });
      }

      // Validate capacity & future time
      const now = new Date();
      for (const slot of slots) {
        if (slot.availableSlots < attendeeNum) {
          return res.status(400).json({
            success: false,
            message: `Slot on ${slot.date.toISOString().slice(0, 10)} ${slot.startTime} is not available for ${attendeeNum} attendee(s)`,
          });
        }
        if (slot.endTimeUTC < now) {
          return res.status(400).json({ success: false, message: 'Cannot book past slots' });
        }
      }

      // Calculate pricing
      const pricing = PricingService.calculateWellnessClassPricing(wellnessClass, slots, attendeeNum);

      const previewBookingId = `PREVIEW_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      res.json({
        success: true,
        data: {
          previewBookingId,
          class: {
            id: wellnessClass._id,
            title: wellnessClass.title,
            wellnessGuide: {
              id: wellnessClass.wellnessGuide?._id,
              firstName: wellnessClass.wellnessGuide?.user?.firstName || '',
              lastName: wellnessClass.wellnessGuide?.user?.lastName || '',
              profilePictures: wellnessClass.wellnessGuide?.profilePictures || [],
            },
          },
          bookingDetails: {
            attendeeCount: attendeeNum,
            classCount: slots.length,
            selectedSlots: slots.map((s) => ({
              slotId: s._id,
              date: s.date,
              startTime: s.startTime,
              endTime: s.endTime,
              mode: s.mode,
            })),
          },
          pricing,
        },
      });
    } catch (error) {
      console.error('Class booking review error:', error);
      res.status(500).json({ success: false, message: 'Failed to get booking review', error: error.message });
    }
  }

  /**
   * POST /api/bookings/class/create
   * Protected – create booking & initiate payment
   */
  static async createBooking(req, res) {
    try {
      const { classId, slotIds, attendeeCount, userConsent } = req.body;
      const userId = req.user.userId || req.user.id;

      if (!classId || !slotIds || !attendeeCount) {
        return res.status(400).json({ success: false, message: 'classId, slotIds, attendeeCount are required' });
      }

      if (!userConsent) {
        return res.status(400).json({ success: false, message: 'User consent is required to proceed' });
      }

      // Parse slot IDs similar to review
      let slotIdArr = Array.isArray(slotIds) ? slotIds : typeof slotIds === 'string' && slotIds.startsWith('[') ? JSON.parse(slotIds) : slotIds.split(',');
      const attendeeNum = parseInt(attendeeCount);

      // Fetch user document (fresh)
      const userDoc = await User.findById(userId).lean();
      if (!userDoc) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Re-fetch class & slots
      const wellnessClass = await WellnessGuideClass.findById(classId);
      if (!wellnessClass) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }

      const slots = await TimeSlot.find({ _id: { $in: slotIdArr }, wellnessGuideClass: classId, isActive: true });
      if (slots.length !== slotIdArr.length) {
        return res.status(400).json({ success: false, message: 'One or more slots not available' });
      }

      // Validate capacity again
      const now = new Date();
      for (const slot of slots) {
        if (slot.availableSlots < attendeeNum) {
          return res.status(400).json({ success: false, message: `Slot ${slot._id} does not have enough capacity` });
        }
        if (slot.endTimeUTC < now) {
          return res.status(400).json({ success: false, message: 'Cannot book past slots' });
        }
      }

      // Pricing
      const pricing = PricingService.calculateWellnessClassPricing(wellnessClass, slots, attendeeNum);

      // Generate IDs
      const timestamp = Date.now();
      const rand = Math.random().toString(36).substr(2, 5).toUpperCase();
      const bookingId = `BOK_${timestamp}_${rand}`;
      const requestId = `REQ_${timestamp}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Build booking data
      const bookingData = {
        bookingId,
        requestId,
        bookingType: 'wellness_class',
        user: userId,
        entity: {
          entityType: 'WellnessGuideClass',
          entityId: classId,
        },
        bookingDetails: {
          selectedSlots: slots.map((s) => ({
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
            mode: s.mode,
            slotId: s._id,
          })),
          attendeeCount: attendeeNum,
          classCount: slots.length,
          totalSlots: slots.length * attendeeNum,
        },
        pricing,
        status: 'payment_pending',
        // Privacy & customer info
        privacy: {
          dataProcessingConsent: true,
          dataProcessingConsentAt: new Date(),
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          consentMethod: 'checkbox',
          consentIpAddress: req.ip || req.connection.remoteAddress,
          consentUserAgent: req.get('User-Agent'),
        },
        customerInfo: {
          name: `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() || userDoc.name || userDoc.email.split('@')[0],
          email: userDoc.email,
          phone: userDoc.contactNumber || userDoc.phone || '',
        },
      };

      // Save booking
      const booking = new Booking(bookingData);
      await booking.save();

      // Create Razorpay order
      const razorpayOrder = await RazorpayService.createOrder({
        amount: pricing.totalAmount,
        currency: 'INR',
        requestId,
        bookingId,
        customerEmail: userDoc.email,
        customerName: booking.customerInfo.name,
        description: `Wellness Class: ${wellnessClass.title}`,
      });

      booking.payment.razorpay.orderId = razorpayOrder.id;
      booking.payment.razorpay.orderCreatedAt = new Date();
      await booking.save();

      res.json({
        success: true,
        data: {
          bookingId: booking.bookingId,
          paymentUrl: razorpayOrder.paymentUrl,
          orderId: razorpayOrder.id,
          amount: pricing.totalAmount,
        },
      });
    } catch (error) {
      console.error('Create class booking error:', error);
      res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
    }
  }

  // ---------------------------------------------------------------------------
  // POST /api/bookings/class/payment-callback
  // Handle Razorpay payment success
  // ---------------------------------------------------------------------------
  static async handlePaymentCallback(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // Verify signature
      const isValid = RazorpayService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }

      // Find booking
      const booking = await Booking.findOne({
        bookingType: 'wellness_class',
        'payment.razorpay.orderId': razorpay_order_id,
      });

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      // Update booking
      booking.status = 'confirmed';
      booking.payment.razorpay.paymentId = razorpay_payment_id;
      booking.payment.razorpay.signature = razorpay_signature;
      booking.payment.status = 'completed';
      booking.payment.paidAt = new Date();
      booking.payment.paidAmount = booking.pricing.totalAmount;

      await booking.save();

      // TODO: decrement slot capacity, send confirmation email

      res.json({
        success: true,
        data: {
          bookingId: booking.bookingId,
          status: booking.status,
        },
      });
    } catch (error) {
      console.error('Class payment callback error:', error);
      res.status(500).json({ success: false, message: 'Failed to process payment callback', error: error.message });
    }
  }

  // ---------------------------------------------------------------------------
  // POST /api/bookings/class/payment-failed
  // Handle Razorpay payment failure
  // ---------------------------------------------------------------------------
  static async handlePaymentFailure(req, res) {
    try {
      const { razorpay_order_id, error_code, error_description } = req.body;

      const booking = await Booking.findOne({
        bookingType: 'wellness_class',
        'payment.razorpay.orderId': razorpay_order_id,
      });

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      booking.status = 'payment_failed';
      booking.payment.status = 'failed';
      booking.payment.failureReason = error_description || 'Payment failed';
      booking.payment.errorCode = error_code;
      booking.payment.failedAt = new Date();

      await booking.save();

      res.json({ success: true, message: 'Payment failure recorded' });
    } catch (error) {
      console.error('Class payment failure error:', error);
      res.status(500).json({ success: false, message: 'Failed to process payment failure', error: error.message });
    }
  }
}

module.exports = WellnessClassBookingController; 