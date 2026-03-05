import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 mt-16">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-8 px-6">
                {/* <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-white text-2xl font-bold"></h2>
                        <p className="text-indigo-200 text-sm mt-1">Sign up for our newsletter and never miss a deal.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 md:w-64 px-4 py-2 rounded-l-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button className="bg-white text-indigo-600 font-semibold px-5 py-2 rounded-r-xl hover:bg-indigo-50 transition text-sm whitespace-nowrap">
                            Subscribe
                        </button>
                    </div>
                </div> */}
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {/* Brand */}
                <div>
                    <Link to="/" className="flex items-center gap-2 text-white text-2xl font-extrabold mb-4">
                        🛍️ ShopEase
                    </Link>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Your one-stop destination for all your shopping needs. Quality products, unbeatable prices, and fast delivery — right to your doorstep.
                    </p>
                    {/* Social Icons */}
                    <div className="flex gap-3 mt-5">
                        {[
                            { icon: '𝕏', label: 'Twitter', href: '#' },
                            { icon: 'f', label: 'Facebook', href: '#' },
                            { icon: '▶', label: 'YouTube', href: '#' },
                            { icon: '📸', label: 'Instagram', href: '#' },
                        ].map(s => (
                            <a
                                key={s.label}
                                href={s.href}
                                title={s.label}
                                className="w-9 h-9 rounded-full bg-gray-700 hover:bg-indigo-600 flex items-center justify-center text-sm transition-all duration-200 hover:scale-110"
                            >
                                {s.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        {[
                            { label: 'Home', to: '/' },
                            { label: 'Products', to: '/products' },
                            { label: 'My Orders', to: '/orders' },
                            { label: 'My Cart', to: '/cart' },
                            { label: 'Login', to: '/login' },
                            { label: 'Register', to: '/register' },
                        ].map(link => (
                            <li key={link.label}>
                                <Link
                                    to={link.to}
                                    className="text-gray-400 hover:text-indigo-400 text-sm transition-colors hover:translate-x-1 inline-block"
                                >
                                    → {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Customer Support */}
                <div>
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Customer Support</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        {[
                            'Help Center - contact: 7609807699',
                            'Returns & Refunds',
                            'Track Your Order',
                            'Shipping Policy',
                            'Privacy Policy',
                            'Terms & Conditions',
                            'FAQs',
                        ].map(item => (
                            <li key={item}>
                                <span className="hover:text-indigo-400 cursor-pointer transition-colors">→ {item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact Us</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">📍</span>
                            <span>ShopEase HQ, 42 Commerce Street, Tech Park, Chennai – 600001, India</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-indigo-400">📞</span>
                            <span>+91 99000 12345</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-indigo-400">✉️</span>
                            <span>support@shopease.in</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-indigo-400">🕐</span>
                            <span>24/7 services</span>
                        </li>
                    </ul>

                    {/* Payment Methods */}
                    <div className="mt-6">
                        <p className="text-white text-xs font-semibold uppercase tracking-wider mb-2">We Accept</p>
                        <div className="flex gap-2 flex-wrap">
                            {['cash on delivery'].map(pm => (
                                <span key={pm} className="bg-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-md">
                                    {pm}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-gray-800 py-6 px-6">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 text-center text-xs text-gray-500">
                    {[
                        { icon: '🔒', label: 'Secure Payments' },
                        { icon: '🚚', label: 'Free Delivery over ₹499' },
                        { icon: '↩️', label: '30-Day Easy Returns' },
                        { icon: '⭐', label: '4.8/5 Customer Rating' },
                        { icon: '🎧', label: '24/7 Support' },
                    ].map(badge => (
                        <div key={badge.label} className="flex items-center gap-1.5">
                            <span className="text-base">{badge.icon}</span>
                            <span>{badge.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 py-4 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                    <p>© {currentYear} <span className="text-indigo-400 font-semibold">ShopEase</span>. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <span className="text-red-500">❤️</span> in India
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
