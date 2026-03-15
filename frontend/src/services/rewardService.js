import api from './api';

export const getRewardBalance = () => api.get('/rewards/balance');
export const getRewardHistory = () => api.get('/rewards/history');
