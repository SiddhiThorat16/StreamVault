// C:\Labmentix Projects\Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\linkSharesController.js

const LinkShare = require('../models/LinkShare');
const File = require('../models/File');

const createLinkShare = async (req, res) => {
  try {
    const { resourceId, role = 'viewer', expiresAt, password } = req.body;
    const resourceType = 'file';
    
    const file = await File.findOne({ 
      _id: resourceId, 
      owner_id: req.user._id,
      is_deleted: false 
    });
    
    if (!file) {
      return res.status(404).json({ error: { code: 'FILE_NOT_FOUND' } });
    }

    const token = require('crypto').randomBytes(32).toString('hex');
    const passwordHash = password ? require('bcrypt').hashSync(password, 10) : null;
    
    const linkShare = new LinkShare({
      resource_type: resourceType,
      resource_id: resourceId,
      token,
      role,
      password_hash: passwordHash,
      expires_at: expiresAt ? new Date(expiresAt) : null,
      created_by: req.user._id
    });

    await linkShare.save();
    
    const shareUrl = `${req.protocol}://${req.get('host')}/share/${token}`;
    
    res.status(201).json({ 
      token,
      shareUrl,
      role: linkShare.role,
      expiresAt: linkShare.expires_at
    });
  } catch (error) {
    res.status(400).json({ error: { code: 'LINK_SHARE_CREATE_FAILED', message: error.message } });
  }
};

// Get public link info (no auth required)
const getLinkShare = async (req, res) => {
  try {
    const { token } = req.params;
    const linkShare = await LinkShare.findOne({ 
      token, 
      expires_at: { $gt: new Date() } 
    }).populate('resource_id', 'name file_url thumbnail_url size_bytes owner_id');
    
    if (!linkShare) {
      return res.status(404).json({ error: { code: 'LINK_NOT_FOUND_OR_EXPIRED' } });
    }
    
    res.json({
      share: linkShare,
      file: linkShare.resource_id
    });
  } catch (error) {
    res.status(400).json({ error: { code: 'LINK_FETCH_FAILED' } });
  }
};

module.exports = { createLinkShare, getLinkShare };
