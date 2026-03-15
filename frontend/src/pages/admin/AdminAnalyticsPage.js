import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/applications', label: 'Applications', icon: '📋' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
];

const CHART_OPTS = {
  responsive: true,
  plugins: {
    legend: { labels: { color: '#9ca3af', font: { family: 'Inter' } } },
  },
  scales: {
    x: { ticks: { color: '#6b7280' }, grid: { display: false } },
    y: { ticks: { color: '#6b7280' }, grid: { color: '#374151' } },
  },
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v || 0);

  const statCards = [
    { label: 'Total Revenue',     value: formatCurrency(stats?.totalRevenue),  icon: '💰', color: 'from-emerald-500 to-teal-600',  sub: 'All time' },
    { label: 'Total Orders',      value: stats?.totalOrders || 0,               icon: '🛒', color: 'from-blue-500 to-cyan-600',     sub: `${stats?.pendingOrders || 0} pending` },
    { label: 'Active Sellers',    value: stats?.totalSellers || 0,              icon: '🏪', color: 'from-violet-500 to-purple-600', sub: `${stats?.pendingApplications || 0} pending` },
    { label: 'Total Customers',   value: stats?.totalCustomers || 0,            icon: '👥', color: 'from-pink-500 to-rose-600',     sub: 'Registered' },
    { label: 'Total Products',    value: stats?.totalProducts || 0,             icon: '📦', color: 'from-amber-500 to-orange-600',  sub: 'Listed' },
    { label: 'Cancelled Orders',  value: stats?.cancelledOrders || 0,           icon: '❌', color: 'from-red-400 to-rose-500',      sub: 'This month' },
  ];

  const weeklyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Orders',
      data: stats?.weeklyOrders || [0, 0, 0, 0],
      backgroundColor: 'rgba(99,102,241,0.7)',
      borderColor: '#6366f1',
      borderRadius: 8,
    }],
  };

  const revenueData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Revenue (₹)',
      data: stats?.dailyRevenue || [320, 180, 430, 260, 510, 390, 480],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.15)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointRadius: 4,
    }],
  };

  const statusDoughnutData = {
    labels: ['Delivered', 'Pending', 'Cancelled', 'Shipped'],
    datasets: [{
      data: [
        stats?.deliveredOrders || 45,
        stats?.pendingOrders || 20,
        stats?.cancelledOrders || 10,
        stats?.shippedOrders || 25,
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  return (
    <DashboardLayout title="Analytics & Reports" navItems={navItems}>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="shimmer h-28 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((card, i) => (
              <div key={i} className="glass-card p-5 group hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                    {card.icon}
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-dark-600 px-2 py-0.5 rounded-full">{card.sub}</span>
                </div>
                <p className="font-black text-2xl text-gray-900 dark:text-white mb-0.5">{card.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-gray-900 dark:text-white">Weekly Orders</h3>
                <span className="text-xs text-gray-400 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-lg font-medium">This Month</span>
              </div>
              <Bar data={weeklyData} options={CHART_OPTS} />
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-gray-900 dark:text-white">Daily Revenue</h3>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-medium">This Week</span>
              </div>
              <Line data={revenueData} options={CHART_OPTS} />
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Status Donut */}
            <div className="glass-card p-6 flex flex-col items-center">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4 self-start">Order Status</h3>
              <div className="w-52">
                <Doughnut data={statusDoughnutData} options={{
                  responsive: true,
                  cutout: '70%',
                  plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 12 } } }
                }} />
              </div>
            </div>

            {/* Top Categories */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Top Categories</h3>
              <div className="space-y-3">
                {(stats?.topCategories || [
                  { name: 'Electronics', count: 340 },
                  { name: 'Fashion', count: 280 },
                  { name: 'Books', count: 190 },
                  { name: 'Sports', count: 150 },
                  { name: 'Home', count: 120 },
                ]).slice(0, 5).map((cat, i) => {
                  const max = stats?.topCategories?.[0]?.count || 340;
                  const pct = Math.round(((cat.count || cat[1] || 100) / max) * 100);
                  const name = cat.name || cat[0] || 'Category';
                  const count = cat.count || cat[1] || 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{name}</span>
                        <span className="text-gray-500 text-xs">{count} sold</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-dark-600 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Platform Highlights</h3>
              <div className="space-y-3">
                {[
                  { label: 'Avg. Order Value',   value: formatCurrency((stats?.totalRevenue || 0) / (stats?.totalOrders || 1)), icon: '📊' },
                  { label: 'Conversion Rate',    value: '3.8%',    icon: '📈' },
                  { label: 'Return Rate',        value: `${stats?.returnRate || 2.1}%`, icon: '↩️' },
                  { label: 'Seller Approval',    value: `${stats?.pendingApplications || 0} pending`, icon: '⏳' },
                  { label: 'Products Today',     value: `+${stats?.newProductsToday || 12}`, icon: '🆕' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-600 last:border-0">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
