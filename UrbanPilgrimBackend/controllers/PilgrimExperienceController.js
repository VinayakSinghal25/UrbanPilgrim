// controllers/pilgrimExperienceController.js
const PilgrimExperience = require('../models/PilgrimExperience');
const cloudinary = require('../config/cloudinaryConfig'); // adjust path as needed

const createPilgrimExperience = async (req, res) => {
  try {
    const {
      name,
      about,
      retreatGuideBio,
      retreatGuideLink,
      retreatGuideImage,
      whatToExpect,
      programSchedule,
      priceSingle,
      priceCouple,
      location,
      address,
      mapLink,
      availableDates,
      whatsIncluded,
      whatsNotIncluded,
      termsAndConditions,
      trainerProfileLink,
      occupancyOptions
    } = req.body;

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

    // Parse JSON fields if needed (as in your current code)
    const aboutParsed = typeof about === 'string' ? JSON.parse(about) : about;
    const programScheduleParsed = typeof programSchedule === 'string' ? JSON.parse(programSchedule) : programSchedule;
    const whatsIncludedParsed = typeof whatsIncluded === 'string' ? JSON.parse(whatsIncluded) : whatsIncluded;
    const whatsNotIncludedParsed = typeof whatsNotIncluded === 'string' ? JSON.parse(whatsNotIncluded) : whatsNotIncluded;
    const termsParsed = typeof termsAndConditions === 'string' ? JSON.parse(termsAndConditions) : termsAndConditions;
    const availableDatesParsed = typeof availableDates === 'string' ? JSON.parse(availableDates) : availableDates;

    const pilgrimExperience = new PilgrimExperience({
      name,
      images,
      about: aboutParsed,
      retreatGuideBio,
      retreatGuideLink,
      retreatGuideImage,
      whatToExpect,
      programSchedule: programScheduleParsed,
      priceSingle,
      priceCouple,
      location,
      address,
      mapLink,
      availableDates: availableDatesParsed || [],
      whatsIncluded: whatsIncludedParsed || [],
      whatsNotIncluded: whatsNotIncludedParsed || [],
      termsAndConditions: termsParsed,
      trainerProfileLink,
      occupancyOptions: occupancyOptions ? JSON.parse(occupancyOptions) : ['Single'],
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
      retreatGuideBio,
      retreatGuideLink,
      retreatGuideImage,
      whatToExpect,
      programSchedule,
      priceSingle,
      priceCouple,
      location,
      address,
      mapLink,
      availableDates,
      whatsIncluded,
      whatsNotIncluded,
      termsAndConditions,
      trainerProfileLink,
      occupancyOptions
    } = req.body;

    const experience = await PilgrimExperience.findById(id);
    if (!experience) {
      return res.status(404).json({ message: 'Pilgrim experience not found' });
    }

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

    // Parse JSON fields if needed (as in your current code)
    const aboutParsed = typeof about === 'string' ? JSON.parse(about) : about;
    const programScheduleParsed = typeof programSchedule === 'string' ? JSON.parse(programSchedule) : programSchedule;
    const whatsIncludedParsed = typeof whatsIncluded === 'string' ? JSON.parse(whatsIncluded) : whatsIncluded;
    const whatsNotIncludedParsed = typeof whatsNotIncluded === 'string' ? JSON.parse(whatsNotIncluded) : whatsNotIncluded;
    const termsParsed = typeof termsAndConditions === 'string' ? JSON.parse(termsAndConditions) : termsAndConditions;
    const availableDatesParsed = typeof availableDates === 'string' ? JSON.parse(availableDates) : availableDates;
    const occupancyOptionsParsed = typeof occupancyOptions === 'string' ? JSON.parse(occupancyOptions) : occupancyOptions;

    const updateFields = {
      name: name || experience.name,
      images,
      about: aboutParsed || experience.about,
      retreatGuideBio: retreatGuideBio || experience.retreatGuideBio,
      retreatGuideLink: retreatGuideLink || experience.retreatGuideLink,
      retreatGuideImage: retreatGuideImage || experience.retreatGuideImage,
      whatToExpect: whatToExpect || experience.whatToExpect,
      programSchedule: programScheduleParsed || experience.programSchedule,
      priceSingle: priceSingle !== undefined ? priceSingle : experience.priceSingle,
      priceCouple: priceCouple !== undefined ? priceCouple : experience.priceCouple,
      location: location || experience.location,
      address: address || experience.address,
      mapLink: mapLink || experience.mapLink,
      availableDates: availableDatesParsed !== undefined ? availableDatesParsed : experience.availableDates,
      whatsIncluded: whatsIncludedParsed !== undefined ? whatsIncludedParsed : experience.whatsIncluded,
      whatsNotIncluded: whatsNotIncludedParsed !== undefined ? whatsNotIncludedParsed : experience.whatsNotIncluded,
      termsAndConditions: termsParsed || experience.termsAndConditions,
      trainerProfileLink: trainerProfileLink || experience.trainerProfileLink,
      occupancyOptions: occupancyOptionsParsed || experience.occupancyOptions
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

// Delete pilgrim experience
const deletePilgrimExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await PilgrimExperience.findById(id);
    if (!experience) {
      return res.status(404).json({ message: 'Pilgrim experience not found' });
    }

    // Delete images from cloudinary
    for (const image of experience.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    // Delete the experience
    await PilgrimExperience.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Pilgrim experience deleted successfully'
    });
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