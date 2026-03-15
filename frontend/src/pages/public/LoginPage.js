import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';

export default function LoginPage() {
  const { login, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const data = res.data.data;
      login(data);
      toast.success(`Welcome back, ${data.name}! 🎉`);
      // Role-based redirect
      const route = {
        ROLE_SUPER_ADMIN: '/superadmin',
        ROLE_ADMIN: '/admin',
        ROLE_SELLER: '/seller',
        ROLE_CUSTOMER: '/',
      }[data.role] || '/';
      navigate(route);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Super Admin', email: 'superadmin@marketplace.com', password: 'SuperAdmin@123', icon: '👑' },
    { role: 'Admin', email: 'admin@marketplace.com', password: 'Admin@123', icon: '🛡️' },
    { role: 'Seller', email: 'seller@marketplace.com', password: 'Seller@123', icon: '💼' },
    { role: 'Customer', email: 'customer@marketplace.com', password: 'Customer@123', icon: '🛍️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
      <Navbar />
      <div className="flex min-h-screen pt-16">
        {/* Left — Branding */}
        <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <span className="font-display font-black text-4xl text-white">M</span>
            </div>
            <h2 className="font-display font-black text-4xl text-white mb-4">
              Welcome back to <span className="text-primary-400">MartX</span>
            </h2>
            <p className="text-gray-300">Your one-stop premium marketplace. Login to manage your account.</p>
            <div className="mt-10 space-y-3">
              {['🛍️ Shop 10,000+ products', '💼 Manage your store', '📊 View analytics'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80 text-sm">
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="glass-card p-8">
              <div className="text-center mb-8">
                <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-1">Sign In</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Login with any role account</p>
              </div>

              {/* Demo accounts */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3 mb-6">
                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-2">🎯 Demo Account:</p>
                {demoAccounts.map((acc, i) => (
                  <button
                    key={i}
                    onClick={() => setForm({ email: acc.email, password: acc.password })}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {acc.icon} {acc.role}: <span className="text-primary-600 dark:text-primary-400">{acc.email}</span>
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input-field pr-12"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Signing in...
                    </span>
                  ) : '🔐 Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
