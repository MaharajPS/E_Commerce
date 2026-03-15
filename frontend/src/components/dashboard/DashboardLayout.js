import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ChevronIcon = ({ isOpen }) => (
  <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function DashboardLayout({ title, navItems, children }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    ROLE_SUPER_ADMIN: 'from-purple-600 to-pink-600',
    ROLE_ADMIN: 'from-blue-600 to-cyan-600',
    ROLE_SELLER: 'from-emerald-600 to-teal-600',
    ROLE_CUSTOMER: 'from-primary-600 to-accent-600',
  };

  const gradientClass = roleColors[user?.role] || 'from-primary-600 to-accent-600';

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-600 flex flex-col min-h-screen fixed left-0 top-0 z-40`}>
        {/* Sidebar Header */}
        <div className={`bg-gradient-to-r ${gradientClass} p-4`}>
          {sidebarOpen ? (
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{user?.name}</p>
                  <p className="text-white/70 text-xs">{user?.role?.replace('ROLE_', '')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={!sidebarOpen ? item.label : ''}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-dark-600 space-y-1">
          <button
            onClick={toggleTheme}
            className="sidebar-link w-full"
          >
            <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
            {sidebarOpen && <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <Link to="/" className="sidebar-link">
            <span className="text-lg">🏬</span>
            {sidebarOpen && <span className="text-sm">Go to Store</span>}
          </Link>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
            <span className="text-lg">🚪</span>
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-dark-800/95 backdrop-blur-md border-b border-gray-200 dark:border-dark-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors text-gray-600 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">{title}</h1>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
