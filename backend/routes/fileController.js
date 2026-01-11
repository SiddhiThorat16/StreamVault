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
      file.checksum = result.etag;
      file.save();

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
    
    res.json({
      id: file._id,
      name: file.name,
      size_bytes: file.size_bytes,
      mime_type: file.mime_type,
      url: file.storage_key,
      created_at: file.created_at
    });
  } catch (error) {
    res.status(400).json({ error: { code: 'FILE_FETCH_FAILED', message: error.message } });
  }
};

module.exports = { initUpload, uploadFile, getFile };
