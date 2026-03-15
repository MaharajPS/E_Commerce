import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const navItems = [
  { to: '/seller', label: 'Dashboard', icon: '📊' },
  { to: '/seller/products', label: 'Products', icon: '📦' },
  { to: '/seller/orders', label: 'Orders', icon: '🛒' },
  { to: '/seller/analytics', label: 'Analytics', icon: '📈' },
];

const chartDefaults = {
  responsive: true,
  plugins: { legend: { labels: { color: '#9ca3af', font: { family: 'Inter' } } } },
  scales: {
    x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(107,114,128,0.08)' } },
    y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(107,114,128,0.08)' } },
  },
};

export default function SellerAnalytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/seller/analytics').then(res => setStats(res.data.data));
  }, []);

  const sampleDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  });

  const revenueData = {
    labels: stats?.dailyOrderStats?.map(d => d.date) || sampleDates,
    datasets: [{
      label: 'Daily Revenue (₹)',
      data: stats?.dailyOrderStats?.map(d => parseFloat(d.revenue) || 0) || [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)',
      fill: true, tension: 0.4, pointBackgroundColor: '#6366f1',
    }],
  };

  const ordersData = {
    labels: stats?.dailyOrderStats?.map(d => d.date) || sampleDates,
    datasets: [{
      label: 'Orders',
      data: stats?.dailyOrderStats?.map(d => parseInt(d.orders) || 0) || [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(244,63,94,0.7)',
      borderRadius: 6,
    }],
  };

  const topProductsData = {
    labels: stats?.topProducts?.slice(0, 5).map(p => p.name) || ['No data'],
    datasets: [{
      data: stats?.topProducts?.slice(0, 5).map(p => p.count) || [1],
      backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'],
    }],
  };

  return (
    <DashboardLayout title="Analytics" navItems={navItems}>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">📈 Revenue Trend (30 Days)</h3>
          <Line data={revenueData} options={chartDefaults} />
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">📦 Daily Orders</h3>
          <Bar data={ordersData} options={chartDefaults} />
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">🏆 Top Products (By Sales)</h3>
          {stats?.topProducts?.length > 0 ? (
            <Doughnut data={topProductsData} options={{ responsive: true, plugins: { legend: { labels: { color: '#9ca3af' } } } }} />
          ) : (
            <div className="text-center py-12 text-gray-500">No sales data yet</div>
          )}
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">📊 Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400">Total Products</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats?.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400">Revenue (30d)</span>
              <span className="font-bold text-emerald-500">₹{(stats?.dailyOrderStats?.reduce((s, d) => s + parseFloat(d.revenue || 0), 0) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
              <span className="text-gray-600 dark:text-gray-400">Orders (30d)</span>
              <span className="font-bold text-primary-500">{stats?.dailyOrderStats?.reduce((s, d) => s + parseInt(d.orders || 0), 0) || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
