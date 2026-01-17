// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\shares.js

const express = require('express');
const auth = require('../middleware/auth');
const { createShare, getMyShares, deleteShare } = require('./shareController'); // ✅ Only existing functions
const router = express.Router();

router.post('/', auth, createShare);     // ✅ User-to-user share
router.get('/me', auth, getMyShares);    // ✅ List my shares  
router.delete('/:id', auth, deleteShare); // ✅ Delete share

module.exports = router;