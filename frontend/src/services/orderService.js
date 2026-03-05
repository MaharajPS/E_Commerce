import api from './api';

export const orderService = {
  createOrder: async (data) => {
    const response = await api.post('/orders', data);
    return response.data;
  },
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  }
};