import api from './api';

export const productService = {

  getAllProducts: async (page = 0, size = 10) => {
    const response = await api.get('/products', { params: { page, size } });
    return response.data;
  },

  getActiveProducts: async () => {
    const response = await api.get('/products/active');
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  updateProductStatus: async (id, status) => {
    const response = await api.patch(`/products/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
  }

};