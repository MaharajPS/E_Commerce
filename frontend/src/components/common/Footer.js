import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                Mart<span className="text-primary-400">X</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Your premium multi-seller marketplace. Shop from thousands of verified sellers worldwide.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-primary-400 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-primary-400 transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=Home" className="hover:text-primary-400 transition-colors">Home & Garden</Link></li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Sell</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/become-seller" className="hover:text-primary-400 transition-colors">Become a Seller</Link></li>
              <li><Link to="/seller" className="hover:text-primary-400 transition-colors">Seller Dashboard</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link></li>
              <li><Link to="/signup" className="hover:text-primary-400 transition-colors">Register</Link></li>
              <li><Link to="/orders" className="hover:text-primary-400 transition-colors">My Orders</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">© 2026 MartX. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">🔒 Secured by Stripe</span>
            <span className="text-xs text-gray-600">🛡️ SSL Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
