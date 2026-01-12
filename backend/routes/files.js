// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\files.js

const express = require('express');
const auth = require('../middleware/auth');
const { canAccessResource } = require('../middleware/permissions');
const { initUpload, uploadFile, getFile, renameFile, moveFile, deleteFile, getTrash } = require('./fileController');
const router = express.Router();

router.post('/init', auth, initUpload);
router.post('/upload', auth, uploadFile);
router.get('/trash', auth, getTrash);

// Protected routes with permissions middleware
router.get('/:id', auth, canAccessResource, getFile);
router.patch('/:id/rename', auth, canAccessResource, renameFile);
router.patch('/:id/move', auth, canAccessResource, moveFile);
router.delete('/:id', auth, canAccessResource, deleteFile);

module.exports = router;
