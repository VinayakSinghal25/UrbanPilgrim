// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  pilgrimExperience: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PilgrimExperience', 
    required: true 
  },
  bookingDate: { 
    type: Date, 
    required: true 
  }, // the actual date user selected (e.g., 2024-01-15)
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  participants: { 
    type: Number, 
    required: true, 
    default: 1 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentId: { type: String }, // for payment gateway integration
  bookingReference: { 
    type: String, 
    unique: true 
  }, // unique booking reference
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate unique booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'UPB' + Date.now() + Math.floor(Math.random() * 1000);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);