import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/seller', label: 'Dashboard', icon: '📊' },
  { to: '/seller/products', label: 'Products', icon: '📦' },
  { to: '/seller/orders', label: 'Orders', icon: '🛒' },
  { to: '/seller/analytics', label: 'Analytics', icon: '📈' },
];

const UNSPLASH_DEFAULTS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
];

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '',
    categoryId: '', imageUrls: [''], primaryImageUrl: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    Promise.all([
      api.get('/seller/products'),
      api.get('/categories'),
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrls: [UNSPLASH_DEFAULTS[0]], primaryImageUrl: UNSPLASH_DEFAULTS[0] });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId || '',
      imageUrls: product.imageUrls?.length > 0 ? product.imageUrls : [UNSPLASH_DEFAULTS[0]],
      primaryImageUrl: product.primaryImageUrl || product.imageUrls?.[0] || UNSPLASH_DEFAULTS[0],
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), imageUrls: form.imageUrls.filter(Boolean) };
      if (editProduct) {
        await api.put(`/seller/products/${editProduct.productId}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/seller/products', payload);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/seller/products/${id}`);
      toast.success('Product deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus === 'ACTIVE' ? 'deactivate' : 'activate';
    try {
      await api.patch(`/seller/products/${id}/${action}`);
      toast.success(`Product ${action}d!`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);

  return (
    <DashboardLayout title="My Products" navItems={navItems}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 dark:text-gray-400">{products.length} products total</p>
        <button onClick={openCreate} className="btn-primary">+ Add Product</button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-16 rounded-xl" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                {products.map(product => (
                  <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-600 flex-shrink-0">
                          <img src={product.primaryImageUrl || UNSPLASH_DEFAULTS[0]} alt="" className="w-full h-full object-cover"
                            onError={e => { e.target.src = UNSPLASH_DEFAULTS[0]; }} />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white max-w-xs truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.categoryName || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-primary-600 dark:text-primary-400">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${product.stock > 10 ? 'badge-success' : product.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${product.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{product.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(product)} className="text-xs px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 transition-colors">Edit</button>
                        <button onClick={() => handleToggleStatus(product.productId, product.status)}
                          className={`text-xs px-2 py-1 rounded-lg transition-colors ${product.status === 'ACTIVE' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200'}`}>
                          {product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(product.productId)} className="text-xs px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-12 text-gray-500">No products yet. Click "+ Add Product" to get started.</div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="form-label">Product Name *</label>
                <input type="text" className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" step="0.01" min="0" className="input-field" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Stock *</label>
                  <input type="number" min="0" className="input-field" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="form-label">Category</label>
                <select className="input-field" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Image URL (Unsplash or any URL)</label>
                <input type="url" className="input-field" value={form.imageUrls[0] || ''} onChange={e => setForm(p => ({ ...p, imageUrls: [e.target.value], primaryImageUrl: e.target.value }))} placeholder="https://images.unsplash.com/..." />
                {form.imageUrls[0] && (
                  <img src={form.imageUrls[0]} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-xl"
                    onError={e => { e.target.src = UNSPLASH_DEFAULTS[0]; }} />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? '⏳ Saving...' : editProduct ? '💾 Update' : '+ Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
