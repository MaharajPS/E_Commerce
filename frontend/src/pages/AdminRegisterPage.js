import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'ADMIN' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="card w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Admin Registration</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Name</label>
                        <input type="text" name="name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input type="email" name="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input type="password" name="password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field w-full p-2 border rounded" required />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        {loading ? "Registering..." : "Register Admin"}
                    </button>
                </form>
                <p className="mt-4 text-center"><Link to="/login" className="text-blue-600">Back to Login</Link></p>
            </div>
        </div>
    );
};

export default AdminRegisterPage;
