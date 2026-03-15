import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg`} style={{ background: color }}>
    <div className="absolute inset-0 opacity-10">
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white"></div>
      <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white"></div>
    </div>
    <div className="relative z-10">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm font-medium opacity-80 uppercase tracking-wider">{label}</p>
      <p className="text-4xl font-extrabold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="rounded-2xl p-6 bg-gray-200 animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
    <div className="h-10 bg-gray-300 rounded w-3/4"></div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700 text-sm">
        {label && <p className="font-semibold mb-1 text-indigo-300">{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color || '#fff' }}>
            {entry.name}: <span className="font-bold">{typeof entry.value === 'number' && entry.name?.toLowerCase().includes('revenue') ? `₹${Number(entry.value).toFixed(2)}` : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [data, setData] = useState({ summary: null, topProducts: [], status: {}, dailyRevenue: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      analyticsService.getSummary(),
      analyticsService.getTopProducts(),
      analyticsService.getOrdersByStatus(),
      analyticsService.getRevenuePerDay()
    ])
      .then(([summary, topProducts, status, dailyRevenue]) => {
        setData({ summary, topProducts: topProducts || [], status: status || {}, dailyRevenue: (dailyRevenue || []).reverse() });
        setLoading(false);
      })
      .catch(err => {
        console.error('Analytics error:', err);
        setError('Failed to load analytics data. Please try again.');
        setLoading(false);
      });
  }, []);

  const statusData = Object.entries(data.status || {}).map(([name, value]) => ({ name: name.charAt(0) + name.slice(1).toLowerCase(), value: Number(value) }));
  const topProductsFormatted = (data.topProducts || []).map(p => ({
    name: p.productName && p.productName.length > 14 ? p.productName.slice(0, 14) + '…' : (p.productName || 'N/A'),
    fullName: p.productName,
    totalSold: p.totalSold || 0,
    revenue: Number(p.revenue || 0).toFixed(2)
  }));
  const revenueData = (data.dailyRevenue || []).map(r => ({
    date: r.saleDate ? String(r.saleDate).slice(5) : '',
    Revenue: Number(r.dailyRevenue || 0).toFixed(2)
  }));

  if (loading) return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-200 animate-pulse h-72"></div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">Analytics Unavailable</h3>
      <p className="text-gray-500 mb-6">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition">
        Retry
      </button>
    </div>
  );

  const totalRevenue = Number(data.summary?.totalRevenue || 0);

  return (
    <div className="space-y-8">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon="📦"
          label="Total Orders"
          value={data.summary?.totalOrders ?? 0}
          color="linear-gradient(135deg, #6366f1, #8b5cf6)"
          sub="All time order count"
        />
        <StatCard
          icon="💰"
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="linear-gradient(135deg, #10b981, #059669)"
          sub="Confirmed, Shipped & Delivered"
        />
        <StatCard
          icon="👥"
          label="Total Customers"
          value={data.summary?.totalCustomers ?? 0}
          color="linear-gradient(135deg, #f59e0b, #d97706)"
          sub="Unique customers with orders"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-1">🏆 Top Selling Products</h3>
          <p className="text-xs text-gray-400 mb-5">By units sold (excluding cancelled orders)</p>
          {topProductsFormatted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <span className="text-4xl mb-2">📊</span>
              <p>No product sales data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProductsFormatted} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 11, fill: '#6b7280' }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalSold" name="Units Sold" radius={[6, 6, 0, 0]}>
                  {topProductsFormatted.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-1">📋 Orders by Status</h3>
          <p className="text-xs text-gray-400 mb-5">Breakdown of all order statuses</p>
          {statusData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <span className="text-4xl mb-2">🥧</span>
              <p>No order status data yet</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {statusData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span>{entry.name}</span>
                    <span className="font-semibold text-gray-800">({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Revenue Area Chart */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">📈 Daily Revenue Trend</h3>
        <p className="text-xs text-gray-400 mb-5">Revenue from confirmed/shipped/delivered orders over the last 30 days</p>
        {revenueData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <span className="text-4xl mb-2">📉</span>
            <p>No daily revenue data available in this date range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGradient)" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Products Revenue Table */}
      {topProductsFormatted.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-5">🛒 Product Revenue Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 rounded-l-xl">Rank</th>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-right px-4 py-3">Units Sold</th>
                  <th className="text-right px-4 py-3 rounded-r-xl">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.topProducts || []).map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: COLORS[i % COLORS.length] }}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.productName}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.totalSold}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">₹{Number(p.revenue || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;