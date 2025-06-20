const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Pilgrim = require('../models/Pilgrim');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.registerPilgrim = async (req, res) => {
  try {
    const { name, email, password, ...rest } = req.body;

    const existing = await Pilgrim.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const pilgrim = new Pilgrim({ name, email, password, ...rest });
    await pilgrim.save();

    const token = jwt.sign({ id: pilgrim._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Registered successfully', token, pilgrimId: pilgrim._id });
  } catch (error) {
    res.status(500).json({ message: 'Error during registration', error: error.message });
  }
};

exports.loginPilgrim = async (req, res) => {
  try {
    const { email, password } = req.body;

    const pilgrim = await Pilgrim.findOne({ email }).select('+password');
    if (!pilgrim) {
      return res.status(404).json({ message: 'Pilgrim not found' });
    }

    const isMatch = await bcrypt.compare(password, pilgrim.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: pilgrim._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful', token, pilgrimId: pilgrim._id });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};
