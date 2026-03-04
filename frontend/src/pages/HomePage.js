import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/products/ProductList';
import Analytics from '../components/admin/Analytics';

const HomePage = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to E-Commerce</h1>
      {isAdmin() ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Admin Overview</h2>
          <Analytics />
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
          <ProductList />
        </div>
      )}
    </div>
  );
};

export default HomePage;