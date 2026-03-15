import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/wishlist')
      .then(res => setWishlist(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/customer/wishlist/${productId}`);
      setWishlist(prev => prev.filter(w => w.product?.productId !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-6 pb-20">
        <h1 className="page-header mb-8">❤️ My Wishlist ({wishlist.length})</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="shimmer h-64 rounded-2xl" />)}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="font-display font-semibold text-xl text-gray-700 dark:text-gray-300 mb-4">Your wishlist is empty</h3>
            <Link to="/products" className="btn-primary">Browse Products →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map(item => (
              <div key={item.wishlistId} className="glass-card overflow-hidden group">
                <div className="relative">
                  <div className="h-48 bg-gray-100 dark:bg-dark-600 overflow-hidden">
                    <img
                      src={item.product?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <button
                    onClick={() => removeFromWishlist(item.product?.productId)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-dark-700 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                  >❤️</button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{item.product?.name}</h3>
                  <p className="font-bold text-primary-600 dark:text-primary-400 mb-3">{formatPrice(item.product?.price)}</p>
                  <Link to={`/products/${item.product?.productId}`} className="btn-primary w-full justify-center text-sm py-2">
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
