import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, getCartTotal } = useCart();

  if (cartItems.length === 0) return <div className="card text-center py-12">Your cart is empty</div>;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
      <div className="space-y-4">
        {cartItems.map(item => (
          <div key={item.productId} className="flex justify-between items-center border-b pb-4">
            <div>
              <h4 className="font-semibold">{item.productName}</h4>
              <p className="text-gray-600">${item.price} x {item.quantity}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeFromCart(item.productId)} className="text-red-600">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <span className="text-xl font-bold">Total: ${getCartTotal().toFixed(2)}</span>
        <Link to="/checkout" className="btn-primary">Checkout</Link>
      </div>
    </div>
  );
};

export default Cart;