// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\folderController.js

const Folder = require('../models/Folder');
const File = require('../models/File');

// Create folder
const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    // Check parent exists & user owns it (or root)
    if (parentId) {
      const parent = await Folder.findOne({ _id: parentId, owner_id: req.user._id, is_deleted: false });
      if (!parent) {
        return res.status(404).json({ error: { code: 'PARENT_NOT_FOUND' } });
      }
    }

    const folder = new Folder({
      name,
      owner_id: req.user._id,
      parent_id: parentId || null
    });
    
    await folder.save();
    res.status(201).json({ 
      id: folder._id, 
      name: folder.name,
      path: [folder._id]
    });
  } catch (error) {
    res.status(400).json({ error: { code: 'FOLDER_CREATE_FAILED', message: error.message } });
  }
};

// List folder contents (files + subfolders)
const getFolderContents = async (req, res) => {
  try {
    const folderId = req.params.id || null; // Root = null
    
    // Folders first
    const folders = await Folder.find({
      owner_id: req.user._id,
      parent_id: folderId,
      is_deleted: false
    }).sort({ name: 1 });

    // Files
    const files = await File.find({
      owner_id: req.user._id,
      folder_id: folderId,
      is_deleted: false
    }).sort({ name: 1 });

    res.json({
      folders: folders.map(f => ({ id: f._id, name: f.name })),
      files: files.map(f => ({
        id: f._id,
        name: f.name,
        size_bytes: f.size_bytes,
        mime_type: f.mime_type,
        url: f.storage_key
      }))
    });
  } catch (error) {
    res.status(400).json({ error: { code: 'FOLDER_LIST_FAILED', message: error.message } });
  }
};

// Rename folder
const renameFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ 
      _id: req.params.id, 
      owner_id: req.user._id,
      is_deleted: false 
    });
    
    if (!folder) {
      return res.status(404).json({ error: { code: 'FOLDER_NOT_FOUND' } });
    }
    
    folder.name = req.body.name;
    folder.updated_at = new Date();
    await folder.save();
    
    res.json({ id: folder._id, name: folder.name });
  } catch (error) {
    res.status(400).json({ error: { code: 'FOLDER_RENAME_FAILED', message: error.message } });
  }
};

// Soft delete folder
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ 
      _id: req.params.id, 
      owner_id: req.user._id 
    });
    
    if (!folder) {
      return res.status(404).json({ error: { code: 'FOLDER_NOT_FOUND' } });
    }
    
    folder.is_deleted = true;
    await folder.save();
    res.json({ message: 'Folder moved to trash' });
  } catch (error) {
    res.status(400).json({ error: { code: 'FOLDER_DELETE_FAILED', message: error.message } });
  }
};

module.exports = { createFolder, getFolderContents, renameFolder, deleteFolder };
