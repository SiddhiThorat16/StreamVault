// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\shares.js

const express = require('express');
const auth = require('../middleware/auth');
const { createShare, getMyShares, deleteShare } = require('./shareController');
const router = express.Router();

router.post('/', auth, createShare);
router.get('/me', auth, getMyShares);
router.delete('/:id', auth, deleteShare);

module.exports = router;
