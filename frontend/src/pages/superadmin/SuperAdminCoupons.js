import React, { useState, useEffect } from 'react';
import { getAllCoupons, createCoupon, updateCoupon, deactivateCoupon, deleteCoupon } from '../../services/couponService';
import toast from 'react-hot-toast';

export default function SuperAdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    expiryDate: '',
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await getAllCoupons();
      setCoupons(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingId(coupon.couponId);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue || '',
        minimumOrderAmount: coupon.minimumOrderAmount || '',
        maximumDiscount: coupon.maximumDiscount || '',
        usageLimit: coupon.usageLimit || '',
        expiryDate: coupon.expiryDate ? coupon.expiryDate.substring(0, 16) : '',
        isActive: coupon.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '', description: '', discountType: 'PERCENTAGE', discountValue: '',
        minimumOrderAmount: '', maximumDiscount: '', usageLimit: '', expiryDate: '', isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // payload preparation
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : null,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        expiryDate: formData.expiryDate ? `${formData.expiryDate}:00` : null
      };

      if (editingId) {
        await updateCoupon(editingId, payload);
        toast.success('Coupon updated successfully');
      } else {
        await createCoupon(payload);
        toast.success('Coupon created successfully');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (err) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await deactivateCoupon(id);
      toast.success('Coupon deactivated');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupon Management</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + Create Coupon
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-600">
            <tr>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Code</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Discount</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Min Order</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Usage</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
            {coupons.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No coupons found.</td></tr>
            ) : coupons.map(c => (
              <tr key={c.couponId} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                <td className="p-4">
                  <div className="font-bold text-gray-900 dark:text-white">{c.code}</div>
                  <div className="text-xs text-gray-500">{c.description}</div>
                </td>
                <td className="p-4">
                  {c.discountType === 'FLAT' ? `₹${c.discountValue}` : `${c.discountValue}%`}
                </td>
                <td className="p-4">{c.minimumOrderAmount ? `₹${c.minimumOrderAmount}` : 'None'}</td>
                <td className="p-4">
                  {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : '(Unlimited)'}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button onClick={() => handleOpenModal(c)} className="text-blue-600 hover:text-blue-800">Edit</button>
                  {c.isActive && (
                     <button onClick={() => handleToggleStatus(c.couponId)} className="text-amber-600 hover:text-amber-800">Deactivate</button>
                  )}
                  <button onClick={() => handleDelete(c.couponId)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm font-medium">
              
              <div>
                <label className="block mb-1">Coupon Code *</label>
                <input className="input-field" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER50" />
              </div>
              
              <div>
                <label className="block mb-1">Description</label>
                <input className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Summer sale discount" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Discount Type</label>
                  <select className="input-field" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Discount Value *</label>
                  <input type="number" step="0.01" className="input-field" required value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Min Order Amount (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.minimumOrderAmount} onChange={e => setFormData({...formData, minimumOrderAmount: e.target.value})} />
                </div>
                <div>
                  <label className="block mb-1">Max Discount Cap (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.maximumDiscount} onChange={e => setFormData({...formData, maximumDiscount: e.target.value})} disabled={formData.discountType === 'FLAT'} placeholder={formData.discountType === 'FLAT' ? 'N/A' : ''} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Usage Limit (count)</label>
                  <input type="number" className="input-field" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} placeholder="Unlimited if empty" />
                </div>
                <div>
                  <label className="block mb-1">Expiry Date & Time</label>
                  <input type="datetime-local" className="input-field" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-primary-600 rounded border-gray-300" />
                <label htmlFor="isActive" className="text-gray-700 dark:text-gray-300">Is Active</label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
