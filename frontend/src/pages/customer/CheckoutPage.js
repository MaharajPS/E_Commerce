import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { getWalletBalance } from '../../services/walletService';
import { getRewardBalance } from '../../services/rewardService';
import { validateCoupon, getActiveCoupons } from '../../services/couponService';
import toast from 'react-hot-toast';

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

const stripePromise = loadStripe('pk_test_51SqtFuH3E32cbsgKdclDZ7UwUCHTD6uq6smZ2Nnb0iJj8xsycmP1eeTQntPR1lvWCuI7FlwLWSS8i62KUbwfZobH00n0IdW9vu');

function StripeOrderForm({ clientSecret, amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">💳 Card Payment</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">Pay {INR(amount)} securely with Stripe</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 border-2 border-gray-100 dark:border-dark-700 rounded-2xl bg-gray-50 dark:bg-dark-900">
            <CardElement options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': { color: '#aab7c4' },
                },
                invalid: { color: '#9e2146' },
              },
            }} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1 py-3">Cancel</button>
            <button type="submit" disabled={!stripe || loading} className="btn-primary flex-1 py-3">
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  // Wallet
  const [wallet, setWallet] = useState(null);
  const [useWallet, setUseWallet] = useState(false);

  // Rewards
  const [rewardPoints, setRewardPoints] = useState(null);
  const [useRewards, setUseRewards] = useState(false);
  const [rewardPointsToRedeem, setRewardPointsToRedeem] = useState(100);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Protect Promise
  const [protectPromise, setProtectPromise] = useState(false);

  // Stripe Modal
  const [stripeData, setStripeData] = useState(null); // { clientSecret, orderId, finalAmount }

  const items = cart?.items || [];
  const itemsTotal = items.reduce((sum, item) => sum + (parseFloat(item.product?.price || 0) * item.quantity), 0);

  // Calculate discount from coupon
  const couponDiscount = (() => {
    if (!appliedCoupon) return 0;
    if (itemsTotal < parseFloat(appliedCoupon.minimumOrderAmount || 0)) return 0;
    if (appliedCoupon.discountType === 'FLAT') return parseFloat(appliedCoupon.discountValue);
    return itemsTotal * parseFloat(appliedCoupon.discountValue) / 100;
  })();

  // Reward discount: 100 pts = ₹10
  const rewardDiscount = useRewards && rewardPoints
    ? Math.floor(rewardPointsToRedeem / 100) * 10
    : 0;

  const afterDiscount = Math.max(0, itemsTotal - couponDiscount - rewardDiscount);
  const deliveryCharge = afterDiscount < 500 ? 40 : 0;
  const protectFee = protectPromise ? 29 : 0;
  const subtotalBeforeWallet = afterDiscount + deliveryCharge + protectFee;

  // Wallet deduction
  const walletBalance = wallet ? parseFloat(wallet.balance) : 0;
  const walletDeduction = useWallet ? Math.min(walletBalance, subtotalBeforeWallet) : 0;
  const finalAmount = Math.max(0, subtotalBeforeWallet - walletDeduction);

  useEffect(() => {
    getWalletBalance().then(r => setWallet(r.data)).catch(() => {});
    getRewardBalance().then(r => setRewardPoints(r.data)).catch(() => {});
    getActiveCoupons().then(r => setAvailableCoupons(r.data.data)).catch(() => {});
  }, []);

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon(code, itemsTotal);
      if (res.data.data.valid) {
        setAppliedCoupon({
          ...res.data.data.coupon,
          calculatedDiscount: res.data.data.discount
        });
        setCouponCode(res.data.data.coupon.code);
        toast.success(`Coupon "${res.data.data.coupon.code}" applied! 🎉`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired coupon code');
      setAppliedCoupon(null);
      setCouponCode('');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) { toast.error('Please enter shipping address'); return; }
    if (items.length === 0) { toast.error('Cart is empty'); return; }

    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.product.productId,
        quantity: item.quantity,
      }));

      const orderPayload = {
        shippingAddress,
        paymentMethod,
        items: orderItems,
        couponCode: appliedCoupon?.code || null,
        useWallet,
        useRewardPoints: useRewards,
        rewardPointsToRedeem: useRewards ? rewardPointsToRedeem : 0,
        protectPromise,
      };

      const orderRes = await api.post('/customer/orders', orderPayload);
      const orderData = orderRes.data.data;
      const orderId = orderData.orderId;

      if (orderData.finalAmount <= 0) {
        toast.success('Order placed successfully! 🎉');
        await fetchCart();
        navigate('/orders');
        return;
      }

      if (paymentMethod === 'COD') {
        await api.post(`/customer/payment/cod/${orderId}`);
        toast.success('Order placed successfully! 🎉');
        await fetchCart();
        navigate('/orders');
      } else {
        const paymentRes = await api.post(`/customer/payment/stripe/create-intent/${orderId}`);
        setStripeData({
          clientSecret: paymentRes.data.data.clientSecret,
          orderId,
          finalAmount: orderData.finalAmount
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = async (paymentIntentId) => {
    try {
      await api.post(`/customer/payment/stripe/confirm/${stripeData.orderId}`, { paymentIntentId });
      toast.success('Payment confirmed! 🎉');
      await fetchCart();
      navigate('/orders');
    } catch {
      toast.error('Confirmation failed. Please contact support.');
    } finally {
      setStripeData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="pt-24 max-w-5xl mx-auto px-6 pb-20">
        <h1 className="page-header mb-8">🔐 Secure Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-3 space-y-5">

            {/* Shipping */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">📦 Shipping Details</h2>
              <label className="form-label">Delivery Address *</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Enter your full delivery address..."
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
              />
            </div>

            {/* Coupon */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">🎟️ Apply Coupon</h2>
              
              {appliedCoupon ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-green-800 dark:text-green-300 font-bold flex items-center gap-2">
                       ✅ {appliedCoupon.code} Applied
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                      You saved {INR(appliedCoupon.calculatedDiscount)}
                    </p>
                  </div>
                  <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-sm font-semibold px-2 py-1">
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-3 mb-4">
                    <input
                      className="input-field flex-1"
                      placeholder="Enter coupon code..."
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      disabled={couponLoading || !couponCode.trim()}
                      className="btn-primary px-5 py-2"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>

                  {availableCoupons.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Available Coupons</p>
                      <div className="space-y-2">
                        {availableCoupons.map(c => (
                          <div key={c.couponId} className="flex justify-between items-center p-3 rounded-lg border border-dashed border-primary-300 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                            <div>
                              <p className="font-bold text-primary-700 dark:text-primary-400 text-sm">{c.code}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {c.description || (c.discountType === 'FLAT' ? `${INR(c.discountValue)} off` : `${c.discountValue}% off`)}
                              </p>
                              {c.minimumOrderAmount && (
                                <p className="text-[10px] text-gray-500 mt-0.5">Min. order: {INR(c.minimumOrderAmount)}</p>
                              )}
                              {c.expiryDate && (
                                <p className="text-[10px] text-red-500 mt-0.5">Expires: {new Date(c.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleApplyCoupon(c.code)}
                              disabled={couponLoading || itemsTotal < (c.minimumOrderAmount || 0)}
                              className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${
                                itemsTotal < (c.minimumOrderAmount || 0)
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/50'
                              }`}
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Wallet */}
            {wallet && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">👛 Wallet</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available Balance</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{INR(wallet.balance)}</p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Use Wallet</span>
                    <div
                      onClick={() => setUseWallet(!useWallet)}
                      className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${useWallet ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${useWallet ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                </div>
                {useWallet && walletDeduction > 0 && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                    ✅ {INR(walletDeduction)} will be deducted from wallet
                  </p>
                )}
              </div>
            )}

            {/* Reward Points */}
            {rewardPoints && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">⭐ Reward Points</h2>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available Points</p>
                    <p className="text-2xl font-bold text-amber-500">{rewardPoints.pointsBalance} pts</p>
                    <p className="text-xs text-gray-400">100 points = ₹10 off</p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Use Points</span>
                    <div
                      onClick={() => setUseRewards(!useRewards)}
                      className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${useRewards ? 'bg-amber-500' : 'bg-gray-300 dark:bg-dark-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${useRewards ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                </div>
                {useRewards && rewardPoints.pointsBalance >= 100 && (
                  <div>
                    <label className="form-label">Points to redeem (multiples of 100)</label>
                    <input
                      type="number"
                      min={100}
                      max={rewardPoints.pointsBalance}
                      step={100}
                      value={rewardPointsToRedeem}
                      onChange={e => setRewardPointsToRedeem(Math.min(parseInt(e.target.value) || 100, rewardPoints.pointsBalance))}
                      className="input-field"
                    />
                    <p className="mt-1 text-sm text-amber-600 font-medium">You save: {INR(rewardDiscount)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Protect Promise */}
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white">🛡️ Protect Promise</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Get 100% refund if your item is lost, damaged, or not as described. Only ₹29 per order.
                  </p>
                </div>
                <div
                  onClick={() => setProtectPromise(!protectPromise)}
                  className={`w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${protectPromise ? 'bg-green-500' : 'bg-gray-300 dark:bg-dark-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${protectPromise ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">💳 Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'COD', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                  { value: 'STRIPE_TEST', label: 'Credit/Debit Card', icon: '💳', desc: 'Powered by Stripe (Test Mode)' },
                ].map(method => (
                  <label key={method.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === method.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-dark-600 hover:border-primary-300'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {items.map(item => (
                  <div key={item.cartItemId} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300 truncate flex-1 mr-2">
                      ×{item.quantity} {item.product?.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white flex-shrink-0">
                      {INR((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-200 dark:border-dark-600 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items Total</span>
                  <span className="text-gray-800 dark:text-gray-200">{INR(itemsTotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Coupon Discount</span>
                    <span className="text-green-600">−{INR(couponDiscount)}</span>
                  </div>
                )}
                {rewardDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-600">Reward Points</span>
                    <span className="text-amber-600">−{INR(rewardDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : 'text-gray-800 dark:text-gray-200'}>
                    {deliveryCharge === 0 ? 'FREE' : INR(deliveryCharge)}
                  </span>
                </div>
                {protectFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">🛡️ Protect Promise</span>
                    <span className="text-gray-800 dark:text-gray-200">{INR(protectFee)}</span>
                  </div>
                )}
                {walletDeduction > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">👛 Wallet</span>
                    <span className="text-blue-600">−{INR(walletDeduction)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-dark-600 mt-3 pt-3 flex justify-between items-center mb-5">
                <span className="font-bold text-gray-900 dark:text-white">Amount to Pay</span>
                <span className="font-black text-xl text-primary-600 dark:text-primary-400">{INR(finalAmount)}</span>
              </div>

              {afterDiscount >= 500 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-4 text-sm text-green-700 dark:text-green-400 text-center">
                  🎉 You qualify for <strong>FREE delivery</strong>!
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="btn-primary w-full justify-center py-4 text-base"
              >
                {loading ? '⏳ Processing...' : `🎉 Place Order — ${INR(finalAmount)}`}
              </button>

              <div className="flex justify-center gap-4 mt-4">
                <span className="text-xs text-gray-400">🔒 SSL Secured</span>
                <span className="text-xs text-gray-400">💳 Stripe Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stripeData && (
        <Elements stripe={stripePromise}>
          <StripeOrderForm
            clientSecret={stripeData.clientSecret}
            amount={stripeData.finalAmount}
            onSuccess={handleStripeSuccess}
            onCancel={() => setStripeData(null)}
          />
        </Elements>
      )}
    </div>
  );
}
