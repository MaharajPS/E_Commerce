import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { getWalletBalance, getWalletHistory, createWalletStripeIntent, confirmWalletStripePayment } from '../../services/walletService';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51SqtFuH3E32cbsgKdclDZ7UwUCHTD6uq6smZ2Nnb0iJj8xsycmP1eeTQntPR1lvWCuI7FlwLWSS8i62KUbwfZobH00n0IdW9vu');

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

function StripeForm({ amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // 1. Create Payment Intent
      const { data } = await createWalletStripeIntent(amount);
      const clientSecret = data.clientSecret;

      // 2. Confirm Payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // 3. Confirm on Backend
        await confirmWalletStripePayment(result.paymentIntent.id);
        toast.success(`Successfully added ${INR(amount)} to wallet! 🎉`);
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800">
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
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1 justify-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="btn-primary flex-1 justify-center"
        >
          {loading ? 'Processing...' : `Pay ${INR(amount)}`}
        </button>
      </div>
    </form>
  );
}

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [addAmount, setAddAmount] = useState('');
  const [fetching, setFetching] = useState(true);
  const [showStripe, setShowStripe] = useState(false);

  const fetchData = async () => {
    try {
      const [balRes, histRes] = await Promise.all([getWalletBalance(), getWalletHistory()]);
      setWallet(balRes.data);
      setHistory(histRes.data);
    } catch { toast.error('Failed to load wallet') }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenStripe = () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) { toast.error('Enter valid amount'); return; }
    setShowStripe(true);
  };

  if (fetching) return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="flex items-center justify-center h-64 pt-24">
        <div className="loading-spinner" />
      </div>
    </div>
  );

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 font-sans">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-6 pb-20">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <span className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-2xl">👛</span> My Wallet
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Balance Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-violet-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative glass-card p-10 text-center overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <div className="w-24 h-24 bg-primary-500 rounded-full blur-3xl"></div>
              </div>
              <p className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-4">Available Balance</p>
              <p className="text-6xl font-black text-gray-900 dark:text-white mb-2">
                {INR(wallet?.balance)}
              </p>
              <p className="text-xs text-gray-400 font-medium">Safe & Secure Transactions</p>
            </div>
          </div>

          {/* Add Money */}
          <div className="glass-card p-8 h-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recharge Wallet</h2>
            {!showStripe ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {quickAmounts.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setAddAmount(String(amt))}
                      className={`p-3 rounded-2xl text-sm font-bold border-2 transition-all duration-300 ${
                        addAmount === String(amt)
                          ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-500/30 translate-y-[-2px]'
                          : 'border-gray-100 dark:border-dark-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                      }`}
                    >
                      +{INR(amt)}
                    </button>
                  ))}
                </div>
                <div className="relative mb-6">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-primary-500 outline-none font-bold text-lg transition-all"
                    placeholder="Enter Custom Amount"
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleOpenStripe}
                  className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-lg hover:scale-[1.02] active:scale-[0.98] blur-none transition-all shadow-xl dark:shadow-white/10"
                >
                  Proceed to Pay
                </button>
              </>
            ) : (
              <Elements stripe={stripePromise}>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-4 flex justify-between items-center">
                    <p className="font-bold text-gray-900 dark:text-white">Secure Stripe Payment</p>
                    <p className="text-primary-600 font-black">{INR(parseFloat(addAmount))}</p>
                  </div>
                  <StripeForm
                    amount={parseFloat(addAmount)}
                    onSuccess={() => {
                      setShowStripe(false);
                      setAddAmount('');
                      fetchData();
                    }}
                    onCancel={() => setShowStripe(false)}
                  />
                </div>
              </Elements>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            <div className="px-4 py-1.5 bg-gray-100 dark:bg-dark-700 rounded-full text-xs font-bold text-gray-500 tracking-wider">LATEST FIRST</div>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-20 opacity-40">
              <div className="text-6xl mb-4">📜</div>
              <p className="font-bold">Your transaction history is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(tx => (
                <div key={tx.transactionId} className="flex items-center justify-between p-5 bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 rounded-3xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                      tx.transactionType === 'CREDIT'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {tx.transactionType === 'CREDIT' ? '🏦' : '🛍️'}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-white text-base">
                        {tx.referenceType === 'DEPOSIT' ? 'Wallet Recharge' : tx.referenceType === 'ORDER' ? 'Order Payment' : tx.transactionType}
                      </p>
                      <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-1">
                         🕒 {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-black ${
                      tx.transactionType === 'CREDIT' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {tx.transactionType === 'CREDIT' ? '+' : '−'}{INR(tx.amount)}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-gray-300 mt-1">SUCCESSFUL</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
