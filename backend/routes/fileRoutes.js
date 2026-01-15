// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\fileRoutes.js

const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth'); // your auth middleware
const File = require('../models/File'); // your File model

const router = express.Router();

// ✅ FILE UPLOAD ROUTE
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/upload', auth, upload.array('files'), async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.body.folderId || null;
    
    const uploadedFiles = [];
    
    for (let file of req.files) {
      const newFile = new File({
        name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size,
        storage_key: `/uploads/${file.filename}`, // public URL path
        uploaded_by: userId,
        folder: folderId
      });
      
      await newFile.save();
      uploadedFiles.push(newFile);
    }
    
    res.json({ 
      success: true, 
      files: uploadedFiles,
      message: `${req.files.length} files uploaded successfully`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
