import React from 'react';
import { useCart } from '../context/CartContext';
import ProductList from '../components/products/ProductList';

const ProductsPage = () => {
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      <ProductList onAddToCart={addToCart} />
    </div>
  );
};

export default ProductsPage;