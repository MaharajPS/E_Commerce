import api from './api';

export const getWalletBalance = () => api.get('/wallet/balance');
export const getRewardBalance = () => api.get('/rewards/balance');
export const getWalletHistory = () => api.get('/wallet/history');
export const addMoneyToWallet = (amount) => api.post('/wallet/add-money', { amount });

// Stripe Payment for Wallet
export const createWalletStripeIntent = (amount) => api.post('/wallet/stripe/create-intent', { amount });
export const confirmWalletStripePayment = (paymentIntentId) => api.post('/wallet/stripe/confirm', { paymentIntentId });
