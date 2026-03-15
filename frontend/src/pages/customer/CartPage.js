import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) =>
    sum + (parseFloat(item.product?.price || 0) * item.quantity), 0);

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="pt-24 max-w-5xl mx-auto px-6 pb-20">
        <h1 className="page-header mb-8">🛒 Shopping Cart ({items.length})</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="font-display font-semibold text-xl text-gray-700 dark:text-gray-300 mb-4">Your cart is empty</h3>
            <Link to="/products" className="btn-primary">Start Shopping →</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.cartItemId} className="glass-card p-5 flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-dark-600">
                    <img
                      src={item.product?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">{item.product?.name}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-bold">{formatPrice(item.product?.price || 0)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => item.quantity > 1 ? updateQuantity(item.cartItemId, item.quantity - 1) : removeFromCart(item.cartItemId)}
                      className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-600 font-bold hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors text-gray-900 dark:text-white">−</button>
                    <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-600 font-bold hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors text-gray-900 dark:text-white">+</button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{formatPrice((item.product?.price || 0) * item.quantity)}</p>
                    <button onClick={() => removeFromCart(item.cartItemId)}
                      className="text-red-400 hover:text-red-600 text-xs mt-1">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="glass-card p-6 h-fit">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-6">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-emerald-500">Free</span>
                </div>
                <div className="border-t border-gray-200 dark:border-dark-600 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400 text-lg">{formatPrice(subtotal)}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')} className="btn-primary w-full justify-center py-3.5">
                🔐 Proceed to Checkout
              </button>
              <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-primary-500 mt-4">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
