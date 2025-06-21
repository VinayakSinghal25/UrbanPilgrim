// controllers/wellnessGuideController.js
const WellnessGuide = require('../models/WellnessGuide');
const User = require('../models/User');
const WellnessGuideClass = require('../models/WellnessGuideClass');
const ROLES = require('../models/RoleEnum');
const cloudinary = require('../config/cloudinaryConfig');

// @desc    Create wellness guide profile
// @route   POST /api/wellness-guides
// @access  Private (logged in users with verified email)
const createWellnessGuide = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if user exists and email is verified
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.emailVerified) {
      return res.status(400).json({ 
        message: 'Email must be verified before becoming a wellness guide' 
      });
    }
    
    // Check if user already has a wellness guide profile
    if (user.wellnessGuide) {
      return res.status(400).json({ 
        message: 'User already has a wellness guide profile' 
      });
    }
    
    const {
      firstName,
      lastName,
      contactNumber,
      profileDescription,
      areaOfExpertise,
      languages,
      addresses // Array of all addresses user wants to save
    } = req.body;
    
    // Validate addresses - at least one is required
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ 
        message: 'At least one address is required to become a wellness guide.' 
      });
    }
    
    // Validate each address has required fields
    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i];
      if (!addr.street || !addr.locality || !addr.city || !addr.state || !addr.pincode) {
        return res.status(400).json({ 
          message: `Address ${i + 1} is missing required fields (street, locality, city, state, pincode)` 
        });
      }
    }
    
    // Handle profile pictures upload
    let profilePictures = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        profilePictures.push({
          public_id: result.public_id,
          url: result.secure_url
        });
      }
    } else {
      return res.status(400).json({ 
        message: 'At least one profile picture is required' 
      });
    }
    
    // Update user data
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    // Replace ALL addresses with the new set from form
    user.address = addresses.map(addr => ({
      street: addr.street,
      locality: addr.locality,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || 'India',
      label: addr.label || 'Home'
    }));
    
    await user.save();
    
    // Create wellness guide profile (isApproved = false by default)
    const wellnessGuide = new WellnessGuide({
      user: userId,
      email: user.email, // Use verified email from user
      contactNumber,
      profileDescription,
      areaOfExpertise,
      languages,
      profilePictures
    });
    
    await wellnessGuide.save();
    
    // Update user's wellnessGuide reference
    user.wellnessGuide = wellnessGuide._id;
    await user.save();
    
    await wellnessGuide.populate([
      { path: 'user', select: 'firstName lastName email emailVerified address roles' },
      { path: 'areaOfExpertise', select: 'name description' }
    ]);
    
    res.status(201).json({
      message: 'Wellness guide profile created successfully. Waiting for admin approval.',
      wellnessGuide
    });
    
  } catch (error) {
    console.error('Error creating wellness guide:', error);
    res.status(500).json({ 
      message: 'Error creating wellness guide profile',
      error: error.message 
    });
  }
};

// @desc    Get wellness guide profile
// @route   GET /api/wellness-guides/profile
// @access  Private
const getWellnessGuideProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const wellnessGuide = await WellnessGuide.findOne({ user: userId })
      .populate('user', 'firstName lastName email emailVerified address contactNumber roles')
      .populate('areaOfExpertise', 'name description')
      .populate('wellnessGuideClasses');
    
    if (!wellnessGuide) {
      return res.status(404).json({ message: 'Wellness guide profile not found' });
    }
    
    res.json({ wellnessGuide });
    
  } catch (error) {
    console.error('Error fetching wellness guide profile:', error);
    res.status(500).json({ 
      message: 'Error fetching wellness guide profile',
      error: error.message 
    });
  }
};

// @desc    Update wellness guide profile
// @route   PUT /api/wellness-guides/profile
// @access  Private
const updateWellnessGuideProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const wellnessGuide = await WellnessGuide.findOne({ user: userId });
    if (!wellnessGuide) {
      return res.status(404).json({ message: 'Wellness guide profile not found' });
    }
    
    const {
      firstName,
      lastName,
      contactNumber,
      profileDescription,
      areaOfExpertise,
      languages,
      addresses // Array of all addresses user wants to save
    } = req.body;
    
    // Get user for updates
    const user = await User.findById(userId);
    
    // Update user firstName and lastName if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    
    // Update addresses if provided - replace ALL with new set
    if (addresses && Array.isArray(addresses)) {
      // Validate at least one address
      if (addresses.length === 0) {
        return res.status(400).json({ 
          message: 'At least one address is required' 
        });
      }
      
      // Validate each address
      for (let i = 0; i < addresses.length; i++) {
        const addr = addresses[i];
        if (!addr.street || !addr.locality || !addr.city || !addr.state || !addr.pincode) {
          return res.status(400).json({ 
            message: `Address ${i + 1} is missing required fields (street, locality, city, state, pincode)` 
          });
        }
      }
      
      user.address = addresses.map(addr => ({
        street: addr.street,
        locality: addr.locality,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'India',
        label: addr.label || 'Home'
      }));
    }
    
    await user.save();
    
    // Handle new profile pictures if provided
    if (req.files && req.files.length > 0) {
      // Delete old pictures from Cloudinary
      for (const picture of wellnessGuide.profilePictures) {
        if (picture.public_id) {
          await cloudinary.uploader.destroy(picture.public_id);
        }
      }
      
      // Upload new pictures
      const newProfilePictures = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        newProfilePictures.push({
          public_id: result.public_id,
          url: result.secure_url
        });
      }
      wellnessGuide.profilePictures = newProfilePictures;
    }
    
    // Update wellness guide fields
    if (contactNumber !== undefined) wellnessGuide.contactNumber = contactNumber;
    if (profileDescription !== undefined) wellnessGuide.profileDescription = profileDescription;
    if (areaOfExpertise !== undefined) wellnessGuide.areaOfExpertise = areaOfExpertise;
    if (languages !== undefined) wellnessGuide.languages = languages;
    
    await wellnessGuide.save();
    
    await wellnessGuide.populate([
      { path: 'user', select: 'firstName lastName email emailVerified address roles' },
      { path: 'areaOfExpertise', select: 'name description' }
    ]);
    
    res.json({
      message: 'Wellness guide profile updated successfully',
      wellnessGuide
    });
    
  } catch (error) {
    console.error('Error updating wellness guide profile:', error);
    res.status(500).json({ 
      message: 'Error updating wellness guide profile',
      error: error.message 
    });
  }
};

