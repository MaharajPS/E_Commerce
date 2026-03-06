import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            const data = await productService.getProductById(id);
            setProduct(data);
        } catch (err) {
            setError('Product not found or failed to load.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            navigate('/cart');
        }
    };

    if (loading) return <div className="p-12 text-center text-xl">Loading product details...</div>;
    if (error || !product) return <div className="p-12 text-center text-red-600">{error || 'Product not found'}</div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <button
                onClick={() => navigate('/products')}
                className="mb-8 text-blue-600 hover:text-blue-800 font-medium"
            >
                &larr; Back to Products
            </button>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto flex flex-col md:flex-row">
                {/* Placeholder for Product Image - Since we don't have an image field in the DB yet, we'll use a stylized placeholder */}
                <div className="md:w-1/2 bg-gray-200 min-h-64 flex items-center justify-center p-8">
                    <span className="text-gray-400 text-6xl">🛍️</span>
                </div>

                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.status}
                        </span>
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">{product.description}</p>

                    <div className="flex items-center mb-6">
                        <span className="text-4xl font-extrabold text-blue-600 mr-4">${product.price.toFixed(2)}</span>
                        <span className={`text-sm ${product.availableQuantity > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}`}>
                            {product.availableQuantity} available in stock
                        </span>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center mb-6">
                            <label htmlFor="quantity" className="mr-4 text-gray-700 font-medium">Quantity:</label>
                            <select
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={product.availableQuantity === 0}
                            >
                                {[...Array(Math.min(10, product.availableQuantity || 1)).keys()].map(n => (
                                    <option key={n + 1} value={n + 1}>{n + 1}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.availableQuantity <= 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-lg shadow-md hover:shadow-lg"
                        >
                            {product.availableQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
