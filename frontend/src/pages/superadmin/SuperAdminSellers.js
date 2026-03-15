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

export default function SuperAdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/superadmin/sellers')
      .then(res => setSellers(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async (id) => {
    try {
      await api.patch(`/superadmin/sellers/${id}/block`);
      setSellers(prev => prev.map(s => s.sellerId === id ? { ...s, status: 'BLOCKED' } : s));
      toast.success('Seller blocked');
    } catch { toast.error('Failed'); }
  };

  const statusColors = { ACTIVE: 'badge-success', BLOCKED: 'badge-danger', INACTIVE: 'badge-warning', PENDING: 'badge-info' };

  return (
    <DashboardLayout title="Seller Management" navItems={navItems}>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <tr>
                {['Seller', 'Store', 'Email', 'Phone', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {sellers.map(seller => (
                <tr key={seller.sellerId} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{seller.name}</td>
                  <td className="px-4 py-3 text-primary-600 dark:text-primary-400 font-semibold">{seller.storeName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{seller.user?.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{seller.phone || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[seller.status] || 'badge-info'}`}>{seller.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {seller.status !== 'BLOCKED' && (
                      <button onClick={() => handleBlock(seller.sellerId)}
                        className="text-xs px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200">
                        ⊘ Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sellers.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No sellers registered yet.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
