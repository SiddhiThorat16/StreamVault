// C:\Labmentix Projects\Cloud-Based-Media-Files-Storage-Service\StreamVault\frontend\src\pages\FileExplorer.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, ChevronRight, Folder, File, Image, FileText, Video, Upload, Search, 
  Trash2, MoreHorizontal, LogOut, Home, Loader2, Share2, Download, ArrowUpDown, X 
} from 'lucide-react';
import UploadDropzone from '../components/Upload/UploadDropzone';
import ShareModal from '../components/Share/ShareModal';

const FileExplorer = () => {
  // Existing states
  const [showUpload, setShowUpload] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // 🚀 NEW Day 12 States
  const [currentPath, setCurrentPath] = useState([]);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ files: [], folders: [], total: 0 });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchLoading, setSearchLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ DEBOUNCE UTILITY
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ✅ DEBOUNCED SEARCH (300ms)
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchMode(false);
        setSearchResults({ files: [], folders: [], total: 0 });
        return;
      }

      setSearchLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/search/files', {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: query, page: 1, limit: 50 }
        });
        setSearchResults(res.data);
        setSearchMode(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  // ✅ SEARCH HANDLER
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  // ✅ SORTING FUNCTION
  const sortItems = useCallback((items) => {
    return items.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase();
          bVal = b.name?.toLowerCase();
          break;
        case 'size':
          aVal = a.size_bytes || 0;
          bVal = b.size_bytes || 0;
          break;
        case 'date':
          aVal = new Date(a.created_at || a.createdAt);
          bVal = new Date(b.created_at || b.createdAt);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortOrder]);

  // ✅ FOLDER VIEW (existing)
  useEffect(() => {
    if (!searchMode) {
      fetchCurrentFolder();
    }
  }, [currentPath, searchMode]);

  const fetchCurrentFolder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const folderId = currentPath[currentPath.length - 1]?._id || '';
      
      const res = await axios.get('http://localhost:8080/api/files', {
        headers: { Authorization: `Bearer ${token}` },
        params: { folderId }
      });
      
      setFiles(res.data.files?.filter(f => !f.is_folder) || []);
      setFolders(res.data.files?.filter(f => f.is_folder) || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SORT TOGGLER
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // ✅ MEMOIZED ITEMS (Performance)
  const sortedFolders = useMemo(() => sortItems(folders), [folders, sortBy, sortOrder, sortItems]);
  const sortedFiles = useMemo(() => sortItems(files), [files, sortBy, sortOrder, sortItems]);
  const displayItems = useMemo(() => 
    searchMode ? 
      [...searchResults.folders, ...searchResults.files] : 
      [...sortedFolders, ...sortedFiles]
  , [searchMode, searchResults, sortedFolders, sortedFiles]);

  const openShareModal = (file) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const navigateToFolder = (folder) => {
    setCurrentPath([...currentPath, folder]);
    setSearchMode(false);
    setSearchTerm('');
  };

  const goBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <File className="h-7 w-7 text-white drop-shadow-md" />;
    if (mimeType.startsWith('image/')) return <Image className="h-7 w-7 text-white drop-shadow-md" />;
    if (mimeType.includes('pdf')) return <FileText className="h-7 w-7 text-white drop-shadow-md" />;
    if (mimeType.includes('video/')) return <Video className="h-7 w-7 text-white drop-shadow-md" />;
    return <File className="h-7 w-7 text-white drop-shadow-md" />;
  };

  const Breadcrumbs = () => (
    <div className="flex items-center bg-white/90 backdrop-blur-sm border-b px-6 py-4 shadow-sm">
      <button onClick={() => setCurrentPath([])} className="p-2 hover:bg-gray-100 rounded-xl transition-all group">
        <Home className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
      </button>
      {currentPath.map((folder, index) => (
        <div key={folder._id} className="flex items-center space-x-2 ml-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span 
            className="text-sm font-semibold text-gray-800 hover:text-indigo-600 cursor-pointer transition-colors truncate max-w-[180px] py-1 px-2 rounded hover:bg-indigo-50"
            onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
            title={folder.name}
          >
            {folder.name}
          </span>
        </div>
      ))}
    </div>
  );

  const FileItem = ({ item, onClick }) => {
    const [showActions, setShowActions] = useState(false);

    const handleActionClick = (e, action) => {
      e.stopPropagation();
      if (action === 'share') {
        openShareModal(item);
      }
    };

    return (
      <div 
        className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50/80 hover:to-purple-50/80 transition-all duration-500 border border-gray-100/50 shadow-lg h-40 flex flex-col justify-between cursor-pointer overflow-hidden relative"
        onClick={onClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-start space-x-4 h-full">
          <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 hover:shadow-2xl">
            {item.is_folder ? (
              <Folder className="h-8 w-8 text-white drop-shadow-lg" />
            ) : (
              getFileIcon(item.mime_type)
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1 flex-grow">
            <div className="space-y-1">
              <h3 className="font-bold text-xl leading-tight text-gray-900/95 truncate group-hover:text-indigo-700 transition-all line-clamp-2">
                {item.name}
              </h3>
              <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                {item.is_folder 
                  ? `${item.children_count || 0} items • Folder` 
                  : `${item.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}`
                }
              </p>
            </div>
            {!item.is_folder && (
              <div className="flex items-center justify-between mt-auto pt-2">
                <p className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-full font-mono font-semibold text-gray-700 shadow-sm group-hover:shadow-md transition-all whitespace-nowrap">
                  {(item.size_bytes / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`absolute top-4 right-4 flex gap-2 bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-gray-200/50 transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible ${showActions ? 'opacity-100 visible' : ''}`}>
          {!item.is_folder && (
            <>
              <button
                onClick={(e) => handleActionClick(e, 'share')}
                className="p-2 hover:bg-indigo-100 rounded-xl transition-all hover:scale-110"
                title="Share"
              >
                <Share2 className="h-4 w-4 text-indigo-600" />
              </button>
              <button
                onClick={(e) => window.open(item.storage_key || '#', '_blank')}
                className="p-2 hover:bg-green-100 rounded-xl transition-all hover:scale-110"
                title="Download"
              >
                <Download className="h-4 w-4 text-green-600" />
              </button>
            </>
          )}
          <button
            onClick={(e) => handleActionClick(e, 'more')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
            title="More"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 🚀 ENHANCED HEADER WITH SORTING & NAVIGATION */}
      <header className="bg-white/95 backdrop-blur-2xl shadow-xl border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              <button 
                onClick={goBack}
                disabled={currentPath.length === 0}
                className="p-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* 🚀 UPGRADED SEARCH BAR */}
              <div className={`flex items-center bg-gradient-to-r from-gray-50 to-gray-100/50 px-5 py-3 rounded-3xl shadow-inner border border-gray-200/50 backdrop-blur-sm transition-all ${searchMode ? 'min-w-[500px] ring-2 ring-indigo-200/50 shadow-lg' : 'min-w-[400px]'}`}>
                <Search className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${searchMode ? 'text-indigo-600' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder={searchMode ? `Searching "${searchTerm}"... (${searchResults.total} results)` : "Search files and folders..."}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="bg-transparent border-none focus:ring-2 focus:ring-indigo-500/50 text-base font-medium outline-none flex-1 placeholder-gray-500"
                />
                {searchMode && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchMode(false);
                    }}
                    className="ml-2 p-1 hover:bg-red-100 rounded-lg transition-all"
                    title="Clear search"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>

              {/* 🚀 NEW: NAVIGATION TABS (Files | Trash) */}
              <div className="flex items-center space-x-2 ml-6">
                {/* Files (Active) */}
                <button className="flex items-center space-x-2 px-4 py-3 bg-indigo-500/10 text-indigo-700 rounded-2xl font-semibold shadow-md border border-indigo-200/50 backdrop-blur-sm transition-all hover:bg-indigo-500/20">
                  <Home className="h-5 w-5" />
                  <span className="hidden sm:inline">Files</span>
                </button>
                
                {/* Trash */}
                <button 
                  onClick={() => navigate('/trash')}
                  className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-red-50/50 hover:text-red-600 rounded-2xl transition-all hover:shadow-md group relative"
                  title="Trash"
                >
                  <Trash2 className="h-5 w-5 group-hover:-rotate-12 transition-transform" />
                  <span className="hidden sm:inline">Trash</span>
                </button>
              </div>
            </div>

            {/* 🚀 NEW: SORTING CONTROLS */}
            {!searchMode && (
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => toggleSort('name')}
                  className={`p-2 rounded-xl transition-all flex items-center space-x-1 ${
                    sortBy === 'name' 
                      ? 'bg-indigo-100 text-indigo-700 shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  <span className="text-xs font-medium">Name</span>
                  <ArrowUpDown className={`h-3 w-3 ${sortBy === 'name' ? 'text-indigo-600' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={() => toggleSort('size')}
                  className={`p-2 rounded-xl transition-all flex items-center space-x-1 ${
                    sortBy === 'size' 
                      ? 'bg-indigo-100 text-indigo-700 shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  <span className="text-xs font-medium">Size</span>
                  <ArrowUpDown className={`h-3 w-3 ${sortBy === 'size' ? 'text-indigo-600' : 'text-gray-500'}`} />
                </button>
                <button
                  onClick={() => toggleSort('date')}
                  className={`p-2 rounded-xl transition-all flex items-center space-x-1 ${
                    sortBy === 'date' 
                      ? 'bg-indigo-100 text-indigo-700 shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  <span className="text-xs font-medium">Date</span>
                  <ArrowUpDown className={`h-3 w-3 ${sortBy === 'date' ? 'text-indigo-600' : 'text-gray-500'}`} />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowUpload(true)}
                className="group flex items-center space-x-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white px-8 py-4 rounded-3xl font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-lg"
              >
                <Upload className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span>Upload</span>
              </button>
              <button 
                onClick={handleLogout}
                className="p-3 text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-2xl hover:text-red-600 shadow-sm hover:shadow-md transition-all hover:scale-110"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        <Breadcrumbs />
      </header>

      {/* 🚀 SEARCH STATE INDICATOR */}
      {searchMode && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Search className="h-5 w-5" />
              <span>Found {searchResults.total} results for "{searchTerm}"</span>
              {searchLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchMode(false);
              }}
              className="flex items-center space-x-1 px-4 py-1 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all"
            >
              <X className="h-4 w-4" />
              <span className="text-sm font-medium">Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
              <p className="text-lg font-medium text-gray-600">{searchMode ? 'Searching...' : 'Loading your files...'}</p>
            </div>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Folder className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {searchMode ? `No results for "${searchTerm}"` : 'Your folder is empty'}
            </h3>
            <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
              {searchMode 
                ? 'Try different keywords or check spelling.' 
                : 'Start organizing your files by uploading documents, photos, or creating new folders.'
              }
            </p>
            {!searchMode && (
              <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => setShowUpload(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-5 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
                >
                  📁 Upload Files
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {displayItems.map((item) => (
              <FileItem 
                key={item._id} 
                item={item} 
                onClick={() => 
                  item.is_folder 
                    ? navigateToFolder(item) 
                    : window.open(item.storage_key || '#', '_blank')
                }
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showShareModal && selectedFile && (
        <ShareModal 
          file={selectedFile}
          onClose={() => {
            setShowShareModal(false);
            setSelectedFile(null);
            fetchCurrentFolder();
          }}
        />
      )}
      {showUpload && (
        <UploadDropzone
          folderId={currentPath[currentPath.length - 1]?._id || ''}
          onClose={() => setShowUpload(false)}
          onUploaded={fetchCurrentFolder}
        />
      )}
    </div>
  );
};

export default FileExplorer;
