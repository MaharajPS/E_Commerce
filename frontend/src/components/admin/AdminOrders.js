import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getAllOrders().then(data => { setOrders(Array.isArray(data) ? data : data.content || []); setLoading(false); });
  }, []);

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/orders/${id}/${action}`); // Note: You need to import api or use orderService with specific method
      window.location.reload();
    } catch (err) { alert('Failed to update'); }
  };

  // Simplified for copy-paste: using direct API call via orderService extension or re-import
  // For this snippet, assuming user adds specific methods to orderService or uses api directly

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Admin Order Management</h2>
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr><th className="table-cell">ID</th><th className="table-cell">Customer</th><th className="table-cell">Status</th><th className="table-cell">Actions</th></tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t">
                <td className="table-cell">#{order.id}</td>
                <td className="table-cell">{order.customerName}</td>
                <td className="table-cell"><span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    {order.status === 'CREATED' && <button onClick={() => updateStatus(order.id, 'confirm')} className="btn-success text-sm">Confirm</button>}
                    {order.status === 'CONFIRMED' && <button onClick={() => updateStatus(order.id, 'ship')} className="btn-primary text-sm">Ship</button>}
                    {order.status === 'SHIPPED' && <button onClick={() => updateStatus(order.id, 'deliver')} className="btn-success text-sm">Deliver</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;