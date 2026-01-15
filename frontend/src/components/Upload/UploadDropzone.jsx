// C:\Labmentix Projects\Cloud-Based-Media-Files-Storage-Service\StreamVault\frontend\src\components\Upload\UploadDropzone.jsx

import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';

const UploadDropzone = ({ folderId, onClose, onUploaded }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList);
    setFiles(arr);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      if (folderId) formData.append('folderId', folderId);

      await axios.post('http://localhost:8080/api/files/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });

      setStatus('success');
      setTimeout(() => {
        onUploaded?.();
        onClose?.();
      }, 800);
    } catch (err) {
      console.error('Upload failed:', err.response?.data || err.message); // BETTER LOG
      setStatus('error');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upload files</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
        >
          <input
            type="file"
            multiple
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud className="h-10 w-10 text-indigo-500 mx-auto mb-3" />
          <p className="font-semibold text-gray-800">Drag & drop files here</p>
          <p className="text-sm text-gray-500 mt-1">
            or click to browse from your computer
          </p>
        </div>

        {files.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-3 max-h-40 overflow-y-auto text-left">
            {files.map((file) => (
              <div
                key={file.name + file.size}
                className="flex justify-between text-sm text-gray-700 py-1"
              >
                <span className="truncate max-w-[70%]">{file.name}</span>
                <span className="text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Upload complete!
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            Upload failed. Please try again.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!files.length || uploading}
            className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadDropzone;
