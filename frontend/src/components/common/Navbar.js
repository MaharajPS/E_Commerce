import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { gsap } from 'gsap';

const ShoppingBagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
  </svg>
);
const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
  </svg>
);
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

export default function Navbar() {
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const navLinks = [
    { to: '/products', label: 'Shop' },
    { to: '/become-seller', label: 'Become a Seller' },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-dark-800/95 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-dark-600'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Mart<span className="text-primary-500">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                  location.pathname === link.to
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Cart */}
            {(!isAuthenticated || user?.role === 'ROLE_CUSTOMER') && (
              <Link to="/cart" className="relative p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">
                <ShoppingBagIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-primary-500">{user?.role?.replace('ROLE_', '')}</p>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-2xl py-1 animate-slide-up">
                    <Link to={getDashboardRoute()}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-600"
                      onClick={() => setUserMenuOpen(false)}>
                      📊 Dashboard
                    </Link>
                    {user?.role === 'ROLE_CUSTOMER' && (
                      <>
                        <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-600" onClick={() => setUserMenuOpen(false)}>📦 My Orders</Link>
                        <Link to="/wishlist" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-600" onClick={() => setUserMenuOpen(false)}>❤️ Wishlist</Link>
                        <Link to="/wallet" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-600" onClick={() => setUserMenuOpen(false)}>👛 Wallet</Link>
                        <Link to="/rewards" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-600" onClick={() => setUserMenuOpen(false)}>⭐ Rewards</Link>
                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-600" onClick={() => setUserMenuOpen(false)}>👤 Profile</Link>
                      </>
                    )}
                    <hr className="my-1 border-gray-200 dark:border-dark-500" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm px-4 py-2">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-600 px-4 py-4 space-y-2 animate-slide-up">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-500" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}