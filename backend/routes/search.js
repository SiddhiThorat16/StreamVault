// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\search.js

const express = require('express');
const auth = require('../middleware/auth');
const { searchFiles, getRecentFiles, getSearchSuggestions } = require('./searchController');
const router = express.Router();

router.get('/files', auth, searchFiles);
router.get('/recent', auth, getRecentFiles);
router.get('/suggestions', auth, getSearchSuggestions);

module.exports = router;
