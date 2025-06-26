// controllers/wellnessGuideClassController.js
const WellnessGuideClass = require('../models/WellnessGuideClass');
const WellnessGuide = require('../models/WellnessGuide');
const User = require('../models/User');
const TimeSlot = require('../models/TimeSlot');
const ClassScheduleRequest = require('../models/ClassScheduleRequest');
const ROLES = require('../models/RoleEnum');
const moment = require('moment-timezone');
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');

// @desc    Create wellness guide class with photos - UPDATED for separate online/offline scheduling
// @route   POST /api/wellness-guide-classes
// @access  Private (Approved Wellness Guides only)
const createWellnessGuideClass = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if user is an approved wellness guide
    const wellnessGuide = await WellnessGuide.findOne({ 
      user: userId, 
      isApproved: true, 
      isActive: true 
    });
    
    if (!wellnessGuide) {
      return res.status(403).json({ 
        message: 'You must be an approved wellness guide to create classes' 
      });
    }

    const {
      title,
      description,
      guideCertifications,
      skillsToLearn,
      aboutSections,
      specialty,
      timezone,
      modes,
      scheduleConfig,
      tags,
      difficulty,
      selectedAddressId,
      newAddress,
      isNewAddress
    } = req.body;

    // Parse JSON strings (since we're using FormData)
    const parsedModes = typeof modes === 'string' ? JSON.parse(modes) : modes;
    const parsedScheduleConfig = typeof scheduleConfig === 'string' ? JSON.parse(scheduleConfig) : scheduleConfig;
    const parsedGuideCertifications = typeof guideCertifications === 'string' ? JSON.parse(guideCertifications) : guideCertifications;
    const parsedSkillsToLearn = typeof skillsToLearn === 'string' ? JSON.parse(skillsToLearn) : skillsToLearn;
    const parsedAboutSections = typeof aboutSections === 'string' ? JSON.parse(aboutSections) : aboutSections;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    
    // Validate at least one mode is enabled
    if (!parsedModes.online?.enabled && !parsedModes.offline?.enabled) {
      return res.status(400).json({ 
        message: 'At least one mode (online or offline) must be enabled' 
      });
    }
    
    // Validate enabled modes have required fields
    if (parsedModes.online?.enabled) {
      if (!parsedModes.online.maxCapacity || !parsedModes.online.price) {
        return res.status(400).json({ 
          message: 'Online mode requires maxCapacity and price' 
        });
      }
    }
    
    if (parsedModes.offline?.enabled) {
      if (!parsedModes.offline.maxCapacity || !parsedModes.offline.price) {
        return res.status(400).json({ 
          message: 'Offline mode requires maxCapacity and price' 
        });
      }
    }

    // Handle offline address
    let offlineAddress = null;
    if (parsedModes.offline?.enabled) {
      if (isNewAddress === 'true') {
        const parsedNewAddress = typeof newAddress === 'string' ? JSON.parse(newAddress) : newAddress;
        
        if (!parsedNewAddress || !parsedNewAddress.street || !parsedNewAddress.city || 
            !parsedNewAddress.state || !parsedNewAddress.zipCode) {
          return res.status(400).json({ 
            message: 'Complete address is required for offline mode' 
          });
        }
        
        offlineAddress = parsedNewAddress;
        
        // Add this address to user's addresses as well
        const user = await User.findById(userId);
        if (user) {
          user.address = user.address || [];
          user.address.push(offlineAddress);
          await user.save();
        }
      } else {
        if (!selectedAddressId) {
          return res.status(400).json({ 
            message: 'Please select an address or provide a new one for offline mode' 
          });
        }
        
        const user = await User.findById(userId);
        if (!user || !user.address) {
          return res.status(400).json({ 
            message: 'No addresses found for this user' 
          });
        }
        
        const selectedAddress = user.address.id(selectedAddressId);
        if (!selectedAddress) {
          return res.status(400).json({ 
            message: 'Selected address not found' 
          });
        }
        
        offlineAddress = selectedAddress.toObject();
      }
      
      parsedModes.offline.address = offlineAddress;
    }

    // NEW: Validate schedule configuration for separate online/offline scheduling
    if (parsedModes.online?.enabled) {
      if (!parsedScheduleConfig.online?.selectedDays || parsedScheduleConfig.online.selectedDays.length === 0) {
        return res.status(400).json({ 
          message: 'At least one day must be selected for online mode' 
        });
      }
      
      if (!parsedScheduleConfig.online?.dateRange?.startDate || !parsedScheduleConfig.online?.dateRange?.endDate) {
        return res.status(400).json({ 
          message: 'Date range is required for online mode' 
        });
      }
      
      if (!parsedScheduleConfig.online?.timeSlots || parsedScheduleConfig.online.timeSlots.length === 0) {
        return res.status(400).json({ 
          message: 'Online time slots are required when online mode is enabled' 
        });
      }
    }
    
    if (parsedModes.offline?.enabled) {
      if (!parsedScheduleConfig.offline?.selectedDays || parsedScheduleConfig.offline.selectedDays.length === 0) {
        return res.status(400).json({ 
          message: 'At least one day must be selected for offline mode' 
        });
      }
      
      if (!parsedScheduleConfig.offline?.dateRange?.startDate || !parsedScheduleConfig.offline?.dateRange?.endDate) {
        return res.status(400).json({ 
          message: 'Date range is required for offline mode' 
        });
      }
      
      if (!parsedScheduleConfig.offline?.timeSlots || parsedScheduleConfig.offline.timeSlots.length === 0) {
        return res.status(400).json({ 
          message: 'Offline time slots are required when offline mode is enabled' 
        });
      }
    }

    // Upload photos to Cloudinary
    const photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'wellness-guide-classes',
            transformation: [
              { width: 800, height: 600, crop: 'fill', quality: 'auto' }
            ]
          });
          photoUrls.push(result.secure_url);
          
          // Delete local file
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
        }
      }
    }
    
    // Create the class
    const wellnessGuideClass = new WellnessGuideClass({
      wellnessGuide: wellnessGuide._id,
      title,
      description,
      photos: photoUrls,
      guideCertifications: parsedGuideCertifications || [],
      skillsToLearn: parsedSkillsToLearn || [],
      aboutSections: parsedAboutSections || [],
      specialty,
      timezone: timezone || 'Asia/Kolkata',
      modes: parsedModes,
      scheduleConfig: parsedScheduleConfig,
      tags: parsedTags || [],
      difficulty: difficulty || 'Beginner',
      status: 'draft'
    });
    
    await wellnessGuideClass.save();
    
    // Create schedule request for async processing
    const scheduleRequest = new ClassScheduleRequest({
      wellnessGuideClass: wellnessGuideClass._id,
      wellnessGuide: wellnessGuide._id,
      requestData: {
        modes: parsedModes,
        scheduleConfig: parsedScheduleConfig,
        timezone: timezone || 'Asia/Kolkata'
      }
    });
    
    await scheduleRequest.save();
    
    // Queue the slot generation
    processSlotGeneration(scheduleRequest._id);
    
    await wellnessGuideClass.populate([
      { path: 'wellnessGuide', select: 'user email', populate: { path: 'user', select: 'firstName lastName' } },
      { path: 'specialty', select: 'name description' }
    ]);
    
    res.status(201).json({
      message: 'Class created successfully. Time slots are being generated and will be validated for conflicts.',
      wellnessGuideClass,
      scheduleRequestId: scheduleRequest._id
    });
    
  } catch (error) {
    console.error('Error creating wellness guide class:', error);
    res.status(500).json({ 
      message: 'Error creating class',
      error: error.message 
    });
  }
};

// @desc    Get user's addresses for address selection
// @route   GET /api/wellness-guide-classes/my-addresses
// @access  Private (Wellness Guides)
const getMyAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('address');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      addresses: user.address || []
    });
    
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json({ 
      message: 'Error fetching addresses',
      error: error.message 
    });
  }
};

