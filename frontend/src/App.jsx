import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, forceLogout } from './features/auth/authSlice';
import { fetchCart } from './features/cart/cartSlice';
import { Toaster } from 'react-hot-toast';

// Layout & Reusables
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import LoginRegister from './pages/LoginRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// User Private Pages
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import UserProfile from './pages/UserProfile';
import Orders from './pages/Orders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductManagement from './pages/admin/AdminProductManagement';
import AdminUserManagement from './pages/admin/AdminUserManagement';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Recover active session on page loads
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Listen to session expiry/unauthorized events from API interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(forceLogout());
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, [dispatch]);

  // Recover cart once user is fetched/logged in
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 dark:bg-slate-950 text-slate-100 transition-colors duration-300">
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: '12px',
            borderRadius: '12px',
          },
        }}
      />

      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* User Protected Views */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/orders" element={<Orders />} />
          </Route>

          {/* Admin Protected Views */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProductManagement />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
