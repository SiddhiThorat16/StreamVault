// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: { code: 'USER_EXISTS', message: 'User already exists' } 
      });
    }
    const user = new User({ email, password, name });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    res.status(400).json({ 
      error: { code: 'SIGNUP_FAILED', message: error.message } 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } 
      });
    }
    const token = generateToken(user._id);
    res.json({
      user: { id: user._id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    res.status(400).json({ 
      error: { code: 'LOGIN_FAILED', message: error.message } 
    });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const getMe = (req, res) => {
  res.json({
    user: { id: req.user._id, email: req.user.email, name: req.user.name }
  });
};

module.exports = { signup, login, logout, getMe };
