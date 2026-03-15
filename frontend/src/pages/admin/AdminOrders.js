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

const statusColors = {
  PENDING: 'badge-warning', CONFIRMED: 'badge-info',
  SHIPPED: 'badge-primary', DELIVERED: 'badge-success', CANCELLED: 'badge-danger',
  RETURN_REQUESTED: 'badge-warning', RETURNED: 'badge-success',
  REPLACEMENT_REQUESTED: 'badge-warning', REPLACED: 'badge-success'
};

const allStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REPLACEMENT_REQUESTED', 'REPLACED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/admin/orders')
      .then(res => setOrders(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status?status=${status}`);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
      toast.success('Status updated successfully');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);
  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <DashboardLayout title="All Orders" navItems={navItems}>
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', ...allStatuses].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filter === tab ? 'bg-primary-500 text-white' : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'}`}>
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <tr>
                {['Order ID', 'Customer', 'Total', 'Date', 'Payment', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {filtered.map(order => (
                <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-900 dark:text-white">#{order.orderId}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.customerName}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3"><span className="badge badge-info">{order.paymentMethod || 'COD'}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${statusColors[order.status] || 'badge-info'}`}>{order.status}</span></td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.orderId, e.target.value)}
                      className="text-xs border border-gray-200 dark:border-dark-500 rounded-lg px-2 py-1.5 bg-white dark:bg-dark-600 text-gray-900 dark:text-white"
                    >
                      {allStatuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No orders found for this filter.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
