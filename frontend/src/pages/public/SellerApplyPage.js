import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SellerApplyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    businessName: '', businessAddress: '', documentsUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/seller-applications/apply', form);
      setSubmitted(true);
      toast.success('Application submitted! We\'ll review it soon. 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass-card p-12 text-center max-w-lg">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-4">Application Submitted!</h2>
            <p className="text-gray-500 mb-8">Our team will review your application and get back to you via email within 2-3 business days.</p>
            <button onClick={() => navigate('/')} className="btn-primary">← Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-6 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">💼</div>
          <h1 className="font-display font-black text-4xl text-gray-900 dark:text-white mb-3">
            Become a Seller on MartX
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Join 2,500+ successful sellers and start growing your business today.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: '🌍', title: 'Global Reach', desc: 'Sell to customers worldwide' },
            { icon: '📊', title: 'Analytics', desc: 'Detailed sales insights' },
            { icon: '💳', title: 'Secure Payments', desc: 'Fast payouts via Stripe' },
          ].map((b, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <div className="text-3xl mb-2">{b.icon}</div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{b.title}</p>
              <p className="text-gray-500 text-xs">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6">Application Form</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input type="text" className="input-field" placeholder="John Doe"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" className="input-field" placeholder="business@email.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Phone</label>
                <input type="tel" className="input-field" placeholder="+1234567890"
                  value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Business Name *</label>
                <input type="text" className="input-field" placeholder="Your Store Name"
                  value={form.businessName} onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="form-label">Business Address</label>
              <textarea className="input-field resize-none" rows={2} placeholder="Full business address..."
                value={form.businessAddress} onChange={e => setForm(p => ({ ...p, businessAddress: e.target.value }))} />
            </div>

            <div>
              <label className="form-label">Documents URL (Optional)</label>
              <input type="url" className="input-field" placeholder="https://drive.google.com/..."
                value={form.documentsUrl} onChange={e => setForm(p => ({ ...p, documentsUrl: e.target.value }))} />
              <p className="text-xs text-gray-400 mt-1">Link to business registration docs (Google Drive, Dropbox, etc.)</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base">
              {loading ? '⏳ Submitting...' : '🚀 Submit Application'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
