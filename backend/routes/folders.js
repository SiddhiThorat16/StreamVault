// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\folders.js

const express = require('express');
const auth = require('../middleware/auth');
const { canAccessResource } = require('../middleware/permissions');
const { createFolder, getFolderContents, renameFolder, deleteFolder } = require('./folderController');
const router = express.Router();

router.post('/', auth, createFolder);
router.get('/:id', auth, canAccessResource, getFolderContents);
router.patch('/:id', auth, canAccessResource, renameFolder);
router.delete('/:id', auth, canAccessResource, deleteFolder);

module.exports = router;
