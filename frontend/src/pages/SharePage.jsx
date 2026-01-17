// C:\Labmentix Projects\Cloud-Based-Media-Files-Storage-Service\StreamVault\frontend\src\pages\SharePage.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SharePage = () => {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShare();
  }, [token]);

  const fetchShare = async () => {
    try {
      const response = await axios.get(`/api/shares/link/${token}`);
      setFile(response.data.file);
    } catch (err) {
      setError('Link not found or expired');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !file) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{file.name}</h1>
        <p className="text-gray-600 mb-8">{(file.size_bytes / 1024 / 1024).toFixed(1)} MB</p>
        
        <a
          href={file.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Download className="h-5 w-5 mr-2" />
          Download File
        </a>
      </div>
    </div>
  );
};
