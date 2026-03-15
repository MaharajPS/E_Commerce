import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProductCard from '../../components/products/ProductCard';
import api from '../../services/api';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { name: 'Electronics', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { name: 'Fashion', icon: '👗', color: 'from-pink-500 to-rose-500' },
  { name: 'Home & Garden', icon: '🏠', color: 'from-emerald-500 to-teal-500' },
  { name: 'Sports & Outdoors', icon: '⚽', color: 'from-orange-500 to-amber-500' },
  { name: 'Books', icon: '📚', color: 'from-violet-500 to-purple-500' },
  { name: 'Health & Beauty', icon: '✨', color: 'from-fuchsia-500 to-pink-500' },
];

export default function HomePage() {
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroBtnRef = useRef(null);
  const heroImgRef = useRef(null);
  const statsRef = useRef(null);
  const categoriesRef = useRef(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const navigate = useNavigate();

  // GSAP Hero Animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(heroTitleRef.current,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 }
    )
    .fromTo(heroSubRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 }, '-=0.5'
    )
    .fromTo(heroBtnRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 }, '-=0.4'
    )
    .fromTo(heroImgRef.current,
      { x: 80, opacity: 0, rotation: 5 },
      { x: 0, opacity: 1, rotation: 0, duration: 1 }, '-=1'
    );

    // Floating animation on hero image
    gsap.to(heroImgRef.current, {
      y: -15,
      duration: 3,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Stats counter animation on scroll
    ScrollTrigger.create({
      trigger: statsRef.current,
      start: 'top 80%',
      onEnter: () => {
        const counters = statsRef.current?.querySelectorAll('[data-count]');
        counters?.forEach(el => {
          const target = parseInt(el.dataset.count);
          gsap.fromTo(el, { textContent: 0 },
            {
              textContent: target,
              duration: 2,
              ease: 'power2.out',
              snap: { textContent: 1 },
              onUpdate() { el.textContent = Math.round(el.textContent).toLocaleString(); },
            }
          );
        });
      }
    });

    // Category cards stagger
    ScrollTrigger.create({
      trigger: categoriesRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo('.category-card',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
        );
      }
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  // Fetch featured products
  useEffect(() => {
    api.get('/products?size=8&sortBy=createdAt&sortDir=desc')
      .then(res => setFeaturedProducts(res.data.data?.content || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="hero-gradient min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center py-20">
          {/* Hero Text */}
          <div>
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
              <span className="text-primary-300 text-sm font-medium">Premium Marketplace</span>
            </div>

            <h1 ref={heroTitleRef} className="font-display text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Shop Smarter,<br />
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Sell Better
              </span>
            </h1>
            <p ref={heroSubRef} className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              Discover thousands of products from verified sellers worldwide. 
              Join our marketplace and start your entrepreneurial journey today.
            </p>

            <div ref={heroBtnRef} className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary text-base px-8 py-3.5 neon-glow">
                🛍️ Start Shopping
              </Link>
              <Link to="/become-seller" className="btn-outline border-white/30 text-white hover:bg-white hover:text-dark-900 text-base px-8 py-3.5">
                💼 Become a Seller
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div ref={heroImgRef} className="hidden md:flex justify-center">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary-500/30 rounded-3xl blur-3xl scale-110"></div>
              <div className="relative glass-card p-2 rounded-3xl border border-primary-500/20">
                <img
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=520&h=400&fit=crop"
                  alt="Shopping"
                  className="rounded-2xl w-full object-cover"
                />
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 glass-card px-4 py-2 rounded-xl border border-emerald-500/30 shadow-lg animate-pulse">
                  <p className="text-emerald-400 text-xs font-bold">✓ Secure Checkout</p>
                </div>
                <div className="absolute -bottom-4 -left-4 glass-card px-4 py-2 rounded-xl shadow-lg">
                  <p className="text-white text-xs font-bold">🔥 10K+ Products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { count: 50000, label: 'Happy Customers', suffix: '+' },
              { count: 10000, label: 'Products Listed', suffix: '+' },
              { count: 2500, label: 'Verified Sellers', suffix: '+' },
              { count: 98, label: 'Satisfaction Rate', suffix: '%' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="font-display font-black text-4xl text-white mb-1">
                  <span data-count={stat.count}>0</span>{stat.suffix}
                </div>
                <p className="text-primary-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section ref={categoriesRef} className="py-20 bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="category-card cursor-pointer group"
                onClick={() => navigate(`/products?keyword=${cat.name}`)}
              >
                <div className={`bg-gradient-to-br ${cat.color} p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300 group-hover:shadow-xl`}>
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <p className="text-white font-semibold text-sm">{cat.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white dark:bg-dark-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-display font-bold text-4xl text-gray-900 dark:text-white mb-2">
                  Featured Products
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Handpicked for you this week</p>
              </div>
              <Link to="/products" className="btn-outline">View All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — Become a Seller */}
      <section className="py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-6">
            Ready to Start Selling?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of entrepreneurs growing their business on MartX. 
            Apply today and start reaching millions of customers.
          </p>
          <Link to="/become-seller" className="btn-primary text-lg px-10 py-4 neon-glow">
            🚀 Apply as Seller — It's Free!
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
