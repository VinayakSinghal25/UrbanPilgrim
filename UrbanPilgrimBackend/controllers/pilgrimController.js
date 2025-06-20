// controllers/PilgrimExperienceController.js
const PilgrimExperience = require('../models/PilgrimExperience');
const cloudinary = require('../config/cloudinaryConfig');

const createPilgrimExperience = async (req, res) => {
  try {
    const {
      name,
      about, // JSON stringified array
      retreatGuide, // JSON stringified object
      whatToExpect,
      programSchedule, // JSON stringified array
      price,
      location,
      availableDates, // JSON stringified array of dates
      whatsIncluded, // JSON stringified array
      whatsNotIncluded, // JSON stringified array
      termsAndConditions, // JSON stringified array
      trainerProfileLink
    } = req.body;

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push({
          public_id: result.public_id,
          url: result.secure_url
        });
      }
    }

    // Parse JSON fields if sent as strings
    const aboutParsed = typeof about === 'string' ? JSON.parse(about) : about;
    const retreatGuideParsed = typeof retreatGuide === 'string' ? JSON.parse(retreatGuide) : retreatGuide;
    const programScheduleParsed = typeof programSchedule === 'string' ? JSON.parse(programSchedule) : programSchedule;
    const whatsIncludedParsed = typeof whatsIncluded === 'string' ? JSON.parse(whatsIncluded) : whatsIncluded;
    const whatsNotIncludedParsed = typeof whatsNotIncluded === 'string' ? JSON.parse(whatsNotIncluded) : whatsNotIncluded;
    const termsParsed = typeof termsAndConditions === 'string' ? JSON.parse(termsAndConditions) : termsAndConditions;
    const availableDatesParsed = typeof availableDates === 'string' ? JSON.parse(availableDates) : availableDates;

    // Validate available dates (should be array of valid dates)
    if (availableDatesParsed && availableDatesParsed.length > 0) {
      for (const date of availableDatesParsed) {
        if (!date || isNaN(Date.parse(date))) {
          return res.status(400).json({ message: 'Each available date must be a valid date string.' });
        }
      }
    }

    const pilgrimExperience = new PilgrimExperience({
      name,
      images,
      about: aboutParsed,
      retreatGuide: retreatGuideParsed,
      whatToExpect,
      programSchedule: programScheduleParsed,
      price,
      location,
      availableDates: availableDatesParsed || [],
      whatsIncluded: whatsIncludedParsed || [],
      whatsNotIncluded: whatsNotIncludedParsed || [],
      termsAndConditions: termsParsed,
      trainerProfileLink,
      createdBy: req.user.userId
    });

    await pilgrimExperience.save();

    res.status(201).json({
      message: 'Pilgrim Experience created successfully',
      pilgrimExperience
    });
  } catch (error) {
    console.error('Create Pilgrim Experience Error:', error);
    res.status(500).json({ message: 'Server error creating Pilgrim Experience', error: error.message });
  }
};

// Get all pilgrim experiences
const getAllPilgrimExperiences = async (req, res) => {
  try {
    const experiences = await PilgrimExperience.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Pilgrim experiences retrieved successfully',
      pilgrimExperiences: experiences
    });
  } catch (error) {
    console.error('Get All Pilgrim Experiences Error:', error);
    res.status(500).json({ message: 'Server error retrieving experiences', error: error.message });
  }
};

// Get single pilgrim experience by ID
const getPilgrimExperienceById = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await PilgrimExperience.findById(id)
      .populate('createdBy', 'name email');

    if (!experience) {
      return res.status(404).json({ message: 'Pilgrim experience not found' });
    }

    res.status(200).json({
      message: 'Pilgrim experience retrieved successfully',
      pilgrimExperience: experience
    });
  } catch (error) {
    console.error('Get Pilgrim Experience Error:', error);
    res.status(500).json({ message: 'Server error retrieving experience', error: error.message });
  }
};

// Update pilgrim experience
const updatePilgrimExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      about,
      retreatGuide,
      whatToExpect,
      programSchedule,
      price,
      location,
      availableDates,
      whatsIncluded,
      whatsNotIncluded,
      termsAndConditions,
      trainerProfileLink
    } = req.body;

    // Find existing experience
    const experience = await PilgrimExperience.findById(id);
    if (!experience) {
      return res.status(404).json({ message: 'Pilgrim experience not found' });
    }

    // Handle image uploads if provided
    let images = experience.images;
    if (req.files && req.files.length > 0) {
      images = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push({
          public_id: result.public_id,
          url: result.secure_url
        });
      }
    }

    // Parse JSON fields if they are strings
    const aboutParsed = typeof about === 'string' ? JSON.parse(about) : about;
    const retreatGuideParsed = typeof retreatGuide === 'string' ? JSON.parse(retreatGuide) : retreatGuide;
    const programScheduleParsed = typeof programSchedule === 'string' ? JSON.parse(programSchedule) : programSchedule;
    const whatsIncludedParsed = typeof whatsIncluded === 'string' ? JSON.parse(whatsIncluded) : whatsIncluded;
    const whatsNotIncludedParsed = typeof whatsNotIncluded === 'string' ? JSON.parse(whatsNotIncluded) : whatsNotIncluded;
    const termsParsed = typeof termsAndConditions === 'string' ? JSON.parse(termsAndConditions) : termsAndConditions;
    const availableDatesParsed = typeof availableDates === 'string' ? JSON.parse(availableDates) : availableDates;

    // Validate available dates
    if (availableDatesParsed && availableDatesParsed.length > 0) {
      for (const date of availableDatesParsed) {
        if (!date || isNaN(Date.parse(date))) {
          return res.status(400).json({ message: 'Each available date must be a valid date string.' });
        }
      }
    }

    // Prepare update object
    const updateFields = {
      name: name || experience.name,
      images,
      about: aboutParsed || experience.about,
      retreatGuide: retreatGuideParsed || experience.retreatGuide,
      whatToExpect: whatToExpect || experience.whatToExpect,
      programSchedule: programScheduleParsed || experience.programSchedule,
      price: price !== undefined ? price : experience.price,
      location: location || experience.location,
      availableDates: availableDatesParsed !== undefined ? availableDatesParsed : experience.availableDates,
      whatsIncluded: whatsIncludedParsed !== undefined ? whatsIncludedParsed : experience.whatsIncluded,
      whatsNotIncluded: whatsNotIncludedParsed !== undefined ? whatsNotIncludedParsed : experience.whatsNotIncluded,
      termsAndConditions: termsParsed || experience.termsAndConditions,
      trainerProfileLink: trainerProfileLink || experience.trainerProfileLink
    };

    const updatedExperience = await PilgrimExperience.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Pilgrim experience updated successfully',
      pilgrimExperience: updatedExperience
    });
  } catch (error) {
    console.error('Update Pilgrim Experience Error:', error);
    res.status(500).json({ message: 'Server error updating experience', error: error.message });
  }
};

// Delete pilgrim experience (unchanged)
const deletePilgrimExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await PilgrimExperience.findById(id);
    if (!experience) {
      return res.status(404).json({ message: 'Pilgrim experience not found' });
    }
    for (const image of experience.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }
    await PilgrimExperience.findByIdAndDelete(id);
    res.status(200).json({ message: 'Pilgrim experience deleted successfully' });
  } catch (error) {
    console.error('Delete Pilgrim Experience Error:', error);
    res.status(500).json({ message: 'Server error deleting experience', error: error.message });
  }
};

module.exports = {
  createPilgrimExperience,
  getAllPilgrimExperiences,
  getPilgrimExperienceById,
  updatePilgrimExperience,
  deletePilgrimExperience
};