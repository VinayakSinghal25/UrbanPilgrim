const mongoose = require('mongoose');

// MongoDB connection URL
const mongoURI = 'mongodb+srv://vinayaksinghal839:fkwtiLpWQlMuaaAw@cluster0.cbgfuts.mongodb.net/urban_pilgrim?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;