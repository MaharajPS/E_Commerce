import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/superadmin', label: 'Overview', icon: '👑' },
  { to: '/superadmin/users', label: 'Users', icon: '👥' },
  { to: '/superadmin/sellers', label: 'Sellers', icon: '🏪' },
  { to: '/superadmin/admins', label: 'Admins', icon: '🛡️' },
  { to: '/superadmin/coupons', label: 'Coupons', icon: '🎟️' },
];

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);

  const fetchAdmins = () => {
    api.get('/superadmin/admins')
      .then(res => setAdmins(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await api.post('/superadmin/admins', form);
      toast.success('Admin created! 🛡️');
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', password: '' });
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin account?')) return;
    try {
      await api.delete(`/superadmin/admins/${id}`);
      setAdmins(prev => prev.filter(a => a.adminId !== id));
      toast.success('Admin deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <DashboardLayout title="Admin Management" navItems={navItems}>
      <div className="flex justify-end mb-6">
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Create Admin</button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <tr>
                {['Admin', 'Email', 'Phone', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {admins.map(admin => (
                <tr key={admin.adminId} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{admin.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{admin.user?.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{admin.phone || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(admin.adminId)}
                      className="text-xs px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200">
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {admins.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No admins yet. Create the first one!</div>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-8 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Create Admin Account</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input type="text" className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" className="input-field" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input type="tel" className="input-field" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Password *</label>
                <input type="password" className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? '⏳ Creating...' : '🛡️ Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
