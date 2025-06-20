// controllers/wellnessGuideController.js
const WellnessGuide = require('../models/WellnessGuide');
const User = require('../models/User');
const WellnessGuideClass = require('../models/WellnessGuideClass');
const ROLES = require('../models/RoleEnum');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinaryConfig');

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
        const result = await uploadToCloudinary(file.path, 'wellness-guide-profiles');
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
      
      // Replace ALL addresses with the new set
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
    
    // Update wellness guide fields
    if (contactNumber !== undefined) wellnessGuide.contactNumber = contactNumber;
    if (areaOfExpertise !== undefined) wellnessGuide.areaOfExpertise = areaOfExpertise;
    if (languages !== undefined) wellnessGuide.languages = languages;
    
    // Handle new profile pictures if uploaded
    if (req.files && req.files.length > 0) {
      // Delete old pictures from cloudinary
      for (const picture of wellnessGuide.profilePictures) {
        await deleteFromCloudinary(picture.public_id);
      }
      
      // Upload new pictures
      let newProfilePictures = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, 'wellness-guide-profiles');
        newProfilePictures.push({
          public_id: result.public_id,
          url: result.secure_url
        });
      }
      wellnessGuide.profilePictures = newProfilePictures;
    }
    
    await wellnessGuide.save();
    
    await wellnessGuide.populate([
      { path: 'user', select: 'firstName lastName email emailVerified address contactNumber roles' },
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

// @desc    Approve/Reject wellness guide (Admin only)
// @route   PUT /api/wellness-guides/:id/approval
// @access  Private (Admin)
const updateWellnessGuideApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const adminId = req.user.userId;
    
    const wellnessGuide = await WellnessGuide.findById(id).populate('user');
    if (!wellnessGuide) {
      return res.status(404).json({ message: 'Wellness guide not found' });
    }
    
    const user = wellnessGuide.user;
    
    // Update wellness guide approval status
    wellnessGuide.isApproved = isApproved;
    if (isApproved) {
      wellnessGuide.approvedAt = new Date();
      wellnessGuide.approvedBy = adminId;
      
      // Add WELLNESS_GUIDE role to user if not already present
      if (!user.roles.includes(ROLES.WELLNESS_GUIDE)) {
        user.roles.push(ROLES.WELLNESS_GUIDE);
      }
    } else {
      wellnessGuide.approvedAt = null;
      wellnessGuide.approvedBy = null;
      
      // Remove WELLNESS_GUIDE role from user if present
      user.roles = user.roles.filter(role => role !== ROLES.WELLNESS_GUIDE);
    }
    
    await wellnessGuide.save();
    await user.save();
    
    await wellnessGuide.populate([
      { path: 'user', select: 'firstName lastName email roles' },
      { path: 'areaOfExpertise', select: 'name description' }
    ]);
    
    res.json({
      message: `Wellness guide ${isApproved ? 'approved' : 'rejected'} successfully`,
      wellnessGuide
    });
    
  } catch (error) {
    console.error('Error updating wellness guide approval:', error);
    res.status(500).json({ 
      message: 'Error updating wellness guide approval',
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

// @desc    Check if user can become wellness guide and get existing data
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
      canBecome: true,
      reasons: [],
      existingData: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        contactNumber: user.contactNumber || '',
        addresses: user.address || []
      }
    };
    
    if (!user.emailVerified) {
      eligibility.canBecome = false;
      eligibility.reasons.push('Email must be verified');
    }
    
    if (user.wellnessGuide) {
      eligibility.canBecome = false;
      eligibility.reasons.push('User already has a wellness guide profile');
    }
    
    // Check if user already has WELLNESS_GUIDE role
    if (user.roles.includes(ROLES.WELLNESS_GUIDE)) {
      eligibility.canBecome = false;
      eligibility.reasons.push('User is already an approved wellness guide');
    }
    
    res.json(eligibility);
    
  } catch (error) {
    console.error('Error checking wellness guide eligibility:', error);
    res.status(500).json({ 
      message: 'Error checking wellness guide eligibility',
      error: error.message 
    });
  }
};

// @desc    Get user's current data for wellness guide form pre-population
// @route   GET /api/wellness-guides/form-data
// @access  Private
const getWellnessGuideFormData = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('firstName lastName email emailVerified contactNumber address');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      formData: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        emailVerified: user.emailVerified,
        contactNumber: user.contactNumber || '',
        addresses: user.address || []
      }
    });
    
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ 
      message: 'Error fetching form data',
      error: error.message 
    });
  }
};

module.exports = {
  createWellnessGuide,
  getWellnessGuideProfile,
  updateWellnessGuideProfile,
  getAllWellnessGuides,
  updateWellnessGuideApproval,
  getPendingWellnessGuides,
  checkWellnessGuideEligibility,
  getWellnessGuideFormData
};