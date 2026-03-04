import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Analytics = () => {
  const [data, setData] = useState({ summary: null, topProducts: [], status: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsService.getSummary(), analyticsService.getTopProducts(), analyticsService.getOrdersByStatus()])
      .then(([summary, products, status]) => { setData({ summary, topProducts: products, status }); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-12">Loading Analytics...</div>;

  const statusData = Object.entries(data.status).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="card"><h3 className="text-gray-600">Total Orders</h3><p className="text-3xl font-bold">{data.summary?.totalOrders || 0}</p></div>
        <div className="card"><h3 className="text-gray-600">Revenue</h3><p className="text-3xl font-bold">${data.summary?.totalRevenue || 0}</p></div>
        <div className="card"><h3 className="text-gray-600">Customers</h3><p className="text-3xl font-bold">{data.summary?.totalCustomers || 0}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold mb-4">Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topProducts}><Bar dataKey="totalSold" fill="#3b82f6" /><Tooltip /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-bold mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label><Cell key={0} fill={COLORS[0]} /><Cell key={1} fill={COLORS[1]} /><Cell key={2} fill={COLORS[2]} /><Cell key={3} fill={COLORS[3]} /></Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;