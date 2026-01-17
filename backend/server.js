// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\server.js

require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const auth = require('./middleware/auth'); 

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173'], 
  credentials: true 
}));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/folders', require('./routes/folders'));
app.use('/api/shares', require('./routes/shares'));
app.use('/api/search', auth, require('./routes/search'));

// ✅ FIXED: Single trash proxy route
app.use('/api/trash', auth, (req, res, next) => {
  req.url = '/files' + req.url;  // Proxy to files routes
  require('./routes/files')(req, res, next);
});  // ✅ CLOSING BRACE ADDED

app.use('/uploads', express.static('uploads'));

app.get('/api/protected', auth, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'StreamVault Backend API - Day 13 Ready! 🚀' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
