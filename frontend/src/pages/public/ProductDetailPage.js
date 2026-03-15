import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StarRating = ({ value, onChange, interactive = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => interactive && onChange && onChange(star)}
        className={`text-2xl ${star <= value ? 'text-amber-400' : 'text-gray-300'} ${interactive ? 'hover:text-amber-300 cursor-pointer' : 'cursor-default'}`}
      >★</button>
    ))}
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [addingReview, setAddingReview] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    setLoading(true);
    
    if (isAuthenticated) {
      api.post(`/recently-viewed/${id}`).catch(() => {});
    }

    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/reviews`).catch(() => ({ data: { data: [] } })),
      api.get(`/products/${id}/similar`).catch(() => ({ data: { data: [] } })),
    ]).then(([prodRes, reviewRes, similarRes]) => {
      const prod = prodRes.data.data;
      setProduct(prod);
      setReviews(reviewRes.data.data || []);
      setSimilarProducts(similarRes.data.data || []);
      if (prod.variants?.length > 0) {
        setSelectedVariant(prod.variants[0]);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => addToCart(product.productId, quantity);

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    setWishlistLoading(true);
    try {
      await api.post(`/customer/wishlist/${id}`);
      toast.success('Added to wishlist ❤️');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setAddingReview(true);
    try {
      await api.post(`/customer/reviews/${id}?rating=${reviewForm.rating}&comment=${reviewForm.comment}`);
      toast.success('Review added! ⭐');
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setAddingReview(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="shimmer h-96 rounded-2xl" />
            <div className="space-y-4">
              <div className="shimmer h-8 w-3/4 rounded" />
              <div className="shimmer h-6 w-1/2 rounded" />
              <div className="shimmer h-24 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center"><p>Product not found</p></div>;

  const images = product.imageUrls?.length > 0
    ? product.imageUrls
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=500&fit=crop'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-6 pb-20">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-primary-500">Home</a> /
          <a href="/products" className="hover:text-primary-500 mx-1">Products</a> /
          <span className="text-gray-900 dark:text-white ml-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            <div className="glass-card overflow-hidden rounded-2xl mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'; }}
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-primary-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'; }} />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            {product.categoryName && (
              <span className="badge badge-primary mb-3">{product.categoryName}</span>
            )}
            <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <StarRating value={Math.round(product.averageRating || 0)} />
              <span className="text-gray-500 text-sm">({product.reviewCount || 0} reviews)</span>
            </div>

            <div className="text-4xl font-black text-primary-600 dark:text-primary-400 mb-4">
              {formatPrice(product.price)}
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Seller:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{product.storeName || product.sellerName}</span>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-gray-600 dark:text-gray-400">Stock:</span>
              <span className={`font-semibold ${(selectedVariant?.stock || product.stock) > 10 ? 'text-emerald-500' : (selectedVariant?.stock || product.stock) > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                {(selectedVariant?.stock || product.stock) > 0 ? `${selectedVariant?.stock || product.stock} available` : 'Out of Stock'}
              </span>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <span className="text-sm text-gray-600 dark:text-gray-400 block mb-3">Available Options:</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.variantId}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${selectedVariant?.variantId === v.variantId ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400'}`}
                    >
                      {v.attributes?.map(a => `${a.attributeName}: ${a.attributeValue}`).join(', ') || 'Standard'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add to Cart */}
            <div className="flex bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-600 gap-4 mb-6 sticky bottom-4">
              <div className="flex items-center border border-gray-200 dark:border-dark-500 rounded-xl overflow-hidden bg-white dark:bg-dark-700">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-600 font-bold">−</button>
                <div className="px-4 py-3 font-semibold min-w-[3rem] text-center border-x border-gray-200 dark:border-dark-500">
                  {quantity}
                </div>
                <button onClick={() => setQuantity(q => Math.min((selectedVariant?.stock || product.stock), q + 1))}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-600 font-bold">+</button>
              </div>
              
              <button onClick={handleAddToCart} disabled={(selectedVariant?.stock || product.stock) === 0}
                className="btn-primary flex-1 justify-center neon-glow shadow-primary-500/20 shadow-lg text-lg !py-3">
                🛒 Add to Cart
              </button>
              
              <button onClick={handleAddToWishlist} disabled={wishlistLoading}
                className="p-3 bg-white dark:bg-dark-700 rounded-xl border-2 border-gray-200 dark:border-dark-500 hover:border-accent-500 hover:text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-all">
                ❤️
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-dark-600">
              {['🔒 Secure Payment', '🚀 Fast Delivery', '↩️ Easy Returns', '⭐ Verified Seller'].map(badge => (
                <span key={badge} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 px-3 py-1.5 rounded-lg">{badge}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-8">
              Similar Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {similarProducts.map(p => (
                <a key={p.productId} href={`/products/${p.productId}`} className="glass-card p-3 group">
                  <div className="aspect-square rounded-xl overflow-hidden mb-3">
                    <img src={p.primaryImageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name}</h3>
                  <p className="text-primary-600 font-bold text-xs mt-1">{formatPrice(p.price)}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="glass-card p-8">
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6">
            Customer Reviews ({reviews.length})
          </h2>

          {/* Write Review */}
          {isAuthenticated && user?.role === 'ROLE_CUSTOMER' && (
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="form-label">Your Rating</label>
                <StarRating value={reviewForm.rating} onChange={r => setReviewForm(p => ({ ...p, rating: r }))} interactive />
              </div>
              <div className="mb-4">
                <label className="form-label">Your Comment</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Share your experience..."
                  value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} />
              </div>
              <button type="submit" disabled={addingReview} className="btn-primary">
                {addingReview ? '⏳ Submitting...' : '⭐ Submit Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length > 0 ? reviews.map((review, i) => (
              <div key={i} className="bg-white dark:bg-dark-700 rounded-xl p-4 border border-gray-100 dark:border-dark-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{review.customer?.name?.[0] || 'U'}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{review.customer?.name || 'Customer'}</span>
                  </div>
                  <StarRating value={review.rating} />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
