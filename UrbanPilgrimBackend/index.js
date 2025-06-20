// index.js
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const pilgrimRoutes = require('./routes/pilgrimRoutes');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const specialtyRoutes = require('./routes/specialtyRoutes');
const userRoutes = require('./routes/userRoutes');
const pilgrimExperienceRoutes = require('./routes/pilgrimExperienceRoutes');
const wellnessGuideRoutes = require('./routes/wellnessGuideRoutes');
// const wellnessGuideClassRoutes = require('./routes/wellnessGuideClassRoutes'); // File doesn't exist yet
const connectDB = require('./db.js');

connectDB();

// CORS configuration
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both frontend and backend origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from UrbanPilgrim Backend!');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/specialties', specialtyRoutes);
app.use('/api/pilgrims', pilgrimRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pilgrim-experiences', pilgrimExperienceRoutes);
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/wellness-guides', wellnessGuideRoutes);
// Add this line with other route imports
app.use('/api/wellness-guide-classes', require('./routes/wellnessGuideClassRoutes'));
// app.use('/api/wellness-guide-classes', wellnessGuideClassRoutes); // File doesn't exist yet
// Add this line with other route imports
app.use('/api/auth', require('./routes/emailVerificationRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files' });
    }
  }
  
  // Handle other errors
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});