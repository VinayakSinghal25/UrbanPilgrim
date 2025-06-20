const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs'); // Change to bcryptjs
// Enum values for languages and days active
const languagesEnum = ['English', 'Hindi', 'Spanish', 'French', 'Other'];
const daysEnum = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Define the Pilgrim schema
const PilgrimSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contactNumber: {
    type: String, // or you can use Number depending on your need
    required: true,
  },
  language: {
    type: String,
    enum: languagesEnum,
    required: true,
  },
  daysActive: {
    type: [String], // An array to store multiple days
    enum: daysEnum,
    required: true,
  },
  timeSlots: {
    type: [String], // Array of strings representing time slots
    required: true,
  },
  chargesPerStudent: {
    type: Number,
    required: true,
  },
  profilePictures: {
    type: [String], // Array to store multiple profile picture URLs
    required: false, // Not required for the pilgrim
  },
  expertise: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
      required: true,
    }
  ],
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Don't include by default in queries
  },
});
// 🔒 Hash password before saving
PilgrimSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcryptjs.hash(this.password, 10);
    next();
  });
  

// Create and export the Pilgrim model
const Pilgrim = mongoose.model('Pilgrim', PilgrimSchema);
module.exports = Pilgrim;
