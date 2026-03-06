import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';

const OrderList = ({ adminView = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = adminView ? orderService.getAllOrders : orderService.getMyOrders;
    load().then(data => { setOrders(Array.isArray(data) ? data : data.content || []); setLoading(false); });
  }, [adminView]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">{adminView ? 'All Orders' : 'My Orders'}</h2>
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-cell">ID</th><th className="table-cell">Date</th><th className="table-cell">Total</th><th className="table-cell">Status</th><th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t">
                <td className="table-cell">#{order.id}</td>
                <td className="table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="table-cell">${order.totalAmount}</td>
                <td className="table-cell"><span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                <td className="table-cell">
                  {!adminView && order.status === 'CREATED' && (
                    <button onClick={() => orderService.cancelOrder(order.id).then(() => window.location.reload())} className="text-red-600">Cancel</button>
                  )}
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;