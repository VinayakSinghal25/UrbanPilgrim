// controllers/userController.js
const User = require('../models/User');
const ROLES = require('../models/RoleEnum');
const cloudinary = require('../config/cloudinaryConfig');

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

// @desc    Register a new normal user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, about, contactNumber, address } = req.body;
  
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    const addressParsed = typeof address === 'string' ? JSON.parse(address) : address;

    user = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed by pre-save hook
      about,
      contactNumber,
      profilePictures: [], // Empty array for normal users
      roles: [ROLES.USER],
      address: addressParsed || [],
      provider: 'local',
      emailVerified: false, // Will need email verification
    });
    
    await user.save();
    const token = user.generateAuthToken();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Register User Error:', error);
    res.status(500).json({ message: 'Server error during user registration', error: error.message });
  }
};

// @desc    Register via Google Auth
// @route   POST /api/users/google-auth
// @access  Public
// Add this function to userController.js if missing
const googleAuth = async (req, res) => {
  const { credential } = req.body;
  
  try {
    // For now, just extract basic info from the credential
    // You'll need to implement proper Google token verification later
    const { email, firstName, lastName } = req.body;
    
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists - just login
      if (user.provider === 'local') {
        user.provider = 'google';
        user.emailVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        provider: 'google',
        emailVerified: true,
        roles: [ROLES.USER],
      });
      
      await user.save();
    }
    
    const token = user.generateAuthToken();
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      message: 'Google authentication successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ 
      message: 'Google authentication failed', 
      error: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is trying to login with password but registered via Google
    if (user.provider === 'google') {
      return res.status(400).json({ 
        message: 'Please login with Google. This account was created using Google authentication.' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    }

    const token = user.generateAuthToken();
    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Logged in successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current logged-in user's profile
// @route   GET /api/users/profile
// @access  Private (User, Admin)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('wellnessGuide');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive.' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const { firstName, lastName, email, about, contactNumber, address } = req.body;
  const userIdToUpdate = req.user.userId;

  try {
    let user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle password update if provided (only for local auth users)
    if (req.body.currentPassword && req.body.password) {
      if (user.provider === 'google') {
        return res.status(400).json({ 
          message: 'Cannot change password for Google authenticated accounts' 
        });
      }
      
      const userWithPassword = await User.findById(userIdToUpdate).select('+password');
      const isCurrentPasswordValid = await userWithPassword.comparePassword(req.body.currentPassword);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      user.password = req.body.password;
    }

    // Update general fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
      user.email = email;
      // If email is changed, set emailVerified to false (except for Google users)
      if (user.provider === 'local') {
        user.emailVerified = false;
      }
    }
    if (about !== undefined) user.about = about;
    if (contactNumber !== undefined) user.contactNumber = contactNumber;
    
    // Update address if provided
    if (address !== undefined) {
      user.address = Array.isArray(address) ? address : [];
    }
    
    // Handle profile picture uploads if provided
    if (req.files && req.files.length > 0) {
      const profilePictures = [];
      
      // Upload new pictures to Cloudinary
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        profilePictures.push({
          public_id: result.public_id,
          url: result.secure_url
        });
      }

      // Delete old pictures from Cloudinary (except Google profile pictures)
      if (user.profilePictures && user.profilePictures.length > 0) {
        for (const oldPic of user.profilePictures) {
          if (oldPic.public_id) { // Only delete if it has public_id (uploaded to our Cloudinary)
            await deleteFromCloudinary(oldPic.public_id);
          }
        }
      }

      user.profilePictures = profilePictures;
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    if (userResponse.password) delete userResponse.password;

    res.json({ message: 'Profile updated successfully', user: userResponse });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// @desc    Verify user email
// @route   POST /api/users/verify-email
// @access  Private
const verifyEmail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.emailVerified = true;
    await user.save();
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify Email Error:', error);
    res.status(500).json({ message: 'Server error verifying email', error: error.message });
  }
};

// --- ADMIN CONTROLLERS ---

// @desc    Get all users (for Admin)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate('wellnessGuide');
    res.json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
};

// @desc    Get user by ID (for Admin)
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('wellnessGuide');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get User By ID Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error fetching user', error: error.message });
  }
};

// @desc    Update user by ID (for Admin)
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUserById = async (req, res) => {
  const { firstName, lastName, email, roles, isVerified, isActive, about, contactNumber, emailVerified } = req.body;
  
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for email uniqueness if it's being changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
      user.email = email;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (roles !== undefined) user.roles = Array.isArray(roles) ? roles : String(roles).split(',');
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isActive !== undefined) user.isActive = isActive;
    if (about !== undefined) user.about = about;
    if (contactNumber !== undefined) user.contactNumber = contactNumber;
    if (emailVerified !== undefined) user.emailVerified = emailVerified;

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    if (userResponse.password) delete userResponse.password;

    res.json({ message: 'User updated successfully by admin', user: userResponse });
  } catch (error) {
    console.error('Admin Update User Error:', error);
    res.status(500).json({ message: 'Server error updating user by admin', error: error.message });
  }
};

// @desc    Delete user by ID (for Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete profile pictures from Cloudinary before deleting user
    if (user.profilePictures && user.profilePictures.length > 0) {
      for (const pic of user.profilePictures) {
        if (pic.public_id) await deleteFromCloudinary(pic.public_id);
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully by admin' });
  } catch (error) {
    console.error('Admin Delete User Error:', error);
    res.status(500).json({ message: 'Server error deleting user', error: error.message });
  }
};

module.exports = {
  registerUser,
  googleAuth,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};