// controllers/adminPilgrimBookingController.js
const Booking = require('../models/Booking');
const PilgrimExperience = require('../models/PilgrimExperience');

class AdminPilgrimBookingController {

  /**
   * GET /api/admin/bookings/pilgrim
   * Get all pilgrim bookings (admin only)
   */
  static async getAllBookings(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        experienceId, 
        startDate, 
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = { bookingType: 'pilgrim_experience' };

      if (status) {
        query.status = status;
      }

      if (experienceId) {
        query['entity.entityId'] = experienceId;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'entity.entityId', select: 'name location' }
        ]
      };

      const result = await Booking.paginate(query, options);

      // Calculate summary statistics
      const totalRevenue = await Booking.aggregate([
        { 
          $match: { 
            bookingType: 'pilgrim_experience', 
            status: 'confirmed' 
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$pricing.totalAmount' },
            count: { $sum: 1 }
          } 
        }
      ]);

      res.json({
        success: true,
        data: {
          bookings: result.docs,
          pagination: {
            totalBookings: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage
          },
          summary: {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalConfirmedBookings: totalRevenue[0]?.count || 0
          }
        }
      });

    } catch (error) {
      console.error('Get all bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bookings',
        error: error.message
      });
    }
  }

  /**
   * GET /api/admin/bookings/pilgrim/:bookingId
   * Get detailed booking info (admin only)
   */
  static async getBookingDetails(req, res) {
    try {
      const { bookingId } = req.params;

      const booking = await Booking.findOne({
        bookingId,
        bookingType: 'pilgrim_experience'
      })
      .populate('user', 'name email phone')
      .populate('entity.entityId');

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
   * GET /api/admin/bookings/pilgrim/analytics
   * Get booking analytics and insights
   */
  static async getBookingAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;

      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Aggregate booking statistics
      const analytics = await Booking.aggregate([
        {
          $match: {
            bookingType: 'pilgrim_experience',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { 
              $sum: { 
                $cond: [
                  { $eq: ['$status', 'confirmed'] },
                  '$pricing.totalAmount',
                  0
                ]
              }
            }
          }
        }
      ]);

      // Popular experiences
      const popularExperiences = await Booking.aggregate([
        {
          $match: {
            bookingType: 'pilgrim_experience',
            status: 'confirmed',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$entity.entityId',
            bookingCount: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalAmount' }
          }
        },
        { $sort: { bookingCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'pilgrimexperiences',
            localField: '_id',
            foreignField: '_id',
            as: 'experience'
          }
        }
      ]);

      // Daily booking trends
      const dailyTrends = await Booking.aggregate([
        {
          $match: {
            bookingType: 'pilgrim_experience',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { 
              $dateToString: { 
                format: '%Y-%m-%d', 
                date: '$createdAt' 
              } 
            },
            bookings: { $sum: 1 },
            revenue: { 
              $sum: { 
                $cond: [
                  { $eq: ['$status', 'confirmed'] },
                  '$pricing.totalAmount',
                  0
                ]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        success: true,
        data: {
          period,
          overview: analytics,
          popularExperiences,
          dailyTrends,
          dateRange: { startDate, endDate }
        }
      });

    } catch (error) {
      console.error('Get booking analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get booking analytics',
        error: error.message
      });
    }
  }

  /**
   * POST /api/admin/bookings/pilgrim/:bookingId/process-refund
   * Process refund for cancelled booking (admin only)
   */
  static async processRefund(req, res) {
    try {
      const { bookingId } = req.params;
      const { refundAmount, adminNotes } = req.body;
      const adminId = req.user.id;

      // Find cancelled booking with pending refund
      const booking = await Booking.findOne({
        bookingId,
        bookingType: 'pilgrim_experience',
        status: 'cancelled',
        'cancellation.refundStatus': { $in: ['pending', 'requested'] }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Cancelled booking with pending refund not found'
        });
      }

      // Validate refund amount
      const maxRefund = booking.pricing.totalAmount;
      if (refundAmount > maxRefund || refundAmount < 0) {
        return res.status(400).json({
          success: false,
          message: `Refund amount must be between 0 and ${maxRefund}`
        });
      }

      // TODO: Process actual refund with Razorpay
      // const refundResult = await RazorpayService.processRefund({
      //   paymentId: booking.payment.razorpay.paymentId,
      //   amount: refundAmount
      // });

      // Update booking with refund details
      booking.cancellation.refundAmount = refundAmount;
      booking.cancellation.refundStatus = 'completed';
      booking.cancellation.refundProcessedAt = new Date();
      booking.cancellation.refundProcessedBy = adminId;
      booking.cancellation.adminNotes = adminNotes;

      await booking.save();

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          bookingId: booking.bookingId,
          refundAmount,
          refundStatus: 'completed'
        }
      });

    } catch (error) {
      console.error('Process refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error.message
      });
    }
  }

  /**
   * POST /api/admin/bookings/cleanup-abandoned
   * Cleanup abandoned bookings (payment_pending > 30 minutes)
   */
  static async cleanupAbandonedBookings(req, res) {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const result = await Booking.updateMany(
        {
          bookingType: 'pilgrim_experience',
          status: 'payment_pending',
          createdAt: { $lt: thirtyMinutesAgo }
        },
        {
          $set: {
            status: 'abandoned',
            abandonment: {
              abandonedAt: new Date(),
              reason: 'Payment not completed within 30 minutes'
            }
          }
        }
      );

      res.json({
        success: true,
        message: 'Abandoned bookings cleaned up successfully',
        data: {
          updatedCount: result.modifiedCount
        }
      });

    } catch (error) {
      console.error('Cleanup abandoned bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup abandoned bookings',
        error: error.message
      });
    }
  }
}

module.exports = AdminPilgrimBookingController;