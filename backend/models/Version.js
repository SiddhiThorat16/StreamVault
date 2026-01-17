// C:\Labmentix Projects\Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\models\Version.js

const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  file_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'File', 
    required: true 
  },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  version: { type: Number, default: 1 },
  checksum: String,
  changes: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Version', versionSchema);