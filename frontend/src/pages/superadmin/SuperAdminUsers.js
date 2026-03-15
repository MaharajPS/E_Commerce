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

const roleColors = { ROLE_CUSTOMER: 'badge-primary', ROLE_SELLER: 'badge-success', ROLE_ADMIN: 'badge-info', ROLE_SUPER_ADMIN: 'badge-warning' };
const statusColors = { ACTIVE: 'badge-success', BLOCKED: 'badge-danger', INACTIVE: 'badge-warning' };

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    api.get('/superadmin/users')
      .then(res => setUsers(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async (id, isBlocked) => {
    try {
      await api.patch(`/superadmin/users/${id}/${isBlocked ? 'unblock' : 'block'}`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: isBlocked ? 'ACTIVE' : 'BLOCKED' } : u));
      toast.success(isBlocked ? 'User unblocked' : 'User blocked');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await api.delete(`/superadmin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <DashboardLayout title="User Management" navItems={navItems}>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input type="text" className="input-field max-w-xs" placeholder="🔍 Search by email..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input-field w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="ALL">All Roles</option>
          <option value="ROLE_CUSTOMER">Customer</option>
          <option value="ROLE_SELLER">Seller</option>
          <option value="ROLE_ADMIN">Admin</option>
          <option value="ROLE_SUPER_ADMIN">Super Admin</option>
        </select>
        <div className="text-sm text-gray-500 dark:text-gray-400 self-center">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <tr>
                {['ID', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs">#{user.id}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${roleColors[user.role] || 'badge-info'}`}>{user.role?.replace('ROLE_', '')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[user.status] || 'badge-info'}`}>{user.status || 'ACTIVE'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    {user.role !== 'ROLE_SUPER_ADMIN' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleBlock(user.id, user.status === 'BLOCKED')}
                          className={`text-xs px-2 py-1 rounded-lg transition-colors ${user.status === 'BLOCKED' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
                          {user.status === 'BLOCKED' ? '✓ Unblock' : '⊘ Block'}
                        </button>
                        <button onClick={() => handleDelete(user.id)}
                          className="text-xs px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No users found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