// Helper function to check for overlaps within the same class
const checkIntraClassConflicts = (slotsToCreate) => {
  const conflicts = [];
  
  for (let i = 0; i < slotsToCreate.length; i++) {
    for (let j = i + 1; j < slotsToCreate.length; j++) {
      const slot1 = slotsToCreate[i];
      const slot2 = slotsToCreate[j];
      
      // Only check slots on the same date
      if (slot1.date.getTime() !== slot2.date.getTime()) {
        continue;
      }
      
      // Check for time overlap
      const slot1Start = slot1.startTimeUTC.getTime();
      const slot1End = slot1.endTimeUTC.getTime();
      const slot2Start = slot2.startTimeUTC.getTime();
      const slot2End = slot2.endTimeUTC.getTime();
      
      // True overlap: slot1 starts before slot2 ends AND slot1 ends after slot2 starts
      const hasOverlap = (slot1Start < slot2End) && (slot1End > slot2Start);
      
      // Adjacent slots (one ends exactly when other starts) should NOT be considered conflicts
      const isAdjacent = (slot1End === slot2Start) || (slot2End === slot1Start);
      
      if (hasOverlap && !isAdjacent) {
        conflicts.push({
          date: slot1.date,
          slot1: `${slot1.startTime} - ${slot1.endTime} (${slot1.mode})`,
          slot2: `${slot2.startTime} - ${slot2.endTime} (${slot2.mode})`,
          conflictType: 'intra_class_overlap'
        });
      }
    }
  }
  
  return conflicts;
};

// @desc    Process slot generation (background job) - UPDATED for separate online/offline scheduling
const processSlotGeneration = async (scheduleRequestId) => {
  let scheduleRequest; // Declare outside try block for error handling access
  try {
    scheduleRequest = await ClassScheduleRequest.findById(scheduleRequestId)
      .populate('wellnessGuideClass')
      .populate('wellnessGuide');
    
    if (!scheduleRequest) {
      console.error('Schedule request not found:', scheduleRequestId);
      return;
    }
    
    // Update status to processing
    scheduleRequest.status = 'processing';
    await scheduleRequest.save();
    
    const { modes, scheduleConfig, timezone } = scheduleRequest.requestData;
    const conflicts = [];
    const slotsToCreate = [];
    
    // Generate online slots if enabled
    if (modes.online?.enabled) {
      const onlineConfig = scheduleConfig.online;
      const startDate = moment.tz(onlineConfig.dateRange.startDate, timezone);
      const endDate = moment.tz(onlineConfig.dateRange.endDate, timezone);
      
      for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'day')) {
        const dayOfWeek = date.format('dddd');
        
        if (!onlineConfig.selectedDays.includes(dayOfWeek)) {
          continue;
        }
        
        for (const timeSlot of onlineConfig.timeSlots) {
          const slotData = {
            wellnessGuideClass: scheduleRequest.wellnessGuideClass._id,
            wellnessGuide: scheduleRequest.wellnessGuide._id,
            mode: 'online',
            date: date.toDate(),
            dayOfWeek,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            startTimeUTC: moment.tz(`${date.format('YYYY-MM-DD')} ${timeSlot.startTime}`, timezone).utc().toDate(),
            endTimeUTC: moment.tz(`${date.format('YYYY-MM-DD')} ${timeSlot.endTime}`, timezone).utc().toDate(),
            timezone,
            maxCapacity: modes.online.maxCapacity,
            price: modes.online.price,
            currentBookings: 0,
            availableSlots: modes.online.maxCapacity,
          };
          
          // Check for conflicts with existing slots in database
          const conflict = await checkSlotConflict(slotData);
          if (conflict) {
            conflicts.push({
              date: date.toDate(),
              timeSlot: `${timeSlot.startTime} - ${timeSlot.endTime}`,
              mode: 'online',
              conflictsWith: conflict,
              conflictType: 'external_conflict'
            });
          } else {
            slotsToCreate.push(slotData);
          }
        }
      }
    }
    
    // Generate offline slots if enabled
    if (modes.offline?.enabled) {
      const offlineConfig = scheduleConfig.offline;
      const startDate = moment.tz(offlineConfig.dateRange.startDate, timezone);
      const endDate = moment.tz(offlineConfig.dateRange.endDate, timezone);
      
      for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'day')) {
        const dayOfWeek = date.format('dddd');
        
        if (!offlineConfig.selectedDays.includes(dayOfWeek)) {
          continue;
        }
        
        for (const timeSlot of offlineConfig.timeSlots) {
          const slotData = {
            wellnessGuideClass: scheduleRequest.wellnessGuideClass._id,
            wellnessGuide: scheduleRequest.wellnessGuide._id,
            mode: 'offline',
            date: date.toDate(),
            dayOfWeek,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            startTimeUTC: moment.tz(`${date.format('YYYY-MM-DD')} ${timeSlot.startTime}`, timezone).utc().toDate(),
            endTimeUTC: moment.tz(`${date.format('YYYY-MM-DD')} ${timeSlot.endTime}`, timezone).utc().toDate(),
            timezone,
            maxCapacity: modes.offline.maxCapacity,
            price: modes.offline.price,
            currentBookings: 0,
            availableSlots: modes.offline.maxCapacity,
          };
          
          // Check for conflicts with existing slots in database
          const conflict = await checkSlotConflict(slotData);
          if (conflict) {
            conflicts.push({
              date: date.toDate(),
              timeSlot: `${timeSlot.startTime} - ${timeSlot.endTime}`,
              mode: 'offline',
              conflictsWith: conflict,
              conflictType: 'external_conflict'
            });
          } else {
            slotsToCreate.push(slotData);
          }
        }
      }
    }
    
    // Check for conflicts within the same class (includes cross-mode conflicts)
    const intraClassConflicts = checkIntraClassConflicts(slotsToCreate);
    if (intraClassConflicts.length > 0) {
      conflicts.push(...intraClassConflicts);
    }
    
    if (conflicts.length > 0) {
      // Update request with conflicts
      scheduleRequest.status = 'failed';
      scheduleRequest.conflicts = conflicts;
      scheduleRequest.error = 'Time slot conflicts detected';
      scheduleRequest.processedAt = new Date();
      
      // Update class status
      await WellnessGuideClass.findByIdAndUpdate(scheduleRequest.wellnessGuideClass._id, {
        slotGenerationStatus: 'failed',
        slotGenerationError: 'Time slot conflicts detected. Please adjust your schedule.'
      });
      
      await scheduleRequest.save();
      return;
    }
    
    // Create all slots
    await TimeSlot.insertMany(slotsToCreate);
    
    // Update request and class status
    scheduleRequest.status = 'completed';
    scheduleRequest.slotsGenerated = slotsToCreate.length;
    scheduleRequest.processedAt = new Date();
    await scheduleRequest.save();
    
    await WellnessGuideClass.findByIdAndUpdate(scheduleRequest.wellnessGuideClass._id, {
      slotsGenerated: true,
      slotGenerationStatus: 'completed',
      status: 'pending_approval'
    });
    
    console.log(`Successfully generated ${slotsToCreate.length} time slots for class ${scheduleRequest.wellnessGuideClass._id}`);
    
  } catch (error) {
    console.error('Error processing slot generation:', error);
    
    // Update request with error
    await ClassScheduleRequest.findByIdAndUpdate(scheduleRequestId, {
      status: 'failed',
      error: error.message,
      processedAt: new Date()
    });
    
    // Update class status
    if (scheduleRequest?.wellnessGuideClass?._id) {
      await WellnessGuideClass.findByIdAndUpdate(scheduleRequest.wellnessGuideClass._id, {
        slotGenerationStatus: 'failed',
        slotGenerationError: error.message
      });
    }
  }
};

