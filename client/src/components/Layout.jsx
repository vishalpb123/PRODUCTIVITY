import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '/tasks', label: '✅ Tasks', icon: '✅' },
    { path: '/notes', label: '📝 Notes', icon: '📝' },
    { path: '/chat', label: '🐱 Chat', icon: '🐱' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-gray-800/80 shadow-lg border-b border-gray-200 dark:border-gray-700 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link to="/dashboard" className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                🐱 <span className="hidden sm:inline">Productivity</span>
              </Link>
              
              <div className="hidden lg:flex space-x-2 xl:space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-all transform hover:scale-105 ${
                      location.pathname === item.path
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all transform hover:scale-110 active:scale-95"
                title="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* User Menu - Desktop */}
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">
                  Hi, {user?.name}!
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-xs lg:text-sm px-3 py-2"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="md:hidden p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                title="Logout"
              >
                🚪
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 animate-slideInBottom">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="md:hidden pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 px-4 py-2">
                  Logged in as <span className="font-semibold">{user?.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Tab Bar - Mobile Only */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="flex justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center px-3 py-2 transition-all ${
                  location.pathname === item.path
                    ? 'text-primary-600 dark:text-primary-400 scale-110'
                    : 'text-gray-500 dark:text-gray-400 opacity-70'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs mt-1">{item.label.split(' ')[1]}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-24 lg:pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
