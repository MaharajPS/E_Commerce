import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/seller', label: 'Dashboard', icon: '📊' },
  { to: '/seller/products', label: 'Products', icon: '📦' },
  { to: '/seller/orders', label: 'Orders', icon: '🛒' },
  { to: '/seller/analytics', label: 'Analytics', icon: '📈' },
];

const statusColors = {
  PENDING: 'badge-warning', CONFIRMED: 'badge-info',
  SHIPPED: 'badge-primary', DELIVERED: 'badge-success', CANCELLED: 'badge-danger',
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/orders')
      .then(res => setOrders(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/seller/orders/${orderId}/status?status=${status}`);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
      toast.success('Order status updated!');
    } catch {
      toast.error('Failed to update');
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <DashboardLayout title="Orders" navItems={navItems}>
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-14 rounded-xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Date', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                {orders.map(order => (
                  <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-900 dark:text-white">#{order.orderId}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.customerName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.items?.length || 0} items</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColors[order.status] || 'badge-info'}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.orderId, e.target.value)}
                        className="text-xs border border-gray-200 dark:border-dark-500 rounded-lg px-2 py-1.5 bg-white dark:bg-dark-600 text-gray-900 dark:text-white"
                      >
                        {['PENDING', 'CONFIRMED', 'CANCELLED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-500">No orders yet.</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
