import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';

const tabs = ['Profile', 'Addresses', 'Security'];

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [addresses, setAddresses] = useState([]);
  const [addingAddress, setAddingAddress] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', country: 'India', isDefault: false
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/customer/addresses').then(r => setAddresses(r.data.data || [])).catch(() => {});
    api.get('/customer/orders').then(r => {
      const orders = r.data.data || [];
      const delivered = orders.filter(o => o.status === 'DELIVERED').length;
      const totalSpend = orders.filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0);
      setStats({ total: orders.length, delivered, totalSpend });
    }).catch(() => {});
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      await api.post('/customer/addresses', addrForm);
      toast.success('Address saved! 🏠');
      const r = await api.get('/customer/addresses');
      setAddresses(r.data.data || []);
      setAddingAddress(false);
      setAddrForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/customer/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.addressId !== id));
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/customer/addresses/${id}/default`);
      const r = await api.get('/customer/addresses');
      setAddresses(r.data.data || []);
      toast.success('Default address updated ✅');
    } catch {
      toast.error('Failed to set default address');
    }
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p || 0);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const roleLabel = user?.role?.replace('ROLE_', '') || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-4 pb-20">

        {/* Profile Hero Card */}
        <div className="relative glass-card p-8 mb-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
                <span className="text-white font-black text-4xl">{initials}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-800 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="font-display font-black text-2xl text-gray-900 dark:text-white">{user?.name || 'Customer'}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
              <span className="inline-block mt-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold px-3 py-1 rounded-full">
                {roleLabel}
              </span>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="sm:ml-auto flex gap-5 text-center">
                <div>
                  <p className="font-black text-2xl text-gray-900 dark:text-white">{stats.total}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div>
                  <p className="font-black text-2xl text-emerald-500">{stats.delivered}</p>
                  <p className="text-xs text-gray-500">Delivered</p>
                </div>
                <div>
                  <p className="font-black text-2xl text-primary-500">{formatPrice(stats.totalSpend)}</p>
                  <p className="text-xs text-gray-500">Spent</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'My Orders', icon: '📦', href: '/orders' },
            { label: 'Wishlist',  icon: '❤️', href: '/wishlist' },
            { label: 'Wallet',    icon: '💰', href: '/wallet' },
            { label: 'Rewards',   icon: '⭐', href: '/rewards' },
          ].map(item => (
            <a key={item.label} href={item.href}
              className="glass-card p-4 text-center hover:border-primary-500 hover:shadow-lg transition-all group cursor-pointer border border-transparent">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.label}</p>
            </a>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="glass-card p-1.5 flex gap-1 mb-6 w-fit">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Profile' && (
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-6">Account Information</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', value: user?.name, icon: '👤' },
                { label: 'Email Address', value: user?.email, icon: '📧' },
                { label: 'Account Role', value: roleLabel, icon: '🏷️' },
                { label: 'Account Status', value: 'Active ✓', icon: '🟢' },
              ].map(field => (
                <div key={field.label} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4 border border-gray-100 dark:border-dark-600">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{field.icon}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{field.label}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{field.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">Saved Addresses</h2>
              <button onClick={() => setAddingAddress(!addingAddress)}
                className="btn-primary text-sm">
                {addingAddress ? '✕ Cancel' : '+ Add New'}
              </button>
            </div>

            {/* Add Address Form */}
            {addingAddress && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">New Address</h3>
                <form onSubmit={handleSaveAddress} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input required value={addrForm.fullName} onChange={e => setAddrForm(p => ({ ...p, fullName: e.target.value }))}
                      className="input-field" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="form-label">Phone *</label>
                    <input required value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))}
                      className="input-field" placeholder="+91 9876543210" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Address Line 1 *</label>
                    <input required value={addrForm.addressLine1} onChange={e => setAddrForm(p => ({ ...p, addressLine1: e.target.value }))}
                      className="input-field" placeholder="Street, Area" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Address Line 2</label>
                    <input value={addrForm.addressLine2} onChange={e => setAddrForm(p => ({ ...p, addressLine2: e.target.value }))}
                      className="input-field" placeholder="Landmark (optional)" />
                  </div>
                  <div>
                    <label className="form-label">City *</label>
                    <input required value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))}
                      className="input-field" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="form-label">State *</label>
                    <input required value={addrForm.state} onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))}
                      className="input-field" placeholder="Maharashtra" />
                  </div>
                  <div>
                    <label className="form-label">Pincode *</label>
                    <input required value={addrForm.pincode} onChange={e => setAddrForm(p => ({ ...p, pincode: e.target.value }))}
                      className="input-field" placeholder="400001" />
                  </div>
                  <div>
                    <label className="form-label">Country</label>
                    <input value={addrForm.country} onChange={e => setAddrForm(p => ({ ...p, country: e.target.value }))}
                      className="input-field" />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="isDefault" checked={addrForm.isDefault}
                      onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
                      className="w-4 h-4 accent-primary-500" />
                    <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">Set as default address</label>
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={savingAddr} className="btn-primary w-full justify-center">
                      {savingAddr ? '⏳ Saving...' : '🏠 Save Address'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Address Cards */}
            {addresses.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <div className="text-5xl mb-3">🏠</div>
                <p className="text-gray-500">No saved addresses yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr.addressId}
                    className={`glass-card p-5 border-2 transition-all ${addr.isDefault ? 'border-primary-500 shadow-lg shadow-primary-500/10' : 'border-transparent'}`}>
                    {addr.isDefault && (
                      <span className="inline-block bg-primary-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-3">✓ Default</span>
                    )}
                    <p className="font-bold text-gray-900 dark:text-white">{addr.fullName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-sm text-gray-500">{addr.addressLine2}</p>}
                    <p className="text-sm text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} — {addr.pincode}</p>
                    <p className="text-sm text-gray-500">{addr.country}</p>
                    <p className="text-sm text-gray-500 mt-1">📞 {addr.phone}</p>
                    <div className="flex gap-2 mt-4">
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefault(addr.addressId)}
                          className="text-xs px-3 py-1.5 border border-primary-400 text-primary-500 rounded-lg hover:bg-primary-500 hover:text-white transition-all">
                          Set Default
                        </button>
                      )}
                      <button onClick={() => handleDeleteAddress(addr.addressId)}
                        className="text-xs px-3 py-1.5 border border-red-300 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all ml-auto">
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Security' && (
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-6">Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Password</p>
                    <p className="text-xs text-gray-500">Last changed: recently</p>
                  </div>
                </div>
                <button className="text-xs px-4 py-2 border border-primary-400 text-primary-500 rounded-lg hover:bg-primary-500 hover:text-white transition-all">
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Extra layer of security for your account</p>
                  </div>
                </div>
                <span className="text-xs px-4 py-2 bg-gray-200 dark:bg-dark-600 text-gray-500 rounded-lg cursor-not-allowed">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">Account Verified</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">Your account is in good standing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
