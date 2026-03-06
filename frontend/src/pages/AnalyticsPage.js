import React from 'react';
import Analytics from '../components/admin/Analytics';

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📊</span>
            <h1 className="text-3xl font-extrabold tracking-tight">Analytics Dashboard</h1>
          </div>
          <p className="text-indigo-200 text-sm ml-16">
            Real-time insights into sales, revenue, and customer activity
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Analytics />
      </div>
    </div>
  );
};

export default AnalyticsPage;