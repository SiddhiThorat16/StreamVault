// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\shareController.js

const crypto = require('crypto');
const Share = require('../models/Share');
const File = require('../models/File');
const Folder = require('../models/Folder');

const createShare = async (req, res) => {
  try {
    const { resourceId, role = 'viewer' } = req.body;
    const resourceType = req.body.resourceType || 'file';
    
    let resource;
    if (resourceType === 'file') {
      resource = await File.findOne({ 
        _id: resourceId, 
        owner_id: req.user._id,
        is_deleted: false 
      });
    } else {
      resource = await Folder.findOne({ 
        _id: resourceId, 
        owner_id: req.user._id,
        is_deleted: false 
      });
    }
    
    if (!resource) {
      return res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND' } });
    }

    const existingShare = await Share.findOne({
      resource_type: resourceType,
      resource_id: resourceId,
      grantee_user_id: req.body.granteeUserId
    });
    
    if (existingShare) {
      return res.status(400).json({ error: { code: 'SHARE_EXISTS' } });
    }

    // ✅ GENERATE SHARE TOKEN
    const shareToken = crypto.randomBytes(32).toString('hex');
    
    const share = new Share({
      resource_type: resourceType,
      resource_id: resourceId,
      grantee_user_id: req.body.granteeUserId,
      role,
      created_by: req.user._id,
      share_token: shareToken  // ✅ PUBLIC LINK TOKEN
    });

    await share.save();
    res.status(201).json({ 
      shareId: share._id,
      shareUrl: `http://localhost:3000/share/${shareToken}`, // ✅ SHAREABLE LINK
      role: share.role
    });
  } catch (error) {
    res.status(400).json({ error: { code: 'SHARE_CREATE_FAILED', message: error.message } });
  }
};

// getMyShares and deleteShare unchanged (already correct)
const getMyShares = async (req, res) => {
  try {
    const shares = await Share.find({
      $or: [
        { created_by: req.user._id },
        { grantee_user_id: req.user._id }
      ]
    }).populate('resource_id', 'name')
      .populate('grantee_user_id', 'name email')
      .populate('created_by', 'name');
    
    res.json(shares);
  } catch (error) {
    res.status(400).json({ error: { code: 'SHARES_FETCH_FAILED' } });
  }
};

const deleteShare = async (req, res) => {
  try {
    const share = await Share.findOne({ 
      _id: req.params.id,
      $or: [{ created_by: req.user._id }, { grantee_user_id: req.user._id }]
    });
    
    if (!share) {
      return res.status(404).json({ error: { code: 'SHARE_NOT_FOUND' } });
    }
    
    await Share.deleteOne({ _id: share._id });
    res.json({ message: 'Share revoked' });
  } catch (error) {
    res.status(400).json({ error: { code: 'SHARE_DELETE_FAILED', message: error.message } });
  }
};

module.exports = { createShare, getMyShares, deleteShare };