// Helper function to check slot conflicts
const checkSlotConflict = async (slotData) => {
  const existingSlot = await TimeSlot.findOne({
    wellnessGuide: slotData.wellnessGuide,
    date: slotData.date, // Same date
    $or: [
      {
        // True overlap: new slot starts before existing ends AND new slot ends after existing starts
        startTimeUTC: { $lt: slotData.endTimeUTC },
        endTimeUTC: { $gt: slotData.startTimeUTC }
      }
    ],
    isActive: true
  }).populate('wellnessGuideClass', 'title');
  
  if (existingSlot) {
    // Additional check: adjacent slots (end time = start time) should NOT conflict
    const existingEndTime = existingSlot.endTimeUTC.getTime();
    const newStartTime = slotData.startTimeUTC.getTime();
    const existingStartTime = existingSlot.startTimeUTC.getTime();
    const newEndTime = slotData.endTimeUTC.getTime();
    
    // If slots are adjacent (one ends exactly when other starts), it's NOT a conflict
    if (existingEndTime === newStartTime || existingStartTime === newEndTime) {
      return null; // No conflict
    }
    
    return `${existingSlot.wellnessGuideClass.title} (${existingSlot.mode})`;
  }
  
  return null;
};

// @desc    Get wellness guide's classes
// @route   GET /api/wellness-guide-classes/my-classes
// @access  Private (Wellness Guides)
const getMyClasses = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const wellnessGuide = await WellnessGuide.findOne({ user: userId });
    if (!wellnessGuide) {
      return res.status(404).json({ message: 'Wellness guide profile not found' });
    }
    
    const { page = 1, limit = 10, status } = req.query;
    
    let filter = { wellnessGuide: wellnessGuide._id };
    if (status) {
      filter.status = status;
    }
    
    const classes = await WellnessGuideClass.find(filter)
      .populate('specialty', 'name description')
      .populate('wellnessGuide', 'user', {
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await WellnessGuideClass.countDocuments(filter);
    
    res.json({
      classes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalClasses: total
    });
    
  } catch (error) {
    console.error('Error fetching my classes:', error);
    res.status(500).json({ 
      message: 'Error fetching classes',
      error: error.message 
    });
  }
};

// @desc    Get class details with time slots
// @route   GET /api/wellness-guide-classes/:id
// @access  Public
const getClassDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const classDetails = await WellnessGuideClass.findById(id)
      .populate('specialty', 'name description')
      .populate('wellnessGuide', 'user profilePictures', {
        populate: { path: 'user', select: 'firstName lastName' }
      });
    
    if (!classDetails) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Get time slots for this class
    const timeSlots = await TimeSlot.find({ 
      wellnessGuideClass: id, 
      isActive: true,
      date: { $gte: new Date() } // Only future slots
    }).sort({ date: 1, startTime: 1 });
    
    res.json({
      classDetails,
      timeSlots
    });
    
  } catch (error) {
    console.error('Error fetching class details:', error);
    res.status(500).json({ 
      message: 'Error fetching class details',
      error: error.message 
    });
  }
};

// @desc    Check schedule request status
// @route   GET /api/wellness-guide-classes/schedule-status/:requestId
// @access  Private (Wellness Guides)
const getScheduleRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;
    
    const wellnessGuide = await WellnessGuide.findOne({ user: userId });
    if (!wellnessGuide) {
      return res.status(404).json({ message: 'Wellness guide profile not found' });
    }
    
    const scheduleRequest = await ClassScheduleRequest.findOne({
      _id: requestId,
      wellnessGuide: wellnessGuide._id
    }).populate('wellnessGuideClass', 'title status slotGenerationStatus slotGenerationError');
    
    if (!scheduleRequest) {
      return res.status(404).json({ message: 'Schedule request not found' });
    }
    
    res.json({
      status: scheduleRequest.status,
      slotsGenerated: scheduleRequest.slotsGenerated,
      conflicts: scheduleRequest.conflicts,
      error: scheduleRequest.error,
      processedAt: scheduleRequest.processedAt,
      classDetails: scheduleRequest.wellnessGuideClass
    });
    
  } catch (error) {
    console.error('Error fetching schedule request status:', error);
    res.status(500).json({ 
      message: 'Error fetching schedule request status',
      error: error.message 
    });
  }
};

// @desc    Update platform margin (Admin only)
// @route   PATCH /api/wellness-guide-classes/:id/platform-margin
// @access  Private (Admin only)
const updatePlatformMargin = async (req, res) => {
  try {
    const { id } = req.params;
    const { online, offline } = req.body;

    // Validate input
    if (online !== undefined && (online < 0 || online > 100)) {
      return res.status(400).json({ message: 'Online platform margin must be between 0 and 100' });
    }
    
    if (offline !== undefined && (offline < 0 || offline > 100)) {
      return res.status(400).json({ message: 'Offline platform margin must be between 0 and 100' });
    }

    const updateData = {};
    if (online !== undefined) {
      updateData['adminSettings.platformMargin.online'] = parseFloat(online.toFixed(2));
    }
    if (offline !== undefined) {
      updateData['adminSettings.platformMargin.offline'] = parseFloat(offline.toFixed(2));
    }

    const updatedClass = await WellnessGuideClass.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('specialty', 'name description')
     .populate('wellnessGuide', 'user', {
       populate: { path: 'user', select: 'firstName lastName' }
     });

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({
      message: 'Platform margin updated successfully',
      class: updatedClass
    });

  } catch (error) {
    console.error('Error updating platform margin:', error);
    res.status(500).json({ 
      message: 'Error updating platform margin',
      error: error.message 
    });
  }
};

// @desc    Update discount settings (Admin only)
// @route   PATCH /api/wellness-guide-classes/:id/discount-settings
// @access  Private (Admin only)
const updateDiscountSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { onlineDiscount, offlineDiscount } = req.body;

    // Validate discount tiers
    const validateTiers = (tiers, mode) => {
      if (!Array.isArray(tiers)) {
        throw new Error(`${mode} discount tiers must be an array`);
      }
      
      for (const tier of tiers) {
        if (!tier.minClasses || tier.minClasses < 1) {
          throw new Error(`${mode} discount tier must have minClasses >= 1`);
        }
        if (tier.discountPercentage === undefined || tier.discountPercentage < 0 || tier.discountPercentage > 100) {
          throw new Error(`${mode} discount percentage must be between 0 and 100`);
        }
      }
    };

    const updateData = {};

    if (onlineDiscount !== undefined) {
      if (onlineDiscount.isEnabled && onlineDiscount.tiers) {
        validateTiers(onlineDiscount.tiers, 'Online');
      }
      updateData['adminSettings.onlineDiscount'] = {
        isEnabled: onlineDiscount.isEnabled || false,
        tiers: onlineDiscount.tiers || []
      };
    }

    if (offlineDiscount !== undefined) {
      if (offlineDiscount.isEnabled && offlineDiscount.tiers) {
        validateTiers(offlineDiscount.tiers, 'Offline');
      }
      updateData['adminSettings.offlineDiscount'] = {
        isEnabled: offlineDiscount.isEnabled || false,
        tiers: offlineDiscount.tiers || []
      };
    }

    const updatedClass = await WellnessGuideClass.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('specialty', 'name description')
     .populate('wellnessGuide', 'user', {
       populate: { path: 'user', select: 'firstName lastName' }
     });

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({
      message: 'Discount settings updated successfully',
      class: updatedClass
    });

  } catch (error) {
    console.error('Error updating discount settings:', error);
    res.status(500).json({ 
      message: 'Error updating discount settings',
      error: error.message 
    });
  }
};
// @desc    Get pending wellness guide classes for admin approval
// @route   GET /api/wellness-guide-classes/admin/pending
// @access  Private (Admin only)
const getPendingClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const filter = { 
      status: 'pending_approval',
      isActive: true,
      slotsGenerated: true 
    };
    
    const pendingClasses = await WellnessGuideClass.find(filter)
      .populate('wellnessGuide', 'user profilePictures', {
        populate: { path: 'user', select: 'firstName lastName email' }
      })
      .populate('specialty', 'name description')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await WellnessGuideClass.countDocuments(filter);
    
    res.json({
      pendingClasses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPending: total
    });
    
  } catch (error) {
    console.error('Error fetching pending classes:', error);
    res.status(500).json({ 
      message: 'Error fetching pending classes',
      error: error.message 
    });
  }
};

