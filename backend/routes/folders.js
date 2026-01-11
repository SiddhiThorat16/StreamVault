// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\folders.js

const express = require('express');
const auth = require('../middleware/auth');
const { createFolder, getFolderContents, renameFolder, deleteFolder } = require('./folderController');
const router = express.Router();

router.post('/', auth, createFolder);
router.get('/:id', auth, getFolderContents);
router.patch('/:id', auth, renameFolder);
router.delete('/:id', auth, deleteFolder);

module.exports = router;
