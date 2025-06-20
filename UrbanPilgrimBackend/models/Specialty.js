const mongoose = require('mongoose');

// Define the Specialty schema
const SpecialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

// Create and export the Specialty model
const Specialty = mongoose.model('Specialty', SpecialtySchema);
module.exports = Specialty;
