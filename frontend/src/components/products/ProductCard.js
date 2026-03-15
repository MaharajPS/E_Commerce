import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { gsap } from 'gsap';

const StarIcon = ({ filled }) => (
  <svg className={`w-3.5 h-3.5 ${filled ? 'text-amber-400' : 'text-gray-300'}`} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Fly animation
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const cartIcon = document.querySelector('[data-cart-icon]');

    if (cartIcon) {
      const dot = document.createElement('div');
      dot.className = 'fly-to-cart';
      dot.style.cssText = `left:${rect.left + rect.width / 2}px;top:${rect.top}px;`;
      document.body.appendChild(dot);
      const cartRect = cartIcon.getBoundingClientRect();
      gsap.to(dot, {
        left: cartRect.left + cartRect.width / 2,
        top: cartRect.top,
        scale: 0,
        duration: 0.7,
        ease: 'power2.in',
        onComplete: () => dot.remove(),
      });
    }

    await addToCart(product.productId);
  };

  const primaryImage = product.primaryImageUrl ||
    (product.imageUrls?.length > 0 ? product.imageUrls[0] : null) ||
    `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop`;

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.averageRating || 0));

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  return (
    <div className="product-card">
      <Link to={`/products/${product.productId}`}>
        {/* Image */}
        <div className="relative overflow-hidden h-52 bg-gray-100 dark:bg-dark-600">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop`;
            }}
          />
          {/* Category badge */}
          {product.categoryName && (
            <span className="absolute top-3 left-3 badge badge-primary text-xs">
              {product.categoryName}
            </span>
          )}
          {/* Stock badge */}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-3 right-3 badge badge-warning">Low Stock</span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-3 right-3 badge badge-danger">Out of Stock</span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.storeName || product.sellerName}</p>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors">
            {product.name}
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-3">
            {stars.map((filled, i) => <StarIcon key={i} filled={filled} />)}
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
          </div>

          {/* Price + Add to Cart */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Cart
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}