// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\models\LinkShare.js

const mongoose = require('mongoose');

const linkShareSchema = new mongoose.Schema({
  resource_type: { 
    type: String, 
    required: true, 
    enum: ['file', 'folder'] 
  },
  resource_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  role: { 
    type: String, 
    default: 'viewer',
    enum: ['viewer'] 
  },
  password_hash: String,
  expires_at: Date,
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LinkShare', linkShareSchema);
