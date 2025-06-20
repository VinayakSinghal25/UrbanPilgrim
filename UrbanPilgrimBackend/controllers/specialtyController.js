const Specialty = require('../models/Specialty');

exports.createSpecialty = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Specialty name is required' });
    }

    // Check if it already exists
    const existing = await Specialty.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'Specialty already exists' });
    }

    const specialty = new Specialty({ name });
    await specialty.save();

    res.status(201).json({
      message: 'Specialty created successfully',
      specialty,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating specialty', error: error.message });
  }
};

exports.getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find({}, '_id name'); // Fetch only _id and name
    res.status(200).json(specialties);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching specialties',
      error: error.message,
    });
  }
};