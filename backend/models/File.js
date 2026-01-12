// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\models\File.js

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mime_type: String,
  size_bytes: Number,
  storage_key: { type: String, unique: true, sparse: true },
  cloudinary_public_id: String,
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  folder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', index: true },
  version_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FileVersion' },
  checksum: String,
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// ✅ EXISTING INDEXES
fileSchema.index({ owner_id: 1, name: 'text' });
fileSchema.index({ folder_id: 1 });

// ✅ NEW FULL-TEXT SEARCH INDEX (Day 6)
fileSchema.index({ 
  name: 'text',
  mime_type: 'text' 
}, { name: 'file_search' });

module.exports = mongoose.model('File', fileSchema);
