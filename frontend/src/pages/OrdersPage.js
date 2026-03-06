import React from 'react';
import { useSearchParams } from 'react-router-dom';
import OrderList from '../components/orders/OrderList';

const OrdersPage = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Order placed successfully!
        </div>
      )}
      <OrderList />
    </div>
  );
};

export default OrdersPage;