import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { tasksAPI, notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, inProgress: 0, notStarted: 0 },
    notes: { total: 0 },
    loading: true,
  });

  useEffect(() => {
    fetchStats();
  }, [location]); // Re-fetch when location changes (navigation)

  const fetchStats = async () => {
    try {
      const [tasksRes, notesRes] = await Promise.all([
        tasksAPI.getAll(),
        notesAPI.getAll(),
      ]);

      const tasks = tasksRes.data;
      const notes = notesRes.data;

      const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        notStarted: tasks.filter(t => t.status === 'Not Started').length,
      };

      setStats({
        tasks: taskStats,
        notes: { total: notes.length },
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="block">
      <div className={`card hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${color} transform hover:scale-105 hover:-translate-y-1`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className="text-4xl opacity-50 animate-float">{icon}</div>
        </div>
      </div>
    </Link>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '🌅 Good Morning';
    if (hour >= 12 && hour < 17) return '☀️ Good Afternoon';
    if (hour >= 17 && hour < 21) return '🌙 Good Evening';
    return '🌃 Good Night';
  };

  const getCompletionPercentage = () => {
    if (stats.tasks.total === 0) return 0;
    return Math.round((stats.tasks.completed / stats.tasks.total) * 100);
  };

  if (stats.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse-soft">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 animate-slideInRight">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
          Here's your productivity overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 animate-fadeIn">
        <StatCard
          title="Total Tasks"
          value={stats.tasks.total}
          icon="✅"
          color="border-blue-500"
          link="/tasks"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.tasks.completed}
          icon="🎉"
          color="border-green-500"
          link="/tasks"
        />
        <StatCard
          title="In Progress"
          value={stats.tasks.inProgress}
          icon="⏳"
          color="border-yellow-500"
          link="/tasks"
        />
        <StatCard
          title="Total Notes"
          value={stats.notes.total}
          icon="📝"
          color="border-purple-500"
          link="/notes"
        />
      </div>

      {/* Progress Section */}
      {stats.tasks.total > 0 && (
        <div className="card mb-6 sm:mb-8 animate-slideInBottom">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🎯</span>
            <span>Task Completion Progress</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
              <span className="font-bold text-primary-600 dark:text-primary-400">{getCompletionPercentage()}%</span>
            </div>
            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 text-xs sm:text-sm">
              <div className="text-center p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="font-bold text-base sm:text-lg text-gray-500 dark:text-gray-400">{stats.tasks.notStarted}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">⭕ Not Started</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div className="font-bold text-base sm:text-lg text-yellow-700 dark:text-yellow-400">{stats.tasks.inProgress}</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-500">🔄 In Progress</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="font-bold text-base sm:text-lg text-green-700 dark:text-green-400">{stats.tasks.completed}</div>
                <div className="text-xs text-green-600 dark:text-green-500">✅ Completed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <span>⚡</span>
          <span>Quick Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link to="/tasks" className="card hover:shadow-xl transition-all duration-300 text-center py-6 sm:py-8 transform hover:scale-105 hover:-translate-y-2 animate-slideInBottom" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 animate-float">✅</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Manage Tasks</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Create and organize your tasks
            </p>
          </Link>

          <Link to="/notes" className="card hover:shadow-xl transition-all duration-300 text-center py-6 sm:py-8 transform hover:scale-105 hover:-translate-y-2 animate-slideInBottom" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 animate-float" style={{ animationDelay: '0.5s' }}>📝</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Take Notes</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Capture your ideas and thoughts
            </p>
          </Link>

          <Link to="/chat" className="card hover:shadow-xl transition-all duration-300 text-center py-6 sm:py-8 transform hover:scale-105 hover:-translate-y-2 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 animate-slideInBottom sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 animate-float" style={{ animationDelay: '1s' }}>🐱</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Chat with Whiskers</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Your AI assistant for productivity
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
