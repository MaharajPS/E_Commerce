import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/applications', label: 'Applications', icon: '📋' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
];

const statusColors = {
  PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger',
};

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [filter, setFilter] = useState('ALL');

  const fetchData = () => {
    api.get('/admin/applications')
      .then(res => setApplications(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/applications/${id}/approve`, { remarks });
      toast.success('Application approved! Seller account created.');
      fetchData();
      setSelectedApp(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!remarks.trim()) { toast.error('Please add a rejection reason'); return; }
    try {
      await api.post(`/admin/applications/${id}/reject`, { remarks });
      toast.success('Application rejected.');
      fetchData();
      setSelectedApp(null);
    } catch {
      toast.error('Failed to reject');
    }
  };

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <DashboardLayout title="Seller Applications" navItems={navItems}>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === tab ? 'bg-primary-500 text-white' : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'}`}>
            {tab} {tab === 'PENDING' && `(${applications.filter(a => a.status === 'PENDING').length})`}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <tr>
                {['Applicant', 'Business', 'Email', 'Applied', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {filtered.map(app => (
                <tr key={app.applicationId} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{app.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{app.businessName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{app.email}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(app.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[app.status] || 'badge-info'}`}>{app.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelectedApp(app); setRemarks(''); }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-200 transition-colors">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">No applications found.</div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg p-8 animate-slide-up">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Review Application</h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* App Details */}
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4 space-y-3 mb-6 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-400 mb-0.5">Name</p><p className="font-semibold text-gray-900 dark:text-white">{selectedApp.name}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Business</p><p className="font-semibold text-gray-900 dark:text-white">{selectedApp.businessName}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Email</p><p className="text-gray-700 dark:text-gray-300">{selectedApp.email}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Phone</p><p className="text-gray-700 dark:text-gray-300">{selectedApp.phone || 'N/A'}</p></div>
              </div>
              {selectedApp.businessAddress && (
                <div><p className="text-xs text-gray-400 mb-0.5">Address</p><p className="text-gray-700 dark:text-gray-300">{selectedApp.businessAddress}</p></div>
              )}
              {selectedApp.documentsUrl && (
                <div><p className="text-xs text-gray-400 mb-0.5">Documents</p>
                  <a href={selectedApp.documentsUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 underline text-xs">View Documents</a></div>
              )}
              <div><p className="text-xs text-gray-400 mb-0.5">Status</p>
                <span className={`badge ${statusColors[selectedApp.status]}`}>{selectedApp.status}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="form-label">Remarks / Notes</label>
              <textarea className="input-field resize-none" rows={3}
                placeholder="Add notes for the seller..."
                value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>

            {selectedApp.status === 'PENDING' && (
              <div className="flex gap-3">
                <button onClick={() => handleReject(selectedApp.applicationId)} className="btn-danger flex-1 justify-center">
                  ✗ Reject
                </button>
                <button onClick={() => handleApprove(selectedApp.applicationId)} className="btn-success flex-1 justify-center">
                  ✓ Approve & Create Seller
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
