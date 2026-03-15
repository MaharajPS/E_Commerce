import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const navItems = [
  { to: '/superadmin', label: 'Overview', icon: '👑' },
  { to: '/superadmin/users', label: 'Users', icon: '👥' },
  { to: '/superadmin/sellers', label: 'Sellers', icon: '🏪' },
  { to: '/superadmin/admins', label: 'Admins', icon: '🛡️' },
  { to: '/superadmin/coupons', label: 'Coupons', icon: '🎟️' },
];

const chartOpts = {
  responsive: true,
  plugins: { legend: { labels: { color: '#9ca3af', font: { family: 'Inter' } } } },
  scales: { x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(107,114,128,0.08)' } }, y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(107,114,128,0.08)' } } },
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/superadmin/analytics').then(res => setStats(res.data.data)).catch(() => {});
  }, []);

  const platformCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-primary-500 to-primary-700', change: '+12%' },
    { label: 'Total Sellers', value: stats?.totalSellers || 0, icon: '🏪', color: 'from-emerald-500 to-teal-600', change: '+8%' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'from-violet-500 to-purple-700', change: '+24%' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦', color: 'from-orange-500 to-red-500', change: '+18%' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '🛍️', color: 'from-cyan-500 to-blue-600', change: '+5%' },
    { label: 'Pending Apps', value: stats?.pendingApplications || 0, icon: '⏳', color: 'from-amber-500 to-orange-500', change: '' },
  ];

  const revenueData = {
    labels: stats?.monthlyRevenue?.map(m => m.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Platform Revenue (₹)',
      data: stats?.monthlyRevenue?.map(m => parseFloat(m.revenue) || 0) || [0, 0, 0, 0, 0, 0],
      borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)',
      fill: true, tension: 0.4,
    }],
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Customers', data: [120, 180, 240, 310, 390, 460], backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 6 },
      { label: 'Sellers', data: [12, 18, 24, 31, 39, 46], backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6 },
    ],
  };

  const roleDistData = {
    labels: ['Customers', 'Sellers', 'Admins', 'Super Admins'],
    datasets: [{ data: [stats?.totalCustomers || 70, stats?.totalSellers || 20, stats?.totalAdmins || 8, 2], backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'] }],
  };

  return (
    <DashboardLayout title="Super Admin — Platform Overview" navItems={navItems}>
      {/* Platform Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {platformCards.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-xl`}>{stat.icon}</div>
              {stat.change && <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">{stat.change}</span>}
            </div>
            <p className="font-black text-3xl text-gray-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">📈 Platform Revenue (Monthly)</h3>
          <Line data={revenueData} options={chartOpts} />
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">👤 User Distribution</h3>
          <Doughnut data={roleDistData} options={{ responsive: true, plugins: { legend: { labels: { color: '#9ca3af' } } } }} />
        </div>
        <div className="glass-card p-6 lg:col-span-3">
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">📊 User Growth (Last 6 Months)</h3>
          <Bar data={userGrowthData} options={chartOpts} />
        </div>
      </div>
    </DashboardLayout>
  );
}
