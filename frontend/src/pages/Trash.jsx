// C:\Labmentix Projects\Cloud-Based-Media-Files-Storage-Service\StreamVault\frontend\src\pages\Trash.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, Undo, File, Folder, Loader2, Clock, RotateCcw 
} from 'lucide-react'; // ✅ Undo & RotateCcw instead of Restore

const TrashPage = () => {
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState({});

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/files/trash', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrashItems(res.data.files);
    } catch (error) {
      console.error('Failed to fetch trash:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (id) => {
    setRestoring(id);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/files/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTrash(); // Refresh
    } catch (error) {
      alert('Failed to restore');
    } finally {
      setRestoring(false);
    }
  };

  const permanentDelete = async (id) => {
    if (!confirm('Permanently delete this item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/files/${id}/permanent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTrash();
    } catch (error) {
      alert('Failed to delete permanently');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center space-x-4 mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Trash2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Trash</h1>
            <p className="text-xl text-gray-600">Deleted items stay here for 30 days before permanent deletion</p>
          </div>
        </div>

        {trashItems.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Trash2 className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Trash is empty</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">Deleted files and folders will appear here.</p>
            <a href="/" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all inline-flex items-center">
              <Folder className="h-5 w-5 mr-2" />
              Go to Files
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {trashItems.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50 hover:shadow-3xl transition-all group">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <File className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Deleted {new Date(item.deletedAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => restoreItem(item.id)}
                    disabled={restoring === item.id}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {restoring === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Undo className="h-4 w-4" />
                    )}
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => permanentDelete(item.id)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Forever</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashPage;
