// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\fileController.js

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const File = require('../models/File');
const User = require('../models/User');

// Cloudinary config (from .env)
cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

// Multer disk storage (temp before Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const initUpload = async (req, res) => {
  try {
    const { name, folderId } = req.body;
    
    // Auth check (req.user from middleware)
    const file = new File({
      name,
      owner_id: req.user._id,
      folder_id: folderId || null,
      mime_type: req.body.mimeType,
      size_bytes: req.body.sizeBytes
    });
    
    await file.save();
    res.status(201).json({ 
      fileId: file._id, 
      storageKey: file.storage_key,
      message: 'Upload initialized' 
    });
  } catch (error) {
    res.status(400).json({ error: { code: 'UPLOAD_INIT_FAILED', message: error.message } });
  }
};

const uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      const file = await File.findById(req.body.fileId).populate('owner_id');
      
      if (!file || file.owner_id._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: { code: 'FILE_NOT_FOUND' } });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'auto',
        folder: `streamvault/${req.user._id}`
      });

      // Update file with Cloudinary URL
      file.storage_key = result.secure_url;
      file.cloudinary_public_id = result.public_id;  // ✅ ADD THIS
      file.checksum = result.etag;
      await file.save();  // ✅ await instead of fire-and-forget

      res.json({ 
        fileId: file._id,
        url: result.secure_url,
        message: 'File uploaded successfully'
      });
    } catch (error) {
      res.status(400).json({ error: { code: 'UPLOAD_FAILED', message: error.message } });
    }
  }
];

const getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate('owner_id');
    
    if (!file || file.owner_id._id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: { code: 'FILE_NOT_FOUND' } });
    }
    
    // ✅ SIGNED URL (1hr expiry)
    let signedUrl = file.storage_key;
    if (file.cloudinary_public_id) {
      signedUrl = cloudinary.utils.private_download_url(
        file.cloudinary_public_id,
        { 
          resource_type: 'auto',
          expires_at: Math.floor(Date.now() / 1000) + 3600  // 1hr
        }
      );
    }
    
    res.json({
      id: file._id,
      name: file.name,
      size_bytes: file.size_bytes,
      mime_type: file.mime_type,
      url: signedUrl,  // ✅ Signed URL
      created_at: file.created_at
    });
  } catch (error) {
    res.status(400).json({ error: { code: 'FILE_FETCH_FAILED', message: error.message } });
  }
};


// DAY 4 ADDITIONS - File CRUD
const renameFile = async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      owner_id: req.user._id,
      is_deleted: false 
    });
    
    if (!file) {
      return res.status(404).json({ error: { code: 'FILE_NOT_FOUND' } });
    }
    
    file.name = req.body.name;
    file.updated_at = new Date();
    await file.save();
    
    res.json({ id: file._id, name: file.name });
  } catch (error) {
    res.status(400).json({ error: { code: 'FILE_RENAME_FAILED', message: error.message } });
  }
};

const moveFile = async (req, res) => {
  try {
    const { folderId } = req.body;
    const file = await File.findOne({ 
      _id: req.params.id, 
      owner_id: req.user._id 
    });
    
    if (!file) {
      return res.status(404).json({ error: { code: 'FILE_NOT_FOUND' } });
    }
    
    if (folderId) {
      const folder = await Folder.findOne({ 
        _id: folderId, 
        owner_id: req.user._id,
        is_deleted: false 
      });
      if (!folder) {
        return res.status(404).json({ error: { code: 'FOLDER_NOT_FOUND' } });
      }
    }
    
    file.folder_id = folderId || null;
    file.updated_at = new Date();
    await file.save();
    
    res.json({ id: file._id, folderId: file.folder_id });
  } catch (error) {
    res.status(400).json({ error: { code: 'FILE_MOVE_FAILED', message: error.message } });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      owner_id: req.user._id 
    });
    
    if (!file) {
      return res.status(404).json({ error: { code: 'FILE_NOT_FOUND' } });
    }
    
    file.is_deleted = true;
    await file.save();
    res.json({ message: 'File moved to trash' });
  } catch (error) {
    res.status(400).json({ error: { code: 'FILE_DELETE_FAILED', message: error.message } });
  }
};

const getTrash = async (req, res) => {
  try {
    const files = await File.find({
      owner_id: req.user._id,
      is_deleted: true
    }).sort({ created_at: -1 });
    
    res.json({
      files: files.map(f => ({ 
        id: f._id, 
        name: f.name, 
        deletedAt: f.updated_at || f.created_at 
      }))
    });
  } catch (error) {
    res.status(400).json({ error: { code: 'TRASH_FETCH_FAILED', message: error.message } });
  }
};

module.exports = { 
  initUpload, 
  uploadFile, 
  getFile, 
  renameFile, 
  moveFile, 
  deleteFile,
  getTrash
};
