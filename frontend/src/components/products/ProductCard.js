import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  const isAvailable = product.status === 'ACTIVE' && product.availableQuantity > 0;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
        <span className="text-6xl">📦</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl font-bold text-blue-600">${product.price}</span>
        <span className={`status-badge ${isAvailable ? 'status-delivered' : 'status-cancelled'}`}>
          {isAvailable ? 'In Stock' : 'Out'}
        </span>
      </div>
      <div className="flex space-x-2">
        <Link to={`/products/${product.id}`} className="btn-secondary flex-1 text-center">View</Link>
        {isAvailable && onAddToCart && (
          <button onClick={() => onAddToCart(product)} className="btn-primary flex-1">Add to Cart</button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;