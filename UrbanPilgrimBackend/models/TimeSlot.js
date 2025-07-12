// models/TimeSlot.js
const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  wellnessGuideClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WellnessGuideClass',
    required: [true, 'Wellness guide class reference is required'],
  },
  wellnessGuide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WellnessGuide',
    required: [true, 'Wellness guide reference is required'],
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    required: [true, 'Mode is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: [true, 'Day of week is required'],
  },
  startTime: {
    type: String, // Format: "HH:MM"
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: String, // Format: "HH:MM"
    required: [true, 'End time is required'],
  },
  // Store both local time (guide's timezone) and UTC for easy querying
  startTimeUTC: {
    type: Date,
    required: [true, 'Start time UTC is required'],
  },
  endTimeUTC: {
    type: Date,
    required: [true, 'End time UTC is required'],
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Max capacity is required'],
    min: 1,
  },
  currentBookings: {
    type: Number,
    default: 0,
    min: 0,
  },
  availableSlots: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Booking references (to be added later)
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  }],
}, { timestamps: true });

// Pre-save middleware to calculate available slots
timeSlotSchema.pre('save', function(next) {
  this.availableSlots = Math.max(0, this.maxCapacity - this.currentBookings);
  next();
});

// Indexes for efficient querying
timeSlotSchema.index({ wellnessGuide: 1, startTimeUTC: 1, endTimeUTC: 1 });
timeSlotSchema.index({ wellnessGuideClass: 1, date: 1 });
timeSlotSchema.index({ mode: 1, isActive: 1 });
timeSlotSchema.index({ date: 1, startTime: 1 });

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

module.exports = TimeSlot;