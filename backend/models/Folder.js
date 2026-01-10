// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\models\Folder.js

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Unique name per parent/owner (non-deleted)
folderSchema.index({ owner_id: 1, parent_id: 1, name: 1 }, { unique: true, partialFilterExpression: { is_deleted: false } });

module.exports = mongoose.model('Folder', folderSchema);
