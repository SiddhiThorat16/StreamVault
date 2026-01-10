// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\models\File.js

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mime_type: String,
  size_bytes: Number,
  storage_key: { type: String, unique: true, sparse: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  folder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', index: true },
  version_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FileVersion' },
  checksum: String,
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

fileSchema.index({ owner_id: 1, name: 'text' });
fileSchema.index({ folder_id: 1 });

module.exports = mongoose.model('File', fileSchema);