// @desc    Approve or reject wellness guide class
// @route   PUT /api/wellness-guide-classes/:id/approval
// @access  Private (Admin only)
const updateClassApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, rejectionReason } = req.body;
    const adminId = req.user.userId;
    
    const wellnessGuideClass = await WellnessGuideClass.findById(id);
    if (!wellnessGuideClass) {
      return res.status(404).json({ message: 'Wellness guide class not found' });
    }
    
    if (wellnessGuideClass.status !== 'pending_approval') {
      return res.status(400).json({ 
        message: 'Class is not pending approval' 
      });
    }
    
    if (isApproved) {
      // Approve the class
      wellnessGuideClass.status = 'active';
      wellnessGuideClass.approvedAt = new Date();
      wellnessGuideClass.approvedBy = adminId;
      wellnessGuideClass.rejectedAt = null;
      wellnessGuideClass.rejectedBy = null;
      wellnessGuideClass.rejectionReason = null;
    } else {
      // Reject the class
      if (!rejectionReason) {
        return res.status(400).json({ 
          message: 'Rejection reason is required when rejecting a class' 
        });
      }
      
      wellnessGuideClass.status = 'rejected';
      wellnessGuideClass.rejectedAt = new Date();
      wellnessGuideClass.rejectedBy = adminId;
      wellnessGuideClass.rejectionReason = rejectionReason;
      wellnessGuideClass.approvedAt = null;
      wellnessGuideClass.approvedBy = null;
    }
    
    await wellnessGuideClass.save();
    
    await wellnessGuideClass.populate([
      { 
        path: 'wellnessGuide', 
        select: 'user email', 
        populate: { path: 'user', select: 'firstName lastName' } 
      },
      { path: 'specialty', select: 'name description' },
      { path: 'approvedBy', select: 'firstName lastName email' },
      { path: 'rejectedBy', select: 'firstName lastName email' }
    ]);
    
    res.json({
      message: `Class ${isApproved ? 'approved' : 'rejected'} successfully`,
      wellnessGuideClass
    });
    
  } catch (error) {
    console.error('Error updating class approval:', error);
    res.status(500).json({ 
      message: 'Error updating approval status',
      error: error.message 
    });
  }
};

// @desc    Get all classes for admin management
// @route   GET /api/wellness-guide-classes/admin/all
// @access  Private (Admin only)
const getAllClassesForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, wellnessGuideId } = req.query;
    
    let filter = { isActive: true };
    
    if (status) {
      filter.status = status;
    }
    
    if (wellnessGuideId) {
      filter.wellnessGuide = wellnessGuideId;
    }
    
    const classes = await WellnessGuideClass.find(filter)
      .populate('wellnessGuide', 'user profilePictures', {
        populate: { path: 'user', select: 'firstName lastName email' }
      })
      .populate('specialty', 'name description')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await WellnessGuideClass.countDocuments(filter);
    
    res.json({
      classes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalClasses: total
    });
    
  } catch (error) {
    console.error('Error fetching classes for admin:', error);
    res.status(500).json({ 
      message: 'Error fetching classes',
      error: error.message 
    });
  }
};
// @desc    Update wellness guide class - UPDATED for separate online/offline scheduling
// @route   PUT /api/wellness-guide-classes/:id
// @access  Private (Wellness Guide - own classes only)
const updateWellnessGuideClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if user is an approved wellness guide
    const wellnessGuide = await WellnessGuide.findOne({ 
      user: userId, 
      isApproved: true, 
      isActive: true 
    });
    
    if (!wellnessGuide) {
      return res.status(403).json({ 
        message: 'You must be an approved wellness guide to update classes' 
      });
    }

    // Find the class and verify ownership
    const existingClass = await WellnessGuideClass.findOne({
      _id: id,
      wellnessGuide: wellnessGuide._id
    });

    if (!existingClass) {
      return res.status(404).json({ 
        message: 'Class not found or you do not have permission to update it' 
      });
    }

    // Only allow updates for draft and rejected classes
    if (!['draft', 'rejected'].includes(existingClass.status)) {
      return res.status(400).json({ 
        message: 'Only draft or rejected classes can be updated' 
      });
    }

    const {
      title,
      description,
      guideCertifications,
      skillsToLearn,
      aboutSections,
      specialty,
      timezone,
      modes,
      scheduleConfig,
      tags,
      difficulty,
      selectedAddressId,
      newAddress,
      isNewAddress,
      removePhotos // Array of photo URLs to remove
    } = req.body;

    // Parse JSON strings (since we're using FormData)
    const parsedModes = typeof modes === 'string' ? JSON.parse(modes) : modes;
    const parsedScheduleConfig = typeof scheduleConfig === 'string' ? JSON.parse(scheduleConfig) : scheduleConfig;
    const parsedGuideCertifications = typeof guideCertifications === 'string' ? JSON.parse(guideCertifications) : guideCertifications;
    const parsedSkillsToLearn = typeof skillsToLearn === 'string' ? JSON.parse(skillsToLearn) : skillsToLearn;
    const parsedAboutSections = typeof aboutSections === 'string' ? JSON.parse(aboutSections) : aboutSections;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    const parsedRemovePhotos = typeof removePhotos === 'string' ? JSON.parse(removePhotos) : removePhotos;

    // Validate at least one mode is enabled
    if (!parsedModes.online?.enabled && !parsedModes.offline?.enabled) {
      return res.status(400).json({ 
        message: 'At least one mode (online or offline) must be enabled' 
      });
    }
    
    // Validate enabled modes have required fields
    if (parsedModes.online?.enabled) {
      if (!parsedModes.online.maxCapacity || !parsedModes.online.price) {
        return res.status(400).json({ 
          message: 'Online mode requires maxCapacity and price' 
        });
      }
    }
    
    if (parsedModes.offline?.enabled) {
      if (!parsedModes.offline.maxCapacity || !parsedModes.offline.price) {
        return res.status(400).json({ 
          message: 'Offline mode requires maxCapacity and price' 
        });
      }
    }

    // Handle offline address
    let offlineAddress = null;
    if (parsedModes.offline?.enabled) {
      if (isNewAddress === 'true') {
        const parsedNewAddress = typeof newAddress === 'string' ? JSON.parse(newAddress) : newAddress;
        
        if (!parsedNewAddress || !parsedNewAddress.street || !parsedNewAddress.city || 
            !parsedNewAddress.state || !parsedNewAddress.zipCode) {
          return res.status(400).json({ 
            message: 'Complete address is required for offline mode' 
          });
        }
        
        offlineAddress = parsedNewAddress;
        
        // Add this address to user's addresses as well
        const user = await User.findById(userId);
        if (user) {
          user.address = user.address || [];
          user.address.push(offlineAddress);
          await user.save();
        }
      } else {
        if (!selectedAddressId) {
          return res.status(400).json({ 
            message: 'Please select an address or provide a new one for offline mode' 
          });
        }
        
        const user = await User.findById(userId);
        if (!user || !user.address) {
          return res.status(400).json({ 
            message: 'No addresses found for this user' 
          });
        }
        
        const selectedAddress = user.address.id(selectedAddressId);
        if (!selectedAddress) {
          return res.status(400).json({ 
            message: 'Selected address not found' 
          });
        }
        
        offlineAddress = selectedAddress.toObject();
      }
      
      parsedModes.offline.address = offlineAddress;
    }

    // NEW: Validate schedule configuration for separate online/offline scheduling
    if (parsedModes.online?.enabled) {
      if (!parsedScheduleConfig.online?.selectedDays || parsedScheduleConfig.online.selectedDays.length === 0) {
        return res.status(400).json({ 
          message: 'At least one day must be selected for online mode' 
        });
      }
      
      if (!parsedScheduleConfig.online?.dateRange?.startDate || !parsedScheduleConfig.online?.dateRange?.endDate) {
        return res.status(400).json({ 
          message: 'Date range is required for online mode' 
        });
      }
      
      if (!parsedScheduleConfig.online?.timeSlots || parsedScheduleConfig.online.timeSlots.length === 0) {
        return res.status(400).json({ 
          message: 'Online time slots are required when online mode is enabled' 
        });
      }
    }
    
    if (parsedModes.offline?.enabled) {
      if (!parsedScheduleConfig.offline?.selectedDays || parsedScheduleConfig.offline.selectedDays.length === 0) {
        return res.status(400).json({ 
          message: 'At least one day must be selected for offline mode' 
        });
      }
      
      if (!parsedScheduleConfig.offline?.dateRange?.startDate || !parsedScheduleConfig.offline?.dateRange?.endDate) {
        return res.status(400).json({ 
          message: 'Date range is required for offline mode' 
        });
      }
      
      if (!parsedScheduleConfig.offline?.timeSlots || parsedScheduleConfig.offline.timeSlots.length === 0) {
        return res.status(400).json({ 
          message: 'Offline time slots are required when offline mode is enabled' 
        });
      }
    }

    // Handle photo updates
    let updatedPhotos = [...existingClass.photos];

    // Remove photos if specified
    if (parsedRemovePhotos && Array.isArray(parsedRemovePhotos)) {
      updatedPhotos = updatedPhotos.filter(photo => !parsedRemovePhotos.includes(photo));
      
      // Delete removed photos from Cloudinary
      for (const photoUrl of parsedRemovePhotos) {
        try {
          const publicId = photoUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`wellness-guide-classes/${publicId}`);
        } catch (deleteError) {
          console.error('Error deleting photo from Cloudinary:', deleteError);
        }
      }
    }

    // Upload new photos to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'wellness-guide-classes',
            transformation: [
              { width: 800, height: 600, crop: 'fill', quality: 'auto' }
            ]
          });
          updatedPhotos.push(result.secure_url);
          
          // Delete local file
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
        }
      }
    }

    // Update the class
    const updateData = {
      title: title || existingClass.title,
      description: description || existingClass.description,
      photos: updatedPhotos,
      guideCertifications: parsedGuideCertifications || existingClass.guideCertifications,
      skillsToLearn: parsedSkillsToLearn || existingClass.skillsToLearn,
      aboutSections: parsedAboutSections || existingClass.aboutSections,
      specialty: specialty || existingClass.specialty,
      timezone: timezone || existingClass.timezone,
      modes: parsedModes,
      scheduleConfig: parsedScheduleConfig,
      tags: parsedTags || existingClass.tags,
      difficulty: difficulty || existingClass.difficulty,
      status: 'draft', // Reset to draft for re-approval
      slotsGenerated: false, // Reset slot generation
      slotGenerationStatus: 'pending',
      slotGenerationError: null,
      // Clear approval/rejection fields
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null
    };

    const updatedClass = await WellnessGuideClass.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Delete existing time slots since class is being updated
    await TimeSlot.deleteMany({ wellnessGuideClass: id });

    // Create new schedule request for updated class
    const scheduleRequest = new ClassScheduleRequest({
      wellnessGuideClass: updatedClass._id,
      wellnessGuide: wellnessGuide._id,
      requestData: {
        modes: parsedModes,
        scheduleConfig: parsedScheduleConfig,
        timezone: timezone || existingClass.timezone
      }
    });
    
    await scheduleRequest.save();
    
    // Queue the slot generation
    processSlotGeneration(scheduleRequest._id);
    
    await updatedClass.populate([
      { path: 'wellnessGuide', select: 'user email', populate: { path: 'user', select: 'firstName lastName' } },
      { path: 'specialty', select: 'name description' }
    ]);
    
    res.json({
      message: 'Class updated successfully. Time slots are being regenerated.',
      wellnessGuideClass: updatedClass,
      scheduleRequestId: scheduleRequest._id
    });
    
  } catch (error) {
    console.error('Error updating wellness guide class:', error);
    res.status(500).json({ 
      message: 'Error updating class',
      error: error.message 
    });
  }
};


