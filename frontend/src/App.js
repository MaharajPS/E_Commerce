import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import LoginPage from './pages/public/LoginPage';
import SignupPage from './pages/public/SignupPage';
import SellerApplyPage from './pages/public/SellerApplyPage';

// Customer Pages
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import ProfilePage from './pages/customer/ProfilePage';
import WishlistPage from './pages/customer/WishlistPage';
import WalletPage from './pages/customer/WalletPage';
import RewardsPage from './pages/customer/RewardsPage';

// Seller Dashboard Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerAnalytics from './pages/seller/SellerAnalytics';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminUsers from './pages/superadmin/SuperAdminUsers';
import SuperAdminSellers from './pages/superadmin/SuperAdminSellers';
import SuperAdminAdmins from './pages/superadmin/SuperAdminAdmins';
import SuperAdminCoupons from './pages/superadmin/SuperAdminCoupons';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/become-seller" element={<SellerApplyPage />} />

              {/* Customer Routes */}
              <Route path="/cart" element={
                <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                  <CustomerOrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                  <WishlistPage />
                </ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                  <WalletPage />
                </ProtectedRoute>
              } />
              <Route path="/rewards" element={
                <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                  <RewardsPage />
                </ProtectedRoute>
              } />

              {/* Seller Routes */}
              <Route path="/seller" element={
                <ProtectedRoute allowedRoles={['ROLE_SELLER']}>
                  <SellerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/seller/products" element={
                <ProtectedRoute allowedRoles={['ROLE_SELLER']}>
                  <SellerProducts />
                </ProtectedRoute>
              } />
              <Route path="/seller/orders" element={
                <ProtectedRoute allowedRoles={['ROLE_SELLER']}>
                  <SellerOrders />
                </ProtectedRoute>
              } />
              <Route path="/seller/analytics" element={
                <ProtectedRoute allowedRoles={['ROLE_SELLER']}>
                  <SellerAnalytics />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/applications" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminApplications />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminProducts />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminOrders />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              } />

              {/* Super Admin Routes */}
              <Route path="/superadmin" element={
                <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/superadmin/users" element={
                <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <SuperAdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/superadmin/sellers" element={
                <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <SuperAdminSellers />
                </ProtectedRoute>
              } />
              <Route path="/superadmin/admins" element={
                <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <SuperAdminAdmins />
                </ProtectedRoute>
              } />
              <Route path="/superadmin/coupons" element={
                <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <SuperAdminCoupons />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;