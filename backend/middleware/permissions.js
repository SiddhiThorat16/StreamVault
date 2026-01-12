// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\middleware\permissions.js

const File = require('../models/File');
const Folder = require('../models/Folder');
const Share = require('../models/Share');

// Check if user can access resource (owner OR shared)
const canAccessResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id || req.body.resourceId || req.body.fileId;
    const resourceType = req.body.resourceType || 'file';
    
    // 1. Owner check (always allowed)
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
    
    if (resource) {
      req.resource = resource;
      req.accessLevel = 'owner';
      return next();
    }

    // 2. Shared access check
    const share = await Share.findOne({
      resource_type: resourceType,
      resource_id: resourceId,
      grantee_user_id: req.user._id
    });

    if (!share) {
      return res.status(403).json({ 
        error: { code: 'RESOURCE_NOT_FOUND_OR_NO_ACCESS' } 
      });
    }

    // 3. Role-based permission check
    const methodPermissions = {
      GET: ['viewer', 'editor'],
      PATCH: ['editor'],
      DELETE: ['editor']
    };

    const allowedRoles = methodPermissions[req.method] || [];
    if (!allowedRoles.includes(share.role)) {
      return res.status(403).json({ 
        error: { code: 'INSUFFICIENT_PERMISSIONS', requiredRole: allowedRoles[0] } 
      });
    }

    req.share = share;
    req.accessLevel = share.role;
    next();
  } catch (error) {
    res.status(403).json({ error: { code: 'PERMISSION_CHECK_FAILED' } });
  }
};

module.exports = { canAccessResource };
