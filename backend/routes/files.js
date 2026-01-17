// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\files.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const File = require('../models/File');

// ✅ TRASH FUNCTIONS - DEFINED BEFORE ROUTES
const getTrash = async (req, res) => {
  try {
    const files = await File.find({
      owner_id: req.user._id,
      is_deleted: true
    }).sort({ updated_at: -1 }).select('name size_bytes mime_type updated_at deleted_at _id is_folder');
    
    res.json({ 
      files: files.map(f => ({ 
        id: f._id, 
        name: f.name, 
        size_bytes: f.size_bytes || 0,
        mime_type: f.mime_type,
        deletedAt: f.deleted_at || f.updated_at,
        is_folder: f.is_folder || false
      }))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const restoreFile = async (req, res) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, owner_id: req.user._id, is_deleted: true },
      { is_deleted: false, deleted_at: null },
      { new: true }
    );
    
    if (!file) return res.status(404).json({ error: 'File not found in trash' });
    res.json({ message: 'File restored successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const permanentDeleteFile = async (req, res) => {
  try {
    await File.deleteOne({ _id: req.params.id, owner_id: req.user._id });
    res.json({ message: 'File permanently deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ YOUR EXISTING ROUTES (replace with yours or keep these basics)
router.get('/', auth, async (req, res) => {
  try {
    const { folderId } = req.query;
    const query = folderId 
      ? { parent_folder: folderId, owner_id: req.user._id, is_deleted: false }
      : { parent_folder: null, owner_id: req.user._id, is_deleted: false };
    
    const files = await File.find(query).sort({ created_at: -1 });
    res.json({ files });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', auth, async (req, res) => {
  // Your existing upload logic
  res.json({ message: 'Upload endpoint' });
});

// ✅ NEW TRASH ROUTES
router.get('/trash', auth, getTrash);
router.patch('/:id/restore', auth, restoreFile);
router.delete('/:id/permanent', auth, permanentDeleteFile);

module.exports = router;
