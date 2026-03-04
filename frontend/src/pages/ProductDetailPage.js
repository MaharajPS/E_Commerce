import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    productService.getProductById(id).then(data => {
      setProduct(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-4">Back</button>
      <div className="card grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-8xl">📦</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="text-2xl font-bold text-blue-600 mb-6">${product.price}</div>
          <p className="mb-6">Stock: {product.availableQuantity}</p>
          <button onClick={() => addToCart(product)} className="btn-primary w-full">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;