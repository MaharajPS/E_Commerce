import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/applications', label: 'Applications', icon: '📋' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/products')
      .then(res => setProducts(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDeactivate = async (id) => {
    try {
      await api.patch(`/admin/products/${id}/deactivate`);
      setProducts(prev => prev.map(p => p.productId === id ? { ...p, status: 'INACTIVE' } : p));
      toast.success('Product deactivated');
    } catch {
      toast.error('Failed');
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);
  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.storeName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Product Management" navItems={navItems}>
      <div className="mb-4">
        <input type="text" className="input-field max-w-xs" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <tr>
                {['Product', 'Seller', 'Price', 'Stock', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {filtered.map(product => (
                <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-xs truncate">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.storeName || product.sellerName}</td>
                  <td className="px-4 py-3 font-semibold text-primary-600 dark:text-primary-400">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>{product.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${product.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{product.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {product.status === 'ACTIVE' && (
                      <button onClick={() => handleDeactivate(product.productId)} className="text-xs px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200">
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No products found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
