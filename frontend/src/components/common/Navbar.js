import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">🛒 E-Commerce</Link>
        <div className="flex space-x-4 items-center">
          <Link to="/products" className="text-gray-700 hover:text-blue-600">Products</Link>
          {user && <Link to="/orders" className="text-gray-700 hover:text-blue-600">My Orders</Link>}
          {user && isAdmin() && <Link to="/admin" className="text-gray-700 hover:text-blue-600">Admin</Link>}
          {user ? (
            <>
              <span className="text-gray-600">Hello, {user.name}</span>
              <button onClick={() => { logout(); navigate('/login'); }} className="btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;