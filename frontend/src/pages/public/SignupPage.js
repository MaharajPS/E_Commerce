import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.data);
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-16">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center p-6 pt-20">
        <div className="w-full max-w-lg">
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-1">Create Account</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Join MartX as a Customer today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="input-field" placeholder="John Doe"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input type="tel" className="input-field" placeholder="+1234567890"
                    value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="form-label">Email Address *</label>
                <input type="email" className="input-field" placeholder="your@email.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>

              <div>
                <label className="form-label">Password *</label>
                <input type="password" className="input-field" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </div>

              <div>
                <label className="form-label">Delivery Address</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Your shipping address..."
                  value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2">
                {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
            </p>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Want to sell? <Link to="/become-seller" className="font-semibold underline">Apply as a Seller →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
