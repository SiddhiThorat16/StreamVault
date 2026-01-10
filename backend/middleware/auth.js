// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\middleware\auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: { code: 'NO_TOKEN', message: 'No token provided' } 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: { code: 'INVALID_TOKEN', message: 'Invalid token' } 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: { code: 'TOKEN_ERROR', message: 'Token parse error' } 
    });
  }
};

module.exports = auth;