// @desc    Add new time slots to existing class
// @route   POST /api/wellness-guide-classes/:classId/time-slots
// @access  Private (Wellness Guide - own classes only)
const addTimeSlots = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.userId;
    const { newSlots, mode } = req.body; // newSlots: [{ date, dayOfWeek, startTime, endTime }]
    
    // Verify ownership and class status
    const wellnessGuide = await WellnessGuide.findOne({ 
      user: userId, 
      isApproved: true, 
      isActive: true 
    });
    
    if (!wellnessGuide) {
      return res.status(403).json({ 
        message: 'You must be an approved wellness guide' 
      });
    }

    const classDetails = await WellnessGuideClass.findOne({
      _id: classId,
      wellnessGuide: wellnessGuide._id,
      status: 'active' // Only allow adding slots to active classes
    });

    if (!classDetails) {
      return res.status(404).json({ 
        message: 'Class not found or not accessible' 
      });
    }

    // Validate mode is enabled
    if (!classDetails.modes[mode]?.enabled) {
      return res.status(400).json({ 
        message: `${mode} mode is not enabled for this class` 
      });
    }

    // Validate newSlots array
    if (!newSlots || !Array.isArray(newSlots) || newSlots.length === 0) {
      return res.status(400).json({ 
        message: 'At least one new slot must be provided' 
      });
    }

    const conflicts = [];
    const slotsToCreate = [];
    
    // Process each new slot
    for (const slot of newSlots) {
      const slotDate = moment.tz(slot.date, classDetails.timezone);
      
      const slotData = {
        wellnessGuideClass: classDetails._id,
        wellnessGuide: wellnessGuide._id,
        mode,
        date: slotDate.toDate(),
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        startTimeUTC: moment.tz(`${slotDate.format('YYYY-MM-DD')} ${slot.startTime}`, classDetails.timezone).utc().toDate(),
        endTimeUTC: moment.tz(`${slotDate.format('YYYY-MM-DD')} ${slot.endTime}`, classDetails.timezone).utc().toDate(),
        timezone: classDetails.timezone,
        maxCapacity: classDetails.modes[mode].maxCapacity,
        price: classDetails.modes[mode].price,
        currentBookings: 0,
        availableSlots: classDetails.modes[mode].maxCapacity,
      };
      
      // Check for conflicts with existing slots (including other modes)
      const conflict = await checkSlotConflict(slotData);
      if (conflict) {
        conflicts.push({
          date: slotDate.toDate(),
          timeSlot: `${slot.startTime} - ${slot.endTime}`,
          mode,
          conflictsWith: conflict,
          conflictType: 'external_conflict'
        });
      } else {
        slotsToCreate.push(slotData);
      }
    }
    
    // NEW: Check for conflicts within the new slots being added in this request
    const intraRequestConflicts = checkIntraClassConflicts(slotsToCreate);
    if (intraRequestConflicts.length > 0) {
      conflicts.push(...intraRequestConflicts);
    }
    
    if (conflicts.length > 0) {
      return res.status(400).json({
        message: 'Time slot conflicts detected',
        conflicts,
        totalConflicts: conflicts.length
      });
    }
    
    if (slotsToCreate.length === 0) {
      return res.status(400).json({
        message: 'No valid time slots to create after conflict resolution'
      });
    }
    
    // Create new slots
    const createdSlots = await TimeSlot.insertMany(slotsToCreate);
    
    res.json({
      message: `Successfully added ${createdSlots.length} new time slots`,
      addedSlots: createdSlots.map(slot => ({
        id: slot._id,
        date: moment.tz(slot.date, classDetails.timezone).format('YYYY-MM-DD'),
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        mode: slot.mode,
        maxCapacity: slot.maxCapacity,
        price: slot.price
      }))
    });
    
  } catch (error) {
    console.error('Error adding time slots:', error);
    res.status(500).json({ 
      message: 'Error adding time slots',
      error: error.message 
    });
  }
};

