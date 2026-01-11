// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\files.js

const express = require('express');
const auth = require('../middleware/auth');
const { initUpload, uploadFile, getFile, renameFile, moveFile, deleteFile, getTrash } = require('./fileController');
const router = express.Router();

router.post('/init', auth, initUpload);
router.post('/upload', auth, uploadFile);
router.get('/trash', auth, getTrash);
router.patch('/:id/rename', auth, renameFile);
router.patch('/:id/move', auth, moveFile);
router.delete('/:id', auth, deleteFile);
router.get('/:id', auth, getFile); 

module.exports = router;
