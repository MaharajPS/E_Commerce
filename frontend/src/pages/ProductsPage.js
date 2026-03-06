import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';   // ✅ change 1
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useCart();

    const [searchParams] = useSearchParams();   // ✅ change 2
    const search = searchParams.get("search") || "";

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productService.getActiveProducts();
            setProducts(data);
        } catch (err) {
            setError('Failed to fetch products. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ change 3 (filter products)
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-12 text-center text-xl">Loading products...</div>;
    if (error) return <div className="p-12 text-center text-red-600">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                Our Products {search && `(Search: ${search})`}
            </h1>

            {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-600">No matching products found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                <p className="text-gray-600 mb-4 h-12 overflow-hidden">{product.description}</p>

                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                                    <span className={`px-2 py-1 rounded text-sm ${product.availableQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.availableQuantity > 0 ? `${product.availableQuantity} in stock` : 'Out of stock'}
                                    </span>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Link
                                        to={`/products/${product.id}`}
                                        className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded font-medium transition-colors"
                                    >
                                        Details
                                    </Link>
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.availableQuantity <= 0}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded font-medium transition-colors"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductsPage;