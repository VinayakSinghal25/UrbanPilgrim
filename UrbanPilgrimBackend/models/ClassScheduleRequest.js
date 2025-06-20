// models/ClassScheduleRequest.js
const mongoose = require('mongoose');

const classScheduleRequestSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  error: {
    type: String,
  },
  processedAt: {
    type: Date,
  },
  slotsGenerated: {
    type: Number,
    default: 0,
  },
  conflicts: [{
    date: Date,
    timeSlot: String,
    mode: String,
    conflictsWith: String,
  }],
}, { timestamps: true });

const ClassScheduleRequest = mongoose.model('ClassScheduleRequest', classScheduleRequestSchema);

module.exports = ClassScheduleRequest;