// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\models\Star.js

const mongoose = require('mongoose');

const starSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  resource_type: { 
    type: String, 
    required: true, 
    enum: ['file', 'folder'] 
  },
  resource_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  }
});

// Composite primary key
starSchema.index({ 
  user_id: 1, 
  resource_type: 1, 
  resource_id: 1 
}, { unique: true });

module.exports = mongoose.model('Star', starSchema);
