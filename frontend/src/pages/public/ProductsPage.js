import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProductCard from '../../components/products/ProductCard';
import api from '../../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, number: 0 });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: 'createdAt',
    sortDir: 'desc',
    page: 0,
    size: 12,
  });

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.set('keyword', filters.keyword);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      params.set('page', filters.page);
      params.set('size', filters.size);
      params.set('sortBy', filters.sortBy);
      params.set('sortDir', filters.sortDir);

      const res = await api.get(`/products?${params}`);
      const data = res.data.data;
      setProducts(data?.content || []);
      setPagination({ totalPages: data?.totalPages || 1, number: data?.number || 0 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const sortOptions = [
    { value: 'createdAt_desc', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name A-Z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-4xl text-gray-900 dark:text-white mb-2">All Products</h1>
          <p className="text-gray-500 dark:text-gray-400">Discover our collection of {pagination.totalPages * filters.size}+ items</p>
        </div>

        {/* Search Bar */}
        <div className="glass-card p-4 rounded-2xl mb-6 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search products..."
              value={filters.keyword}
              onChange={e => updateFilter('keyword', e.target.value)}
            />
          </div>
          <select
            className="input-field w-auto min-w-40"
            value={filters.categoryId}
            onChange={e => updateFilter('categoryId', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
            ))}
          </select>
          <input type="number" className="input-field w-28" placeholder="Min $"
            value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
          <input type="number" className="input-field w-28" placeholder="Max $"
            value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
          <select className="input-field w-auto min-w-44"
            value={`${filters.sortBy}_${filters.sortDir}`}
            onChange={e => {
              const [sortBy, sortDir] = e.target.value.split('_');
              setFilters(p => ({ ...p, sortBy, sortDir, page: 0 }));
            }}>
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="shimmer h-52 w-full" />
                <div className="p-4 space-y-2">
                  <div className="shimmer h-4 w-3/4 rounded" />
                  <div className="shimmer h-4 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page === 0}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
              >← Prev</button>
              <span className="text-gray-700 dark:text-gray-300 text-sm px-4">
                Page {filters.page + 1} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                disabled={filters.page >= pagination.totalPages - 1}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
              >Next →</button>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="font-display font-semibold text-xl text-gray-700 dark:text-gray-300 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
