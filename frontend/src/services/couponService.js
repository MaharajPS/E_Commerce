import api from './api';

export const getActiveCoupons     = ()           => api.get('/coupons/active');
export const getCouponByCode      = (code)       => api.get(`/coupons/${code}`);
export const validateCoupon       = (code, total) => api.get(`/coupons/validate/${code}?orderTotal=${total}`);
export const getAllCoupons         = ()           => api.get('/coupons');
export const createCoupon         = (data)       => api.post('/coupons', data);
export const updateCoupon         = (id, data)   => api.put(`/coupons/${id}`, data);
export const deactivateCoupon     = (id)         => api.patch(`/coupons/${id}/deactivate`);
export const deleteCoupon         = (id)         => api.delete(`/coupons/${id}`);
