import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/applications', label: 'Applications', icon: '📋' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(res => setStats(res.data.data)).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🛒', color: 'from-blue-500 to-cyan-500' },
    { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'from-emerald-500 to-teal-500' },
    { label: 'Active Sellers', value: stats?.totalSellers || 0, icon: '🏪', color: 'from-violet-500 to-purple-500' },
    { label: 'Pending Apps', value: stats?.pendingApplications || 0, icon: '⏳', color: 'from-orange-500 to-amber-500' },
  ];

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#9ca3af' } } },
    scales: { x: { ticks: { color: '#6b7280' }, grid: { display: false } }, y: { ticks: { color: '#6b7280' } } },
  };

  return (
    <DashboardLayout title="Admin Dashboard" navItems={navItems}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-xl mb-4`}>{stat.icon}</div>
            <p className="font-black text-3xl text-gray-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg dark:text-white text-gray-900 mb-4">Orders This Month</h3>
          <Bar options={chartOptions} data={{
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{ label: 'Orders', data: [stats?.weeklyOrders?.[0] || 0, stats?.weeklyOrders?.[1] || 0, stats?.weeklyOrders?.[2] || 0, stats?.weeklyOrders?.[3] || 0], backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 6 }]
          }} />
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg dark:text-white text-gray-900 mb-4">Revenue Trend</h3>
          <Line options={chartOptions} data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{ label: 'Revenue (₹)', data: [320, 180, 430, 260, 510, 390, 480], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 }]
          }} />
        </div>
      </div>
    </DashboardLayout>
  );
}
