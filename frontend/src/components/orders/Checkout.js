import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderService.createOrder({ items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })) });
      clearCart();
      navigate('/orders?success=true');
    } catch (err) { alert(err.response?.data?.message || 'Order failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Summary</h3>
        {cartItems.map(item => (
          <div key={item.productId} className="flex justify-between text-gray-700">
            <span>{item.productName} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t mt-4 pt-4 font-bold text-lg flex justify-between">
          <span>Total</span><span>${getCartTotal().toFixed(2)}</span>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">{loading ? 'Processing...' : 'Place Order'}</button>
    </div>
  );
};

export default Checkout;