import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { notesAPI } from '../services/api';

const Notes = () => {
  const location = useLocation();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [location]); // Re-fetch when location changes (navigation)

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getAll();
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingNote) {
        await notesAPI.update(editingNote._id, formData);
      } else {
        await notesAPI.create(formData);
      }
      
      fetchNotes();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesAPI.delete(id);
      await fetchNotes();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete note. Please try again.');
    }
  };  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({ title: '', content: '' });
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse-soft">Loading your notes...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-orange-50/30 to-red-50/30 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-red-900/10 -z-10 rounded-lg"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold animate-slideInRight">📝 My Notes</h1>
        
        <div className="flex gap-2 w-full md:w-auto animate-fadeIn">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="🔍 Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-4 transition-all duration-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                ❌
              </button>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary whitespace-nowrap shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">+</span>
              <span>Add Note</span>
            </span>
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="card text-center py-12 animate-fadeIn">
          <div className="text-6xl mb-4 animate-float">📓</div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No notes found matching your search.' : 'No notes yet. Create one to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note, index) => (
            <div 
              key={note._id} 
              className="card hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer animate-slideInBottom"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-3">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{note.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span>📅</span>
                  <span>{formatDate(note.updatedAt)}</span>
                </p>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-4 whitespace-pre-wrap">
                {note.content}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(note)}
                  className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-all text-sm font-medium transform hover:scale-105 active:scale-95"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-all text-sm font-medium transform hover:scale-105 active:scale-95"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={handleCloseModal}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-4 sm:p-6 shadow-2xl animate-slideInBottom max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>{editingNote ? '✏️' : '🌟'}</span>
              <span>{editingNote ? 'Edit Note' : 'Add New Note'}</span>
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">🏷️ Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field transition-all duration-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  placeholder="Enter note title..."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 flex items-center justify-between">
                  <span>📝 Content</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.content.length} characters
                  </span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field transition-all duration-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  rows="10"
                  placeholder="Write your note here..."
                  required
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 btn-primary shadow-lg hover:shadow-xl">
                  <span className="flex items-center justify-center gap-2">
                    <span>{editingNote ? '💾' : '✨'}</span>
                    <span>{editingNote ? 'Update' : 'Create'}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn-secondary shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>❌</span>
                    <span>Cancel</span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
