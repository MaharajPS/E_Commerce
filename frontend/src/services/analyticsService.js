import api from './api';

export const analyticsService = {
  getSummary: async () => { const res = await api.get('/analytics/summary'); return res.data; },
  getTopProducts: async () => { const res = await api.get('/analytics/top-products'); return res.data; },
  getRevenuePerDay: async () => { const res = await api.get('/analytics/revenue/daily'); return res.data; },
  getOrdersByStatus: async () => { const res = await api.get('/analytics/orders/status'); return res.data; }
};