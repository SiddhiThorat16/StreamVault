// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\models\Activity.js

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  actor_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true 
  },
  action: { 
    type: String, 
    required: true, 
    enum: ['upload', 'rename', 'delete', 'restore', 'move', 'share', 'download'] 
  },
  resource_type: { 
    type: String, 
    required: true, 
    enum: ['file', 'folder'] 
  },
  resource_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  context: { 
    type: mongoose.Schema.Types.Mixed 
  },
  created_at: { 
    type: Date, 
    default: Date.now,
    index: true 
  }
});

// Index for recent activity queries
activitySchema.index({ created_at: -1 });
activitySchema.index({ actor_id: 1, created_at: -1 });

module.exports = mongoose.model('Activity', activitySchema);
