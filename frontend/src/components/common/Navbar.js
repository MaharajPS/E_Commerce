import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
//   const handleSearch = (e) => {
//   e.preventDefault();
//   navigate(`/products?search=${search}`);
// };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          🛍️ ShopEase
        </Link>

       
    {/* <form onSubmit={handleSearch} className="hidden md:flex items-center mx-6">
  <input
    type="text"
    placeholder="Search products..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border border-gray-300 px-3 py-2 rounded-l-md focus:outline-none"
  />

  <button
    type="submit"
    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
  >
    Search
  </button>
</form> */}

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-2">
          <Link to="/products" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all font-medium text-sm">
            Products
          </Link>
          {user && (
            <Link to="/orders" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all font-medium text-sm">
              My Orders
            </Link>
          )}
          {user && isAdmin() && (
            <Link to="/admin" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all font-medium text-sm">
              Admin
            </Link>
          )}
          {user && isAdmin() && (
            <Link to="/analytics" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all font-medium text-sm">
              Analytics
            </Link>
          )}
        </div>

        {/* Right side: Cart + Auth */}
        <div className="flex items-center space-x-3">
          {/* Cart Button — visible to logged-in non-admin users */}
          {user && !isAdmin() && (
            <Link
              to="/cart"
              id="navbar-cart-btn"
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 hover:scale-110"
              title="View Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13L17 13M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {totalItems > 0 && (
                <span
                  id="cart-item-count"
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-bounce"
                  style={{ animationIterationCount: 1 }}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Auth Section */}
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="hidden md:inline text-sm text-gray-500 font-medium">
                👋 {user.name}
              </span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-medium">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;