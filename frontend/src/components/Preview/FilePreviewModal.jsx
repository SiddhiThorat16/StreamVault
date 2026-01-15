// C:\Labmentix Projects\Cloud-Based-Media-Files-Storage-Service\StreamVault\frontend\src\components\Preview\FilePreviewModal.jsx

import { X, FileText, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const FilePreviewModal = ({ file, onClose }) => {
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    const loadText = async () => {
      if (!file || !file.previewUrl) return;
      if (!file.mime_type?.startsWith('text/')) return;
      try {
        const res = await fetch(file.previewUrl);
        const text = await res.text();
        setTextContent(text.slice(0, 5000)); // safety limit
      } catch (e) {
        console.error('Failed to load text preview', e);
      }
    };
    loadText();
  }, [file]);

  if (!file) return null;

  const isImage = file.mime_type?.startsWith('image/');
  const isPdf = file.mime_type === 'application/pdf';
  const isText = file.mime_type?.startsWith('text/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-base font-semibold text-gray-900 truncate max-w-[24rem]">
              {file.name}
            </h2>
            <p className="text-xs text-gray-500">
              {file.mime_type} · {(file.size_bytes / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          {isImage && (
            <img
              src={file.previewUrl}
              alt={file.name}
              className="max-h-[70vh] mx-auto rounded-2xl shadow-lg object-contain"
            />
          )}

          {isPdf && (
            <iframe
              src={file.previewUrl}
              title={file.name}
              className="w-full h-[70vh] rounded-2xl bg-white shadow-inner"
            />
          )}

          {isText && (
            <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white rounded-2xl shadow-inner p-4">
              {textContent || 'Loading...'}
            </pre>
          )}

          {!isImage && !isPdf && !isText && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <FileText className="h-12 w-12 mb-3 text-gray-400" />
              <p className="font-medium text-gray-700">No inline preview available</p>
              <p className="text-sm text-gray-500 mt-1">
                Click “Open” to view or download this file.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-3 border-t bg-white">
          <a
            href={file.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl"
          >
            Open in new tab
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
