// C:\Labmentix Projects\Cloud-Based-Media-Files-Storage-Service\StreamVault\frontend\src\pages\FileExplorer.jsx

// frontend/src/pages/FileExplorer.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, ChevronRight, Folder, File, Image, FileText, Video, Upload, Search, 
  Trash2, MoreHorizontal, LogOut, Home, Loader2, Share2, Download 
} from 'lucide-react';
import UploadDropzone from '../components/Upload/UploadDropzone';
import ShareModal from '../components/Share/ShareModal'; // ✅ NEW IMPORT

const FileExplorer = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false); // ✅ NEW STATE
  const [selectedFile, setSelectedFile] = useState(null); // ✅ NEW STATE

  const [currentPath, setCurrentPath] = useState([]);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentFolder();
  }, [currentPath]);

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

  // ✅ NEW: Open Share Modal
  const openShareModal = (file) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  // ... (keep all existing functions: navigateToFolder, goBack, handleLogout, getFileIcon, Breadcrumbs)

  const navigateToFolder = (folder) => {
    setCurrentPath([...currentPath, folder]);
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

  const currentFolderId = currentPath[currentPath.length - 1]?._id || '';

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <File className="h-7 w-7 text-white drop-shadow-md" />;
    if (mimeType.startsWith('image/')) return <Image className="h-7 w-7 text-white drop-shadow-md" />;
    if (mimeType.includes('pdf')) return <FileText className="h-7 w-7 text-white drop-shadow-md" />;
    if (mimeType.includes('video/')) return <Video className="h-7 w-7 text-white drop-shadow-md" />;
    if (mimeType.includes('audio/')) return <File className="h-7 w-7 text-white drop-shadow-md" />;
    return <File className="h-7 w-7 text-white drop-shadow-md" />;
  };

  const Breadcrumbs = () => (
    <div className="flex items-center bg-white/90 backdrop-blur-sm border-b px-6 py-4 shadow-sm">
      <button 
        onClick={() => setCurrentPath([])} 
        className="p-2 hover:bg-gray-100 rounded-xl transition-all group"
        title="Home"
      >
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

  // 🚀 ENHANCED FILEITEM WITH SHARE BUTTON
  const FileItem = ({ item, onClick }) => {
    const [showActions, setShowActions] = useState(false);

    const handleActionClick = (e, action) => {
      e.stopPropagation();
      if (action === 'share') {
        openShareModal(item);
      }
      // Add more actions: download, delete, rename
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

        {/* ✅ NEW: Action Buttons Overlay */}
        <div className={`absolute top-4 right-4 flex gap-2 bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-gray-200/50 transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible ${showActions ? 'opacity-100 visible' : ''}`}>
          {!item.is_folder && (
            <>
              <button
                onClick={(e) => handleActionClick(e, 'share')}
                className="p-2 hover:bg-indigo-100 rounded-xl transition-all hover:scale-110 group/action"
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

  const filteredItems = folders.concat(files).filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header (unchanged) */}
      <header className="bg-white/95 backdrop-blur-2xl shadow-xl border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              <button 
                onClick={goBack}
                disabled={currentPath.length === 0}
                className="p-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                title="Back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100/50 px-5 py-3 rounded-3xl shadow-inner border border-gray-200/50 backdrop-blur-sm min-w-[400px]">
                <Search className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search files and folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none focus:ring-2 focus:ring-indigo-500/50 text-base font-medium outline-none flex-1 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowUpload(true)}
                className="group flex items-center space-x-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white px-8 py-4 rounded-3xl font-semibold shadow-xl hover:shadow-2xl hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-lg"
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

      {/* Main Content (FileItem updated above) */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
              <p className="text-lg font-medium text-gray-600">Loading your files...</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          // Empty state (unchanged)
          <div className="text-center py-32">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Folder className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Your folder is empty</h3>
            <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
              Start organizing your files by uploading documents, photos, or creating new folders.
            </p>
            <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-5 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                📁 Upload Files
              </button>
              <button className="border-2 border-dashed border-gray-300 text-gray-700 px-10 py-5 rounded-3xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-lg">
                ➕ New Folder
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filteredItems.map((item) => (
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

      {/* ✅ SHARE MODAL INTEGRATION */}
      {showShareModal && selectedFile && (
        <ShareModal 
          file={selectedFile}
          onClose={() => {
            setShowShareModal(false);
            setSelectedFile(null);
            fetchCurrentFolder(); // Refresh files after sharing
          }}
        />
      )}

      {/* Upload modal (unchanged) */}
      {showUpload && (
        <UploadDropzone
          folderId={currentFolderId}
          onClose={() => setShowUpload(false)}
          onUploaded={fetchCurrentFolder}
        />
      )}
    </div>
  );
};

export default FileExplorer;
