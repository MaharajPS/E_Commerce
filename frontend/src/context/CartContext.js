import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated || user?.role !== 'ROLE_CUSTOMER') return;
    try {
      const res = await api.get('/customer/cart');
      const cartData = res.data.data;
      setCart(cartData);
      setCartCount(cartData?.items?.length || 0);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return false;
    }
    setLoading(true);
    try {
      const res = await api.post(`/customer/cart/add?productId=${productId}&quantity=${quantity}`);
      const cartData = res.data.data;
      setCart(cartData);
      setCartCount(cartData?.items?.length || 0);
      toast.success('Added to cart! 🛒');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    try {
      const res = await api.delete(`/customer/cart/item/${itemId}`);
      const cartData = res.data.data;
      setCart(cartData);
      setCartCount(cartData?.items?.length || 0);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.put(`/customer/cart/item/${itemId}?quantity=${quantity}`);
      const cartData = res.data.data;
      setCart(cartData);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, addToCart, removeFromCart, updateQuantity, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);