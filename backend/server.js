// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\server.js

require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' })); // Frontend later
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'StreamVault Backend API - Day 1 Ready!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
