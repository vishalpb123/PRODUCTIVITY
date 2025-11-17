import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { tasksAPI } from '../services/api';

const Tasks = () => {
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Not Started',
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, [location]); // Re-fetch when location changes (navigation)

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        await tasksAPI.update(editingTask._id, formData);
      } else {
        await tasksAPI.create(formData);
      }
      
      fetchTasks();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await tasksAPI.delete(id);
      await fetchTasks();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete task. Please try again.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', status: 'Not Started' });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse-soft">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-blue-50/30 to-purple-50/30 dark:from-green-900/10 dark:via-blue-900/10 dark:to-purple-900/10 -z-10 rounded-lg"></div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold animate-slideInRight">✅ My Tasks</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">+</span>
            <span>Add Task</span>
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fadeIn">
        {['all', 'Not Started', 'In Progress', 'Completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              filter === status
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="card text-center py-12 animate-fadeIn">
          <div className="text-6xl mb-4 animate-float">📋</div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            No tasks found. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <div 
              key={task._id} 
              className="card hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-slideInBottom cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold flex-1 line-clamp-2">{task.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{task.description || 'No description'}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-all text-sm font-medium transform hover:scale-105 active:scale-95"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6 shadow-2xl animate-slideInBottom max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>{editingTask ? '✏️' : '➕'}</span>
              <span>{editingTask ? 'Edit Task' : 'Add New Task'}</span>
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">📝 Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field transition-all duration-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  placeholder="Enter task title..."
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">📄 Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field transition-all duration-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  rows="3"
                  placeholder="Enter task description..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">🎯 Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field transition-all duration-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                >
                  <option value="Not Started">⭕ Not Started</option>
                  <option value="In Progress">🔄 In Progress</option>
                  <option value="Completed">✅ Completed</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 btn-primary shadow-lg hover:shadow-xl">
                  <span className="flex items-center justify-center gap-2">
                    <span>{editingTask ? '💾' : '✨'}</span>
                    <span>{editingTask ? 'Update' : 'Create'}</span>
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

export default Tasks;
