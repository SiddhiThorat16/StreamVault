// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\models\FileVersion.js

const mongoose = require('mongoose');

const fileVersionSchema = new mongoose.Schema({
  file_id: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true, index: true },
  version_number: { type: Number, required: true },
  storage_key: { type: String, required: true },
  size_bytes: Number,
  checksum: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FileVersion', fileVersionSchema);
