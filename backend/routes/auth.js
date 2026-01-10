// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\auth.js

const express = require('express');
const { signup, login, logout, getMe } = require('./authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', signup);
router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);

module.exports = router;
