import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken, redirectToAuth } from '../../utils/authUtils';

const EntryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const token = getToken();
        if (!token) {
          redirectToAuth(navigate);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/entries/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch entry');
        }

        const data = await response.json();
        setEntry(data);
        setEditedEntry(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setError('Сохранение записи не поддерживается с методом GET.');
  };

  const handleCancel = () => {
    setEditedEntry(entry);
    setIsEditing(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!entry) {
    return <div>Entry not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <style>{`
        .prose table, .prose td, .prose th {
          border: 2px solid #444;
          border-collapse: collapse;
        }
        .prose td, .prose th {
          min-width: 40px;
          min-height: 24px;
          padding: 4px;
        }
      `}</style>
      {isEditing ? (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Edit Entry</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input
                type="text"
                value={editedEntry.title}
                onChange={(e) => setEditedEntry({ ...editedEntry, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
              <textarea
                value={editedEntry.content}
                onChange={(e) => setEditedEntry({ ...editedEntry, content: e.target.value })}
                rows={10}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-neutral-700 dark:text-gray-300 dark:border-neutral-600 dark:hover:bg-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{entry.title}</h1>
            <button
              onClick={handleEdit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Edit
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: entry.htmlContent || entry.content }} />
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Created: {new Date(entry.createdAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryPage; 