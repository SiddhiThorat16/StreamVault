// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\files.js

const express = require('express');
const auth = require('../middleware/auth');
const { initUpload, uploadFile, getFile } = require('./fileController');
const router = express.Router();

router.post('/init', auth, initUpload);
router.post('/upload', auth, uploadFile);
router.get('/:id', auth, getFile);

module.exports = router;
