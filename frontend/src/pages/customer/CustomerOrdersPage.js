import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const statusMeta = {
  PENDING:               { color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20',  border: 'border-amber-400',  icon: '⏳', label: 'Pending' },
  CONFIRMED:             { color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-400',   icon: '✅', label: 'Confirmed' },
  SHIPPED:               { color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20',border: 'border-purple-400', icon: '🚚', label: 'Shipped' },
  DELIVERED:             { color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-900/20',border:'border-emerald-400',icon:'✅', label:'Delivered' },
  CANCELLED:             { color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-400',    icon: '❌', label: 'Cancelled' },
  RETURN_REQUESTED:      { color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20',border: 'border-orange-400', icon: '↩️', label: 'Return Requested' },
  RETURNED:              { color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-900/20',   border: 'border-teal-400',   icon: '🔄', label: 'Returned' },
  REPLACEMENT_REQUESTED: { color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20',border:'border-yellow-400', icon:'🔁', label:'Replacement Requested' },
  REPLACED:              { color: 'text-cyan-500',   bg: 'bg-cyan-50 dark:bg-cyan-900/20',   border: 'border-cyan-400',   icon: '🔁', label: 'Replaced' },
};

function OrderTimeline({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  const isSpecial = idx === -1; // cancelled / returned / etc.
  return (
    <div className="flex items-center gap-0 mt-4 mb-3">
      {STATUS_STEPS.map((step, i) => {
        const done   = !isSpecial && i <= idx;
        const active = !isSpecial && i === idx;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                done
                  ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white dark:bg-dark-700 border-gray-300 dark:border-dark-500 text-gray-400'
              } ${active ? 'ring-4 ring-primary-300 dark:ring-primary-700 scale-110' : ''}`}>
                {done ? '✓' : i + 1}
              </div>
              <p className={`text-[10px] mt-1 text-center font-medium ${done ? 'text-primary-500' : 'text-gray-400'}`}>
                {step === 'PENDING' ? 'Placed' : step === 'CONFIRMED' ? 'Confirmed' : step === 'SHIPPED' ? 'Shipped' : 'Delivered'}
              </p>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${done ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-600'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/customer/orders')
      .then(res => setOrders(res.data.data || []))
      .finally(() => setLoading(false));
  };

  const handleAction = async (orderId, action) => {
    try {
      await api.put(`/customer/orders/${orderId}/${action}`);
      toast.success(`Order ${action} successful! 🎉`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} order`);
    }
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p || 0);
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  const isWithin7Days = (dateStr) => {
    const diffMs = Math.abs(new Date() - new Date(dateStr));
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) <= 7;
  };

  const statusKeys = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
  const filtered = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="pt-24 max-w-5xl mx-auto px-4 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">📦 My Orders</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{orders.length} total orders</p>
          </div>
          <a href="/products" className="btn-primary text-sm">🛍️ Shop More</a>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {statusKeys.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === s
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 border border-gray-200 dark:border-dark-600'
              }`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="shimmer h-32 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="font-display font-semibold text-xl text-gray-700 dark:text-gray-300 mb-4">
              No orders {filterStatus !== 'ALL' ? `with status "${filterStatus}"` : 'yet'}
            </h3>
            <a href="/products" className="btn-primary">Start Shopping →</a>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const meta = statusMeta[order.status] || statusMeta.PENDING;
              const isExpanded = expandedId === order.orderId;
              return (
                <div key={order.orderId}
                  className={`glass-card overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-xl' : ''}`}>
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.orderId)}
                    className="w-full p-5 text-left hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center text-xl`}>
                          {meta.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Order #{order.orderId}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)} · {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary-600 dark:text-primary-400">
                            {formatPrice(order.finalAmount || order.totalAmount)}
                          </p>
                          <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                        </div>
                        <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Quick Timeline */}
                    {!['CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REPLACEMENT_REQUESTED', 'REPLACED'].includes(order.status) && (
                      <OrderTimeline status={order.status} />
                    )}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-dark-600 p-5">
                      {/* Items */}
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3">Items Ordered</h4>
                      <div className="space-y-3 mb-5">
                        {order.items?.map(item => (
                          <div key={item.orderItemId}
                            className="flex items-center gap-3 bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
                            <div className="w-14 h-14 bg-gray-200 dark:bg-dark-600 rounded-xl overflow-hidden flex-shrink-0">
                              {item.productImage && (
                                <img src={item.productImage} alt={item.productName}
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.src = 'https://via.placeholder.com/60'; }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.productName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-900 dark:text-white">{formatPrice(item.subtotal)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Order Details */}
                      <div className="grid sm:grid-cols-2 gap-4 mb-5">
                        <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Shipping To</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{order.shippingAddress || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Order Summary</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                              <span>Subtotal</span>
                              <span>{formatPrice(order.totalAmount)}</span>
                            </div>
                            {order.deliveryCharge > 0 && (
                              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Delivery</span>
                                <span>{formatPrice(order.deliveryCharge)}</span>
                              </div>
                            )}
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                <span>Discount</span>
                                <span>-{formatPrice(order.discountAmount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-dark-500 pt-1 mt-1">
                              <span>Total</span>
                              <span>{formatPrice(order.finalAmount || order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment & Rewards Info */}
                      {(order.paymentMethod || order.rewardPointsEarned) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {order.paymentMethod && (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                              💳 {order.paymentMethod}
                            </span>
                          )}
                          {order.rewardPointsEarned > 0 && (
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                              ⭐ +{order.rewardPointsEarned} reward points earned
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-dark-600">
                        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleAction(order.orderId, 'cancel')}
                            className="px-4 py-2 rounded-xl text-xs font-semibold border-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                            ❌ Cancel Order
                          </button>
                        )}
                        {order.status === 'DELIVERED' && isWithin7Days(order.createdAt) && (
                          <>
                            <button
                              onClick={() => handleAction(order.orderId, 'return')}
                              className="px-4 py-2 rounded-xl text-xs font-semibold border-2 border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white transition-all">
                              ↩️ Return Order
                            </button>
                            <button
                              onClick={() => handleAction(order.orderId, 'replace')}
                              className="px-4 py-2 rounded-xl text-xs font-semibold border-2 border-blue-400 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                              🔄 Replace Order
                            </button>
                          </>
                        )}
                        <a href={`/products/${order.items?.[0]?.productId}`}
                          className="px-4 py-2 rounded-xl text-xs font-semibold border-2 border-gray-200 dark:border-dark-500 text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-all">
                          🛍️ Buy Again
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
