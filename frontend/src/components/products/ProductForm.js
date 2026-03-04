import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', description: '', price: '', availableQuantity: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) setFormData({ name: product.name, description: product.description, price: product.price, availableQuantity: product.availableQuantity });
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product?.id) await productService.updateProduct(product.id, formData);
      else await productService.createProduct(formData);
      onSuccess();
    } catch (err) { alert('Failed to save product'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">{product?.id ? 'Edit Product' : 'Add Product'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4"><label className="block text-gray-700 mb-2">Name</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
        <div className="mb-4"><label className="block text-gray-700 mb-2">Description</label><textarea className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className="block text-gray-700 mb-2">Price</label><input type="number" step="0.01" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required /></div>
          <div><label className="block text-gray-700 mb-2">Quantity</label><input type="number" className="input-field" value={formData.availableQuantity} onChange={e => setFormData({...formData, availableQuantity: e.target.value})} required /></div>
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="btn-primary">{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;