// @desc    Get all wellness guides (for admin or public view)
// @route   GET /api/wellness-guides
// @access  Public
const getAllWellnessGuides = async (req, res) => {
  try {
    const { page = 1, limit = 10, specialty, language, approved } = req.query;
    
    let filter = { isActive: true };
    
    if (approved !== undefined) {
      filter.isApproved = approved === 'true';
    }
    
    if (specialty) {
      filter.areaOfExpertise = specialty;
    }
    
    if (language) {
      filter.languages = { $in: [language] };
    }
    
    const wellnessGuides = await WellnessGuide.find(filter)
      .populate('user', 'firstName lastName address roles')
      .populate('areaOfExpertise', 'name description')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await WellnessGuide.countDocuments(filter);
    
    res.json({
      wellnessGuides,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGuides: total
    });
    
  } catch (error) {
    console.error('Error fetching wellness guides:', error);
    res.status(500).json({ 
      message: 'Error fetching wellness guides',
      error: error.message 
    });
  }
};

// @desc    Update wellness guide approval status
// @route   PUT /api/wellness-guides/:id/approval
// @access  Private (Admin only)
const updateWellnessGuideApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const adminId = req.user.userId;
    
    const wellnessGuide = await WellnessGuide.findById(id);
    if (!wellnessGuide) {
      return res.status(404).json({ message: 'Wellness guide not found' });
    }
    
    wellnessGuide.isApproved = isApproved;
    if (isApproved) {
      wellnessGuide.approvedAt = new Date();
      wellnessGuide.approvedBy = adminId;
    } else {
      wellnessGuide.approvedAt = null;
      wellnessGuide.approvedBy = null;
    }
    
    await wellnessGuide.save();
    
    await wellnessGuide.populate([
      { path: 'user', select: 'firstName lastName email address' },
      { path: 'areaOfExpertise', select: 'name description' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);
    
    res.json({
      message: `Wellness guide ${isApproved ? 'approved' : 'rejected'} successfully`,
      wellnessGuide
    });
    
  } catch (error) {
    console.error('Error updating wellness guide approval:', error);
    res.status(500).json({ 
      message: 'Error updating approval status',
      error: error.message 
    });
  }
};

// @desc    Get pending wellness guides for admin approval
// @route   GET /api/wellness-guides/pending
// @access  Private (Admin)
const getPendingWellnessGuides = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true, isApproved: false };
    
    const pendingGuides = await WellnessGuide.find(filter)
      .populate('user', 'firstName lastName email address')
      .populate('areaOfExpertise', 'name description')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await WellnessGuide.countDocuments(filter);
    
    res.json({
      pendingGuides,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPending: total
    });
    
  } catch (error) {
    console.error('Error fetching pending wellness guides:', error);
    res.status(500).json({ 
      message: 'Error fetching pending wellness guides',
      error: error.message 
    });
  }
};

// @desc    Check if user is eligible to become a wellness guide
// @route   GET /api/wellness-guides/eligibility
// @access  Private
const checkWellnessGuideEligibility = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const eligibility = {
      isEligible: false,
      reasons: []
    };
    
    // Check if email is verified
    if (!user.emailVerified) {
      eligibility.reasons.push('Email must be verified');
    }
    
    // Check if user already has a wellness guide profile
    if (user.wellnessGuide) {
      eligibility.reasons.push('User already has a wellness guide profile');
    }
    
    // If no blocking reasons, user is eligible
    if (eligibility.reasons.length === 0) {
      eligibility.isEligible = true;
    }
    
    res.json(eligibility);
    
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ 
      message: 'Error checking eligibility',
      error: error.message 
    });
  }
};

// @desc    Get form data needed for wellness guide creation/update
// @route   GET /api/wellness-guides/form-data
// @access  Private
//When user clicks on create form data, we use this endpoint to get him list of specialties and languages he can select from dropdown.
//removing it for now, we'll get speacialty from specialty controller, and languages stored as enum in frontend. 
// const getWellnessGuideFormData = async (req, res) => {
//   try {
//     const Specialty = require('../models/Specialty');
    
//     const specialties = await Specialty.find({}, 'name description');
//     const languages = ['English', 'Hindi', 'Spanish', 'French', 'Other'];
    
//     res.json({
//       specialties,
//       languages
//     });
    
//   } catch (error) {
//     console.error('Error fetching form data:', error);
//     res.status(500).json({ 
//       message: 'Error fetching form data',
//       error: error.message 
//     });
//   }
// };

module.exports = {
  createWellnessGuide,
  getWellnessGuideProfile,
  updateWellnessGuideProfile,
  getAllWellnessGuides,
  updateWellnessGuideApproval,
  getPendingWellnessGuides,
  checkWellnessGuideEligibility
 // getWellnessGuideFormData
};