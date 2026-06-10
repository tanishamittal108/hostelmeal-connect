import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { initSocket } from './services/socket';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import StudentLayout from './components/layouts/StudentLayout';
import ProviderLayout from './components/layouts/ProviderLayout';
import DeliveryLayout from './components/layouts/DeliveryLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ProvidersPage from './pages/public/ProvidersPage';
import ProviderDetailPage from './pages/public/ProviderDetailPage';
import PricingPage from './pages/public/PricingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import VotingPage from './pages/student/VotingPage';
import OrdersPage from './pages/student/OrdersPage';
import OrderDetailPage from './pages/student/OrderDetailPage';
import TrackOrderPage from './pages/student/TrackOrderPage';
import SubscriptionPage from './pages/student/SubscriptionPage';
import WalletPage from './pages/student/WalletPage';
import ProfilePage from './pages/student/ProfilePage';
import NotificationsPage from './pages/student/NotificationsPage';
import ChatPage from './pages/student/ChatPage';
import CheckoutPage from './pages/student/CheckoutPage';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard';
import MenuManagePage from './pages/provider/MenuManage';
import ProviderOrdersPage from './pages/provider/Orders';
import ProviderEarningsPage from './pages/provider/Earnings';
import ProviderAnalyticsPage from './pages/provider/Analytics';
import ProviderProfilePage from './pages/provider/Profile';
import KitchenGalleryPage from './pages/provider/KitchenGallery';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/Dashboard';
import ActiveDeliveriesPage from './pages/delivery/ActiveDeliveries';
import DeliveryEarningsPage from './pages/delivery/Earnings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagementPage from './pages/admin/UserManagement';
import ProviderVerificationPage from './pages/admin/ProviderVerification';
import AdminAnalyticsPage from './pages/admin/Analytics';
import CouponManagementPage from './pages/admin/Coupons';

// Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, token } = useSelector(state => state.auth);
  if (!token && !isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const dashboards = { student: '/student', provider: '/provider', delivery: '/delivery', admin: '/admin' };
    return <Navigate to={dashboards[user.role] || '/'} replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  if (isAuthenticated && user) {
    const dashboards = { student: '/student', provider: '/provider', delivery: '/delivery', admin: '/admin' };
    return <Navigate to={dashboards[user.role] || '/'} replace />;
  }
  return children;
};

export default function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);
  const { darkMode } = useSelector(state => state.ui);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      initSocket(token);
    }
  }, [token, user]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/providers/:id" element={<ProviderDetailPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="vote" element={<VotingPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="orders/:id/track" element={<TrackOrderPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Provider Routes */}
        <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderLayout /></ProtectedRoute>}>
          <Route index element={<ProviderDashboard />} />
          <Route path="menu" element={<MenuManagePage />} />
          <Route path="orders" element={<ProviderOrdersPage />} />
          <Route path="earnings" element={<ProviderEarningsPage />} />
          <Route path="analytics" element={<ProviderAnalyticsPage />} />
          <Route path="gallery" element={<KitchenGalleryPage />} />
          <Route path="profile" element={<ProviderProfilePage />} />
        </Route>

        {/* Delivery Routes */}
        <Route path="/delivery" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryLayout /></ProtectedRoute>}>
          <Route index element={<DeliveryDashboard />} />
          <Route path="active" element={<ActiveDeliveriesPage />} />
          <Route path="earnings" element={<DeliveryEarningsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="providers" element={<ProviderVerificationPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="coupons" element={<CouponManagementPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