// @desc    Cancel/Remove time slot (only if no bookings)
// @route   DELETE /api/wellness-guide-classes/:classId/time-slots/:slotId
// @access  Private (Wellness Guide - own classes only)
const removeTimeSlot = async (req, res) => {
  try {
    const { classId, slotId } = req.params;
    const userId = req.user.userId;
    
    // Verify ownership
    const wellnessGuide = await WellnessGuide.findOne({ 
      user: userId, 
      isApproved: true, 
      isActive: true 
    });
    
    if (!wellnessGuide) {
      return res.status(403).json({ 
        message: 'You must be an approved wellness guide' 
      });
    }

    // Verify class exists and is accessible
    const classDetails = await WellnessGuideClass.findOne({
      _id: classId,
      wellnessGuide: wellnessGuide._id,
      status: 'active' // Only allow removing slots from active classes
    });

    if (!classDetails) {
      return res.status(404).json({ 
        message: 'Class not found or not accessible' 
      });
    }

    // Find the time slot and verify ownership
    const timeSlot = await TimeSlot.findOne({
      _id: slotId,
      wellnessGuideClass: classId,
      wellnessGuide: wellnessGuide._id,
      isActive: true
    }).populate('wellnessGuideClass', 'title');

    if (!timeSlot) {
      return res.status(404).json({ 
        message: 'Time slot not found or not accessible' 
      });
    }

    // Check if slot has bookings
    if (timeSlot.currentBookings > 0) {
      return res.status(400).json({ 
        message: `Cannot remove time slot with ${timeSlot.currentBookings} existing booking(s). Please contact support for assistance.` 
      });
    }

    // Check if slot is in the past
    if (timeSlot.startTimeUTC < new Date()) {
      return res.status(400).json({ 
        message: 'Cannot remove past time slots' 
      });
    }

    // Soft delete (set isActive to false) rather than hard delete for audit trail
    await TimeSlot.findByIdAndUpdate(slotId, { isActive: false });
    
    res.json({
      message: 'Time slot removed successfully',
      removedSlot: {
        id: timeSlot._id,
        date: moment.tz(timeSlot.date, classDetails.timezone).format('YYYY-MM-DD'),
        dayOfWeek: timeSlot.dayOfWeek,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        mode: timeSlot.mode,
        classTitle: timeSlot.wellnessGuideClass.title
      }
    });
    
  } catch (error) {
    console.error('Error removing time slot:', error);
    res.status(500).json({ 
      message: 'Error removing time slot',
      error: error.message 
    });
  }
};

// @desc    Get schedule extension information with strict date validation - UPDATED for separate online/offline scheduling
// @route   GET /api/wellness-guide-classes/:classId/schedule-extension-info
// @access  Private (Wellness Guide - own classes only)
const getScheduleExtensionInfo = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.userId;
    
    // Verify ownership
    const wellnessGuide = await WellnessGuide.findOne({ 
      user: userId, 
      isApproved: true, 
      isActive: true 
    });
    
    if (!wellnessGuide) {
      return res.status(403).json({ 
        message: 'You must be an approved wellness guide' 
      });
    }

    const classDetails = await WellnessGuideClass.findOne({
      _id: classId,
      wellnessGuide: wellnessGuide._id,
      status: 'active'
    });

    if (!classDetails) {
      return res.status(404).json({ 
        message: 'Class not found or not accessible' 
      });
    }

    // NEW: Handle separate online/offline schedule configurations
    const originalOnlinePattern = classDetails.modes.online?.enabled ? {
      selectedDays: classDetails.scheduleConfig.online?.selectedDays || [],
      timeSlots: classDetails.scheduleConfig.online?.timeSlots || [],
      dateRange: classDetails.scheduleConfig.online?.dateRange,
      timezone: classDetails.timezone
    } : null;

    const originalOfflinePattern = classDetails.modes.offline?.enabled ? {
      selectedDays: classDetails.scheduleConfig.offline?.selectedDays || [],
      timeSlots: classDetails.scheduleConfig.offline?.timeSlots || [],
      dateRange: classDetails.scheduleConfig.offline?.dateRange,
      timezone: classDetails.timezone
    } : null;

    // Find the earliest start date and latest end date across both modes
    let originalStartDate = null;
    let originalEndDate = null;

    if (originalOnlinePattern?.dateRange) {
      const onlineStart = moment.tz(originalOnlinePattern.dateRange.startDate, classDetails.timezone);
      const onlineEnd = moment.tz(originalOnlinePattern.dateRange.endDate, classDetails.timezone);
      
      if (!originalStartDate || onlineStart.isBefore(originalStartDate)) {
        originalStartDate = onlineStart;
      }
      if (!originalEndDate || onlineEnd.isAfter(originalEndDate)) {
        originalEndDate = onlineEnd;
      }
    }

    if (originalOfflinePattern?.dateRange) {
      const offlineStart = moment.tz(originalOfflinePattern.dateRange.startDate, classDetails.timezone);
      const offlineEnd = moment.tz(originalOfflinePattern.dateRange.endDate, classDetails.timezone);
      
      if (!originalStartDate || offlineStart.isBefore(originalStartDate)) {
        originalStartDate = offlineStart;
      }
      if (!originalEndDate || offlineEnd.isAfter(originalEndDate)) {
        originalEndDate = offlineEnd;
      }
    }

    if (!originalStartDate || !originalEndDate) {
      return res.status(400).json({ 
        message: 'No valid original schedule configuration found' 
      });
    }

    // Find all existing time slots
    const allSlots = await TimeSlot.find({
      wellnessGuideClass: classId,
      isActive: true
    }).sort({ date: 1 });

    // NEW: Categorize slots for both modes
    const originalRecurringSlotsOnline = [];
    const originalRecurringSlotsOffline = [];
    const individuallyAddedSlots = [];
    
    allSlots.forEach(slot => {
      const slotDate = moment.tz(slot.date, classDetails.timezone);
      let isOriginalRecurring = false;

      if (slot.mode === 'online' && originalOnlinePattern) {
        const onlineStart = moment.tz(originalOnlinePattern.dateRange.startDate, classDetails.timezone);
        const onlineEnd = moment.tz(originalOnlinePattern.dateRange.endDate, classDetails.timezone);
        
        if (slotDate.isSameOrAfter(onlineStart, 'day') && 
            slotDate.isSameOrBefore(onlineEnd, 'day') &&
            originalOnlinePattern.selectedDays.includes(slot.dayOfWeek)) {
          
          const matchesOriginalTime = originalOnlinePattern.timeSlots.some(ts => 
            ts.startTime === slot.startTime && ts.endTime === slot.endTime
          );
          
          if (matchesOriginalTime) {
            originalRecurringSlotsOnline.push(slot);
            isOriginalRecurring = true;
          }
        }
      } else if (slot.mode === 'offline' && originalOfflinePattern) {
        const offlineStart = moment.tz(originalOfflinePattern.dateRange.startDate, classDetails.timezone);
        const offlineEnd = moment.tz(originalOfflinePattern.dateRange.endDate, classDetails.timezone);
        
        if (slotDate.isSameOrAfter(offlineStart, 'day') && 
            slotDate.isSameOrBefore(offlineEnd, 'day') &&
            originalOfflinePattern.selectedDays.includes(slot.dayOfWeek)) {
          
          const matchesOriginalTime = originalOfflinePattern.timeSlots.some(ts => 
            ts.startTime === slot.startTime && ts.endTime === slot.endTime
          );
          
          if (matchesOriginalTime) {
            originalRecurringSlotsOffline.push(slot);
            isOriginalRecurring = true;
          }
        }
      }

      if (!isOriginalRecurring) {
        individuallyAddedSlots.push(slot);
      }
    });

    // Find the absolute latest slot date (regardless of type)
    const latestSlot = allSlots[allSlots.length - 1];
    const latestSlotDate = latestSlot ? moment.tz(latestSlot.date, classDetails.timezone) : null;

    // STRICT RULE: Recurring extension can only start AFTER the latest date
    let earliestAllowedStartDate;
    if (latestSlotDate && latestSlotDate.isAfter(originalEndDate)) {
      earliestAllowedStartDate = latestSlotDate.clone().add(1, 'day');
    } else {
      earliestAllowedStartDate = originalEndDate.clone().add(1, 'day');
    }

    // Suggest start date as the earliest allowed date
    const suggestedStartDate = earliestAllowedStartDate.clone().startOf('day');
    
    // Suggest default extension period (3 months)
    const suggestedEndDate = suggestedStartDate.clone().add(3, 'months').endOf('day');

    // Calculate potential slots count for suggestion
    let potentialOnlineSlotsCount = 0;
    let potentialOfflineSlotsCount = 0;

    if (originalOnlinePattern) {
      for (let date = suggestedStartDate.clone(); date.isSameOrBefore(suggestedEndDate); date.add(1, 'day')) {
        if (originalOnlinePattern.selectedDays.includes(date.format('dddd'))) {
          potentialOnlineSlotsCount += originalOnlinePattern.timeSlots.length;
        }
      }
    }

    if (originalOfflinePattern) {
      for (let date = suggestedStartDate.clone(); date.isSameOrBefore(suggestedEndDate); date.add(1, 'day')) {
        if (originalOfflinePattern.selectedDays.includes(date.format('dddd'))) {
          potentialOfflineSlotsCount += originalOfflinePattern.timeSlots.length;
        }
      }
    }

    // Get existing individual slots that might conflict with future recurring
    const futureIndividualSlots = individuallyAddedSlots.filter(slot => {
      const slotDate = moment.tz(slot.date, classDetails.timezone);
      return slotDate.isAfter(originalEndDate);
    });

    res.json({
      classTitle: classDetails.title,
      enabledModes: {
        online: classDetails.modes.online?.enabled || false,
        offline: classDetails.modes.offline?.enabled || false
      },
      originalPatterns: {
        online: originalOnlinePattern ? {
          selectedDays: originalOnlinePattern.selectedDays,
          timeSlots: originalOnlinePattern.timeSlots,
          dateRange: originalOnlinePattern.dateRange,
          timezone: originalOnlinePattern.timezone
        } : null,
        offline: originalOfflinePattern ? {
          selectedDays: originalOfflinePattern.selectedDays,
          timeSlots: originalOfflinePattern.timeSlots,
          dateRange: originalOfflinePattern.dateRange,
          timezone: originalOfflinePattern.timezone
        } : null
      },
      scheduleAnalysis: {
        originalRecurringPeriod: {
          startDate: originalStartDate.format('YYYY-MM-DD'),
          endDate: originalEndDate.format('YYYY-MM-DD'),
          onlineSlotsCount: originalRecurringSlotsOnline.length,
          offlineSlotsCount: originalRecurringSlotsOffline.length,
          totalSlotsCount: originalRecurringSlotsOnline.length + originalRecurringSlotsOffline.length
        },
        individualSlotsAdded: {
          count: individuallyAddedSlots.length,
          slots: individuallyAddedSlots.map(slot => ({
            date: moment.tz(slot.date, classDetails.timezone).format('YYYY-MM-DD'),
            time: `${slot.startTime}-${slot.endTime}`,
            mode: slot.mode
          }))
        },
        latestSlotDate: latestSlotDate ? latestSlotDate.format('YYYY-MM-DD') : originalEndDate.format('YYYY-MM-DD')
      },
      recurringExtensionRules: {
        earliestAllowedStartDate: earliestAllowedStartDate.format('YYYY-MM-DD'),
        reason: latestSlotDate && latestSlotDate.isAfter(originalEndDate) 
          ? `Must start after your latest individual slot (${latestSlotDate.format('MMM DD, YYYY')})`
          : `Must start after your original recurring schedule (${originalEndDate.format('MMM DD, YYYY')})`,
        conflictWarning: futureIndividualSlots.length > 0 
          ? `Warning: You have ${futureIndividualSlots.length} individual slots after ${originalEndDate.format('MMM DD')}. New recurring slots will be checked for conflicts.`
          : "No conflicts expected with individual slots."
      },
      extensionSuggestion: {
        suggestedStartDate: suggestedStartDate.format('YYYY-MM-DD'),
        suggestedEndDate: suggestedEndDate.format('YYYY-MM-DD'),
        potentialOnlineSlotsCount,
        potentialOfflineSlotsCount,
        totalPotentialSlotsCount: potentialOnlineSlotsCount + potentialOfflineSlotsCount,
        message: `Continue your recurring pattern from ${suggestedStartDate.format('MMM DD, YYYY')} for 3 more months`
      },
      readyToExtend: {
        canExtend: true,
        note: "Recurring slots will be validated against existing individual slots during creation",
        extensionPayloads: {
          online: originalOnlinePattern ? {
            selectedDays: originalOnlinePattern.selectedDays,
            dateRange: {
              startDate: suggestedStartDate.toISOString(),
              endDate: suggestedEndDate.toISOString()
            },
            timeSlots: {
              online: originalOnlinePattern.timeSlots
            },
            modes: {
              online: { enabled: true },
              offline: { enabled: false }
            }
          } : null,
          offline: originalOfflinePattern ? {
            selectedDays: originalOfflinePattern.selectedDays,
            dateRange: {
              startDate: suggestedStartDate.toISOString(),
              endDate: suggestedEndDate.toISOString()
            },
            timeSlots: {
              offline: originalOfflinePattern.timeSlots
            },
            modes: {
              online: { enabled: false },
              offline: { enabled: true }
            }
          } : null,
          both: (originalOnlinePattern && originalOfflinePattern) ? {
            selectedDays: [...new Set([...originalOnlinePattern.selectedDays, ...originalOfflinePattern.selectedDays])],
            dateRange: {
              startDate: suggestedStartDate.toISOString(),
              endDate: suggestedEndDate.toISOString()
            },
            timeSlots: {
              online: originalOnlinePattern.timeSlots,
              offline: originalOfflinePattern.timeSlots
            },
            modes: {
              online: { enabled: true },
              offline: { enabled: true }
            }
          } : null
        }
      },
      individualSlotOption: {
        message: "To add slots before the earliest allowed recurring date, use 'Add Individual Time Slots'",
        allowedDateRange: {
          after: originalEndDate.format('YYYY-MM-DD'),
          before: earliestAllowedStartDate.format('YYYY-MM-DD')
        }
      }
    });

  } catch (error) {
    console.error('Error fetching schedule extension info:', error);
    res.status(500).json({ 
      message: 'Error fetching schedule extension info',
      error: error.message 
    });
  }
};

