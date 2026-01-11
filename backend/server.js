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
app.use(cors({ origin: 'http://localhost:3000' })); // Frontend later
app.use(express.json());

// ADD THESE AUTH ROUTES (Day 2)
app.use('/api/auth', require('./routes/auth'));

app.use('/api/files', require('./routes/files'));


// Protected test route (Day 2)
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

// Basic route (unchanged)
app.get('/', (req, res) => {
  res.json({ message: 'StreamVault Backend API - Day 1 Ready!' });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
