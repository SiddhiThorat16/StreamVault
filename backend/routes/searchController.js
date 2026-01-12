// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\routes\searchController.js

const File = require('../models/File');
const Folder = require('../models/Folder');

// ✅ FULL-TEXT SEARCH API (Day 6)
const searchFiles = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    // Minimum 2 chars for search
    if (!q || q.length < 2) {
      return res.json({ 
        query: q || '', 
        files: [], 
        folders: [], 
        total: 0,
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // ✅ FULL-TEXT SEARCH with relevance scoring
    const files = await File.find({
      owner_id: req.user._id,
      is_deleted: false,
      $text: { $search: q }
    })
    .select('name mime_type size_bytes created_at storage_key folder_id')
    .sort({ score: { $meta: 'textScore' } })  // Best matches first
    .limit(parseInt(limit))
    .skip(skip);

    // ✅ FOLDER SEARCH (name only)
    const folders = await Folder.find({
      owner_id: req.user._id,
      is_deleted: false,
      name: { $regex: q, $options: 'i' }
    })
    .select('name created_at')
    .limit(10);

    // ✅ TOTAL COUNT for pagination
    const totalFiles = await File.countDocuments({
      owner_id: req.user._id,
      is_deleted: false,
      $text: { $search: q }
    });

    res.json({
      query: q,
      files,
      folders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFiles,
        pages: Math.ceil(totalFiles / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(400).json({ 
      error: { code: 'SEARCH_FAILED', message: error.message } 
    });
  }
};

// ✅ RECENT FILES (optimized, no text search)
const getRecentFiles = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const files = await File.find({
      owner_id: req.user._id,
      is_deleted: false
    })
    .sort({ created_at: -1 })  // Most recent first
    .select('name mime_type size_bytes created_at storage_key folder_id')
    .limit(parseInt(limit))
    .skip(skip);

    const total = await File.countDocuments({
      owner_id: req.user._id,
      is_deleted: false
    });

    res.json({
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(400).json({ 
      error: { code: 'RECENT_FETCH_FAILED', message: error.message } 
    });
  }
};

// ✅ SEARCH SUGGESTIONS (top 5 matches)
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await File.find({
      owner_id: req.user._id,
      is_deleted: false,
      $text: { $search: q }
    })
    .select('name mime_type')
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);

    res.json({
      suggestions: suggestions.map(f => ({
        name: f.name,
        mime_type: f.mime_type
      }))
    });
  } catch (error) {
    res.status(400).json({ 
      error: { code: 'SUGGESTIONS_FAILED', message: error.message } 
    });
  }
};

module.exports = { 
  searchFiles, 
  getRecentFiles, 
  getSearchSuggestions 
};
