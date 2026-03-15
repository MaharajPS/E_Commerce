import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { getRewardBalance, getRewardHistory } from '../../services/rewardService';
import toast from 'react-hot-toast';

export default function RewardsPage() {
  const [rewards, setRewards] = useState(null);
  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([getRewardBalance(), getRewardHistory()])
      .then(([balRes, histRes]) => {
        setRewards(balRes.data);
        setHistory(histRes.data);
      })
      .catch(() => toast.error('Failed to load rewards'))
      .finally(() => setFetching(false));
  }, []);

  if (fetching) return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="flex items-center justify-center h-64 pt-24"><div className="loading-spinner" /></div>
    </div>
  );

  const tiers = [
    { name: 'Bronze', min: 0, max: 499, icon: '🥉', color: 'from-amber-700 to-amber-600' },
    { name: 'Silver', min: 500, max: 1999, icon: '🥈', color: 'from-gray-400 to-gray-500' },
    { name: 'Gold', min: 2000, max: 4999, icon: '🥇', color: 'from-yellow-400 to-amber-500' },
    { name: 'Platinum', min: 5000, max: Infinity, icon: '💎', color: 'from-violet-500 to-purple-600' },
  ];

  const current = rewards?.pointsBalance || 0;
  const currentTier = tiers.find(t => current >= t.min && current <= t.max) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier ? ((current - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-6 pb-20">
        <h1 className="page-header mb-8">⭐ Reward Points</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Points Balance */}
          <div className={`glass-card p-8 text-center bg-gradient-to-br ${currentTier.color} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            <div className="relative">
              <div className="text-5xl mb-2">{currentTier.icon}</div>
              <p className="text-white/80 text-sm mb-1">{currentTier.name} Member</p>
              <p className="text-5xl font-black mb-1">{current}</p>
              <p className="text-white/80 text-sm">Reward Points</p>
              <p className="text-white/70 text-xs mt-2">100 pts = ₹10 off at checkout</p>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">Loyalty Tier</h2>
            {nextTier ? (
              <>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{currentTier.name}</span>
                  <span>{nextTier.name}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${currentTier.color} transition-all`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {nextTier.min - current} more points to reach <strong>{nextTier.name}</strong>
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">💎</div>
                <p className="font-bold text-gray-900 dark:text-white">You're at the highest tier!</p>
              </div>
            )}
            <div className="mt-4 space-y-2">
              {tiers.map(t => (
                <div key={t.name} className={`flex items-center gap-3 p-2 rounded-lg ${t.name === currentTier.name ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                  <span>{t.icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.name}</span>
                  <span className="text-xs text-gray-400">{t.max === Infinity ? `${t.min}+` : `${t.min}–${t.max}`} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How to earn */}
        <div className="glass-card p-6 mb-8">
          <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">How to Earn Points</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '🛒', text: 'Every purchase earns points', sub: '1% of order value' },
              { icon: '⭐', text: 'Write a review', sub: '+10 bonus points' },
              { icon: '👥', text: 'Refer a friend', sub: '+50 bonus points' },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.text}</p>
                <p className="text-xs text-primary-500 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-5">Points History</h2>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      tx.transactionType === 'EARN'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {tx.transactionType === 'EARN' ? '⬆️' : '⬇️'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm capitalize">
                        {tx.transactionType === 'EARN' ? 'Points Earned' : 'Points Redeemed'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-base ${tx.transactionType === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.transactionType === 'EARN' ? '+' : '−'}{tx.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
