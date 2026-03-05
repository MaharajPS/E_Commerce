import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import ProductForm from '../products/ProductForm';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => productService.getAllProducts().then(data => setProducts(Array.isArray(data) ? data : data.content || []));
  useEffect(() => { load(); }, []);

  const handleDelete = (id) => { if(window.confirm('Delete?')) { productService.deleteProduct(id).then(load); } };
  const handleStatus = (id, status) => { productService.updateProductStatus(id, status).then(load); };

  if (showForm) return <ProductForm product={editing} onSuccess={() => { setShowForm(false); setEditing(null); load(); }} onCancel={() => setShowForm(false)} />;

  return (
    <div className="card">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">Add Product</button>
      </div>
      <table className="table">
        <thead className="table-header"><tr><th className="table-cell">Name</th><th className="table-cell">Price</th><th className="table-cell">Stock</th><th className="table-cell">Status</th><th className="table-cell">Actions</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="border-t">
              <td className="table-cell">{p.name}</td><td className="table-cell">${p.price}</td><td className="table-cell">{p.availableQuantity}</td>
              <td className="table-cell"><span className={`status-badge ${p.status === 'ACTIVE' ? 'status-delivered' : 'status-cancelled'}`}>{p.status}</span></td>
              <td className="table-cell">
                <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-blue-600 mr-2">Edit</button>
                <button onClick={() => handleStatus(p.id, p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')} className="text-yellow-600 mr-2">{p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => handleDelete(p.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;