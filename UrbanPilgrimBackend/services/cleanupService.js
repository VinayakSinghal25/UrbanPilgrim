// services/cleanupService.js
const Booking = require('../models/Booking');

class CleanupService {

  /**
   * Cleanup abandoned bookings that are stuck in payment_pending
   * Should be run as a scheduled job every 30 minutes
   */
  static async cleanupAbandonedBookings() {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const result = await Booking.updateMany(
        {
          status: 'payment_pending',
          createdAt: { $lt: thirtyMinutesAgo }
        },
        {
          $set: {
            status: 'abandoned',
            abandonment: {
              abandonedAt: new Date(),
              reason: 'Payment not completed within 30 minutes',
              autoCleanup: true
            }
          }
        }
      );

      console.log(`Cleanup completed: ${result.modifiedCount} abandoned bookings updated`);
      return result.modifiedCount;

    } catch (error) {
      console.error('Cleanup abandoned bookings error:', error);
      throw error;
    }
  }

  /**
   * Archive old completed bookings (older than 2 years)
   * Should be run monthly
   */
  static async archiveOldBookings() {
    try {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const oldBookings = await Booking.find({
        status: { $in: ['confirmed', 'cancelled'] },
        createdAt: { $lt: twoYearsAgo }
      });

      // TODO: Move to archive collection or external storage
      console.log(`Found ${oldBookings.length} bookings eligible for archiving`);
      
      return oldBookings.length;

    } catch (error) {
      console.error('Archive old bookings error:', error);
      throw error;
    }
  }

  /**
   * Delete failed bookings older than 30 days
   * Should be run weekly
   */
  static async deleteOldFailedBookings() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const result = await Booking.deleteMany({
        status: { $in: ['payment_failed', 'abandoned'] },
        createdAt: { $lt: thirtyDaysAgo }
      });

      console.log(`Deleted ${result.deletedCount} old failed bookings`);
      return result.deletedCount;

    } catch (error) {
      console.error('Delete old failed bookings error:', error);
      throw error;
    }
  }

  /**
   * Run all cleanup tasks
   */
  static async runAllCleanupTasks() {
    try {
      console.log('Starting cleanup tasks...');

      const abandonedCount = await this.cleanupAbandonedBookings();
      const archiveCount = await this.archiveOldBookings();
      const deletedCount = await this.deleteOldFailedBookings();

      console.log('Cleanup tasks completed successfully');
      
      return {
        abandonedBookingsUpdated: abandonedCount,
        bookingsEligibleForArchive: archiveCount,
        oldFailedBookingsDeleted: deletedCount,
        completedAt: new Date()
      };

    } catch (error) {
      console.error('Cleanup tasks failed:', error);
      throw error;
    }
  }
}

module.exports = CleanupService;