// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\models\Share.js

const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  resource_type: { 
    type: String, 
    required: true, 
    enum: ['file', 'folder'] 
  },
  resource_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  grantee_user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['viewer', 'editor'] 
  },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  share_token: { 
    type: String, 
    unique: true, 
    sparse: true 
  }, // ✅ ADDED: Public share links
  created_at: { type: Date, default: Date.now }
});

shareSchema.index({ 
  resource_type: 1, 
  resource_id: 1, 
  grantee_user_id: 1 
}, { unique: true });

module.exports = mongoose.model('Share', shareSchema);