// @desc    Add recurring time slots extending existing schedule - UPDATED for separate online/offline scheduling
// @route   POST /api/wellness-guide-classes/:classId/recurring-time-slots
// @access  Private (Wellness Guide - own classes only)
const addRecurringTimeSlots = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.userId;
    const { 
      selectedDays, 
      dateRange, 
      timeSlots, // { online: [...], offline: [...] }
      modes // { online: { enabled: true }, offline: { enabled: false } }
    } = req.body;
    
    // Verify ownership and class status
    const wellnessGuide = await WellnessGuide.findOne({ 
      user: userId, 
      isApproved: true, 
      isActive: true 
    });
    
    if (!wellnessGuide) {
      return res.status(403).json({ 
        message: 'You must be an approved wellness guide' 
      });
    }

    const classDetails = await WellnessGuideClass.findOne({
      _id: classId,
      wellnessGuide: wellnessGuide._id,
      status: 'active'
    });

    if (!classDetails) {
      return res.status(404).json({ 
        message: 'Class not found or not accessible' 
      });
    }

    // Validate input
    if (!selectedDays || !Array.isArray(selectedDays) || selectedDays.length === 0) {
      return res.status(400).json({ 
        message: 'At least one day must be selected' 
      });
    }

    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
      return res.status(400).json({ 
        message: 'Date range (startDate and endDate) is required' 
      });
    }

    const startDate = moment.tz(dateRange.startDate, classDetails.timezone);
    const endDate = moment.tz(dateRange.endDate, classDetails.timezone);

    if (startDate.isSameOrAfter(endDate)) {
      return res.status(400).json({ 
        message: 'Start date must be before end date' 
      });
    }

    // NEW: Validate that requested modes are actually enabled in the class
    if (modes.online?.enabled && !classDetails.modes.online?.enabled) {
      return res.status(400).json({ 
        message: 'Online mode is not enabled for this class' 
      });
    }

    if (modes.offline?.enabled && !classDetails.modes.offline?.enabled) {
      return res.status(400).json({ 
        message: 'Offline mode is not enabled for this class' 
      });
    }

    // Validate modes and time slots
    if (!modes.online?.enabled && !modes.offline?.enabled) {
      return res.status(400).json({ 
        message: 'At least one mode (online or offline) must be enabled' 
      });
    }

    if (modes.online?.enabled && (!timeSlots.online || timeSlots.online.length === 0)) {
      return res.status(400).json({ 
        message: 'Online time slots are required when online mode is enabled' 
      });
    }

    if (modes.offline?.enabled && (!timeSlots.offline || timeSlots.offline.length === 0)) {
      return res.status(400).json({ 
        message: 'Offline time slots are required when offline mode is enabled' 
      });
    }

    // NEW: Validate time slot format
    const validateTimeSlots = (slots, mode) => {
      for (const slot of slots) {
        if (!slot.startTime || !slot.endTime) {
          throw new Error(`${mode} time slots must have startTime and endTime`);
        }
        
        const start = moment(slot.startTime, 'HH:mm');
        const end = moment(slot.endTime, 'HH:mm');
        
        if (!start.isValid() || !end.isValid()) {
          throw new Error(`${mode} time slots must have valid time format (HH:mm)`);
        }
        
        if (start.isSameOrAfter(end)) {
          throw new Error(`${mode} start time must be before end time`);
        }
      }
    };

    if (modes.online?.enabled) {
      validateTimeSlots(timeSlots.online, 'Online');
    }

    if (modes.offline?.enabled) {
      validateTimeSlots(timeSlots.offline, 'Offline');
    }

    // Get all existing time slots for this class, sorted by date
    const allExistingSlots = await TimeSlot.find({
      wellnessGuideClass: classId,
      isActive: true
    }).sort({ date: 1 });

    if (allExistingSlots.length === 0) {
      return res.status(400).json({ 
        message: 'No existing time slots found. Please create initial schedule first.' 
      });
    }

    // Find the latest date from existing slots
    const latestExistingSlot = allExistingSlots[allExistingSlots.length - 1];
    const latestExistingDate = moment.tz(latestExistingSlot.date, classDetails.timezone);

    // STRICT RULE: New recurring schedule must start AFTER the latest existing date
    if (startDate.isSameOrBefore(latestExistingDate, 'day')) {
      return res.status(400).json({ 
        message: `New recurring schedule must start after ${latestExistingDate.format('YYYY-MM-DD')}. Earliest allowed start date is ${latestExistingDate.clone().add(1, 'day').format('YYYY-MM-DD')}` 
      });
    }

    // NEW: Validate 6-month limit
    const sixMonthsFromNow = moment().add(6, 'months');
    if (endDate.isAfter(sixMonthsFromNow)) {
      return res.status(400).json({ 
        message: `End date cannot be more than 6 months from now. Maximum allowed end date is ${sixMonthsFromNow.format('YYYY-MM-DD')}` 
      });
    }

    // Generate all potential new slots
    const conflicts = [];
    const slotsToCreate = [];

    // Generate slots for each day in the date range
    for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'day')) {
      const dayOfWeek = date.format('dddd');
      
      if (!selectedDays.includes(dayOfWeek)) {
        continue;
      }
      
      // Generate online slots
      if (modes.online?.enabled) {
        for (const timeSlot of timeSlots.online) {
          const slotData = {
            wellnessGuideClass: classDetails._id,
            wellnessGuide: wellnessGuide._id,
            mode: 'online',
            date: date.toDate(),
            dayOfWeek,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            startTimeUTC: moment.tz(`${date.format('YYYY-MM-DD')} ${timeSlot.startTime}`, classDetails.timezone).utc().toDate(),
            endTimeUTC: moment.tz(`${date.format('YYYY-MM-DD')} ${timeSlot.endTime}`, classDetails.timezone).utc().toDate(),
            timezone: classDetails.timezone,
            maxCapacity: classDetails.modes.online.maxCapacity,
            price: classDetails.modes.online.price,
            currentBookings: 0,
            availableSlots: classDetails.modes.online.maxCapacity,
          };
          
          // Check for conflicts with existing slots (including individual slots)
          const conflict = await checkSlotConflict(slotData);
          if (conflict) {
            conflicts.push({
              date: date.toDate(),
              timeSlot: `${timeSlot.startTime} - ${timeSlot.endTime}`,
              mode: 'online',
              conflictsWith: conflict,
              conflictType: 'external_conflict'
            });
          } else {
            slotsToCreate.push(slotData);
          }
        }
      }
      
      // Generate offline slots
      if (modes.offline?.enabled) {
        for (const timeSlot of timeSlots.offline) {
          const slotData = {
            wellnessGuideClass: classDetails._id,
            wellnessGuide: wellnessGuide._id,
            mode: 'offline',
            date: date.toDate(),
            dayOfWeek,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            startTimeUTC: moment.tz(`${date.format('YYYY-MM-DD')} ${timeSlot.startTime}`, classDetails.timezone).utc().toDate(),
            endTimeUTC: moment.tz(`${date.format('YYYY-MM-DD')} ${timeSlot.endTime}`, classDetails.timezone).utc().toDate(),
            timezone: classDetails.timezone,
            maxCapacity: classDetails.modes.offline.maxCapacity,
            price: classDetails.modes.offline.price,
            currentBookings: 0,
            availableSlots: classDetails.modes.offline.maxCapacity,
          };
          
          // Check for conflicts with existing slots (including individual slots)
          const conflict = await checkSlotConflict(slotData);
          if (conflict) {
            conflicts.push({
              date: date.toDate(),
              timeSlot: `${timeSlot.startTime} - ${timeSlot.endTime}`,
              mode: 'offline',
              conflictsWith: conflict,
              conflictType: 'external_conflict'
            });
          } else {
            slotsToCreate.push(slotData);
          }
        }
      }
    }
    
    // Check for conflicts within the new recurring schedule itself (intra-schedule conflicts)
    const intraScheduleConflicts = checkIntraClassConflicts(slotsToCreate);
    if (intraScheduleConflicts.length > 0) {
      conflicts.push(...intraScheduleConflicts);
    }
    
    if (conflicts.length > 0) {
      return res.status(400).json({
        message: 'Time slot conflicts detected in the new recurring schedule',
        conflicts,
        totalConflicts: conflicts.length,
        suggestion: 'Please adjust your time slots to avoid conflicts or remove conflicting individual slots first'
      });
    }
    
    if (slotsToCreate.length === 0) {
      return res.status(400).json({
        message: 'No valid time slots to create. Please check your schedule configuration.'
      });
    }
    
    // Create all new recurring slots
    const createdSlots = await TimeSlot.insertMany(slotsToCreate);
    
    // NEW: Track statistics for both modes
    const onlineCreatedSlots = createdSlots.filter(slot => slot.mode === 'online');
    const offlineCreatedSlots = createdSlots.filter(slot => slot.mode === 'offline');
    
    res.json({
      message: `Successfully created ${createdSlots.length} recurring time slots`,
      recurringSchedule: {
        dateRange: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        },
        selectedDays,
        modesEnabled: {
          online: modes.online?.enabled || false,
          offline: modes.offline?.enabled || false
        },
        slotsCreated: {
          total: createdSlots.length,
          online: onlineCreatedSlots.length,
          offline: offlineCreatedSlots.length
        },
        nextRecurringAllowedFrom: endDate.clone().add(1, 'day').format('YYYY-MM-DD')
      },
      createdSlots: createdSlots.map(slot => ({
        id: slot._id,
        date: moment.tz(slot.date, classDetails.timezone).format('YYYY-MM-DD'),
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        mode: slot.mode,
        maxCapacity: slot.maxCapacity,
        price: slot.price
      })).sort((a, b) => {
        // Sort by date first, then by start time
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.startTime.localeCompare(b.startTime);
      })
    });
    
  } catch (error) {
    console.error('Error adding recurring time slots:', error);
    res.status(500).json({ 
      message: 'Error adding recurring time slots',
      error: error.message 
    });
  }
};

module.exports = {
  createWellnessGuideClass,
  getMyAddresses,
  processSlotGeneration,
  getMyClasses,
  getClassDetails,
  getScheduleRequestStatus, // Is not working, to check.
  updatePlatformMargin,
  updateDiscountSettings,
  getAllClassesForAdmin,
  updateClassApproval,
  getPendingClasses,
  updateWellnessGuideClass,
  addTimeSlots,        // New
  removeTimeSlot,
  getScheduleExtensionInfo,
  addRecurringTimeSlots      // New
};