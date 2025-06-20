// controllers/wellnessGuideClassController.js
const WellnessGuideClass = require('../models/WellnessGuideClass');
const WellnessGuide = require('../models/WellnessGuide');
const TimeSlot = require('../models/TimeSlot');
const ClassScheduleRequest = require('../models/ClassScheduleRequest');
const ROLES = require('../models/RoleEnum');
const moment = require('moment-timezone');

// @desc    Create wellness guide class
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
      about,
      certifications,
      skillsToLearn,
      aboutSections,
      specialty,
      timezone,
      modes,
      scheduleConfig,
      tags,
      difficulty
    } = req.body;
    
    // Validate at least one mode is enabled
    if (!modes.online?.enabled && !modes.offline?.enabled) {
      return res.status(400).json({ 
        message: 'At least one mode (online or offline) must be enabled' 
      });
    }
    
    // Validate enabled modes have required fields
    if (modes.online?.enabled) {
      if (!modes.online.maxCapacity || !modes.online.price) {
        return res.status(400).json({ 
          message: 'Online mode requires maxCapacity and price' 
        });
      }
    }
    
    if (modes.offline?.enabled) {
      if (!modes.offline.maxCapacity || !modes.offline.price) {
        return res.status(400).json({ 
          message: 'Offline mode requires maxCapacity and price' 
        });
      }
    }
    
    // Validate schedule configuration
    if (!scheduleConfig.selectedDays || scheduleConfig.selectedDays.length === 0) {
      return res.status(400).json({ 
        message: 'At least one day must be selected' 
      });
    }
    
    if (!scheduleConfig.dateRange.startDate || !scheduleConfig.dateRange.endDate) {
      return res.status(400).json({ 
        message: 'Date range is required' 
      });
    }
    
    // Validate time slots exist for enabled modes
    if (modes.online?.enabled && (!scheduleConfig.timeSlots.online || scheduleConfig.timeSlots.online.length === 0)) {
      return res.status(400).json({ 
        message: 'Online time slots are required when online mode is enabled' 
      });
    }
    
    if (modes.offline?.enabled && (!scheduleConfig.timeSlots.offline || scheduleConfig.timeSlots.offline.length === 0)) {
      return res.status(400).json({ 
        message: 'Offline time slots are required when offline mode is enabled' 
      });
    }
    
    // Create the class
    const wellnessGuideClass = new WellnessGuideClass({
      wellnessGuide: wellnessGuide._id,
      title,
      description,
      about,
      certifications: certifications || [],
      skillsToLearn: skillsToLearn || [],
      aboutSections: aboutSections || [],
      specialty,
      timezone: timezone || 'Asia/Kolkata',
      modes,
      scheduleConfig,
      tags: tags || [],
      difficulty: difficulty || 'Beginner',
      status: 'draft'
    });
    
    await wellnessGuideClass.save();
    
    // Create schedule request for async processing
    const scheduleRequest = new ClassScheduleRequest({
      wellnessGuideClass: wellnessGuideClass._id,
      wellnessGuide: wellnessGuide._id,
      requestData: {
        modes,
        scheduleConfig,
        timezone: timezone || 'Asia/Kolkata'
      }
    });
    
    await scheduleRequest.save();
    
    // Queue the slot generation (this would be processed by a background job)
    // For now, we'll call it directly but in production, use a queue like Bull/Agenda
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

// @desc    Process slot generation (background job)
const processSlotGeneration = async (scheduleRequestId) => {
  try {
    const scheduleRequest = await ClassScheduleRequest.findById(scheduleRequestId)
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
    
    // Generate all potential slots
    const startDate = moment.tz(scheduleConfig.dateRange.startDate, timezone);
    const endDate = moment.tz(scheduleConfig.dateRange.endDate, timezone);
    
    for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'day')) {
      const dayOfWeek = date.format('dddd');
      
      if (!scheduleConfig.selectedDays.includes(dayOfWeek)) {
        continue;
      }
      
      // Generate online slots
      if (modes.online?.enabled) {
        for (const timeSlot of scheduleConfig.timeSlots.online) {
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
            price: modes.online.price
          };
          
          // Check for conflicts with existing slots
          const conflict = await checkSlotConflict(slotData);
          if (conflict) {
            conflicts.push({
              date: date.toDate(),
              timeSlot: `${timeSlot.startTime} - ${timeSlot.endTime}`,
              mode: 'online',
              conflictsWith: conflict
            });
          } else {
            slotsToCreate.push(slotData);
          }
        }
      }
      
      // Generate offline slots
      if (modes.offline?.enabled) {
        for (const timeSlot of scheduleConfig.timeSlots.offline) {
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
            price: modes.offline.price
          };
          
          // Check for conflicts with existing slots
          const conflict = await checkSlotConflict(slotData);
          if (conflict) {
            conflicts.push({
              date: date.toDate(),
              timeSlot: `${timeSlot.startTime} - ${timeSlot.endTime}`,
              mode: 'offline',
              conflictsWith: conflict
            });
          } else {
            slotsToCreate.push(slotData);
          }
        }
      }
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
    $or: [
      {
        startTimeUTC: { $lt: slotData.endTimeUTC },
        endTimeUTC: { $gt: slotData.startTimeUTC }
      }
    ],
    isActive: true
  }).populate('wellnessGuideClass', 'title');
  
  if (existingSlot) {
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

module.exports = {
  createWellnessGuideClass,
  processSlotGeneration,
  getMyClasses,
  getClassDetails,
  getScheduleRequestStatus
};