import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const navItems = [
  { to: '/seller', label: 'Dashboard', icon: '📊' },
  { to: '/seller/products', label: 'Products', icon: '📦' },
  { to: '/seller/orders', label: 'Orders', icon: '🛒' },
  { to: '/seller/analytics', label: 'Analytics', icon: '📈' },
];

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/analytics')
      .then(res => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'My Products', value: stats?.totalProducts || 0, icon: '📦', color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🛒', color: 'from-emerald-500 to-teal-500' },
    { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'from-violet-500 to-purple-500' },
    { label: 'Products Active', value: stats?.totalProducts || 0, icon: '✅', color: 'from-orange-500 to-amber-500' },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#6b7280', font: { family: 'Inter' } } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(107,114,128,0.1)' } },
      y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(107,114,128,0.1)' } },
    },
  };

  const revenueData = {
    labels: stats?.dailyOrderStats?.map(d => d.date) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Revenue (₹)',
      data: stats?.dailyOrderStats?.map(d => d.revenue) || [120, 240, 180, 350, 290, 410, 380],
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const topProductsData = {
    labels: stats?.topProducts?.slice(0, 5).map(p => p.name) || [],
    datasets: [{
      label: 'Units Sold',
      data: stats?.topProducts?.slice(0, 5).map(p => p.count) || [],
      backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'],
      borderRadius: 8,
    }],
  };

  return (
    <DashboardLayout title="Seller Dashboard" navItems={navItems}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-xl mb-4`}>
              {stat.icon}
            </div>
            <p className="font-black text-3xl text-gray-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">Revenue Trend (Last 7 Days)</h3>
          <Line data={revenueData} options={chartOptions} />
        </div>
        {stats?.topProducts?.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">Top Products</h3>
            <Bar data={topProductsData} options={chartOptions} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
