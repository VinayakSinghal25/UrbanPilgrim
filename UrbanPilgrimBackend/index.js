// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/urbanpilgrim';
mongoose.connect(mongoUri)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/wellness-guides', require('./routes/wellnessGuideRoutes'));
app.use('/api/wellness-guide-classes', require('./routes/wellnessGuideClassRoutes'));
app.use('/api/pilgrim-experiences', require('./routes/pilgrimRoutes'));
app.use('/api/specialties', require('./routes/specialtyRoutes'));
app.use('/api/email-verification', require('./routes/emailVerificationRoutes'));

// 🆕 NEW: Booking routes
app.use('/api/bookings', require('./routes/pilgrimBookingRoutes'));

// 🆕 NEW: Admin routes
app.use('/api/admin/bookings', require('./routes/adminPilgrimBookingRoutes'));
app.use('/api/admin/pilgrim-experiences', require('./routes/pilgrimExperienceDiscountRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler (fixed - no asterisk pattern)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;