import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Vote, ShoppingBag, CreditCard, Bell,
  MessageCircle, User, ChefHat, BarChart2, Truck, DollarSign,
  Users, Shield, Tag, Menu, X, LogOut, Sun, Moon, Home
} from 'lucide-react';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import Navbar from '../common/Navbar';

// ─── Shared Sidebar Component ─────────────────────────────────────────────────
const Sidebar = ({ links, title, icon: Icon }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { darkMode } = useSelector(s => s.ui);
  const { unreadCount } = useSelector(s => s.notifications);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-primary-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white text-lg">🍛</span>
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-base text-gray-900 dark:text-white">
            Hostel<span className="text-primary-500">Meal</span>
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
          <Menu size={16} />
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} className="w-full h-full rounded-xl object-cover" alt="" />
              ) : (
                <span className="text-white font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map(({ path, label, icon: LinkIcon, badge }) => (
          <NavLink
            key={path}
            to={path}
            end={path.split('/').length <= 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-primary-50 to-orange-50 dark:from-primary-900/20 dark:to-orange-900/20 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <LinkIcon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
            {badge && !collapsed && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <button onClick={() => dispatch(toggleDarkMode())} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={() => { dispatch(logoutUser()); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

// ─── Mobile Bottom Nav ─────────────────────────────────────────────────────────
const MobileNav = ({ links }) => (
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-2 py-2 safe-area-pb">
    <div className="flex items-center justify-around">
      {links.slice(0, 5).map(({ path, icon: Icon, label }) => (
        <NavLink key={path} to={path} end={path.split('/').length <= 2}
          className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <Icon size={20} />
          <span className="text-xs font-medium">{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

// ─── Student Layout ─────────────────────────────────────────────────────────────
const studentLinks = [
  { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/vote', label: 'Vote Today', icon: Vote },
  { path: '/student/orders', label: 'My Orders', icon: ShoppingBag },
  { path: '/student/subscription', label: 'Subscription', icon: CreditCard },
  { path: '/student/wallet', label: 'Wallet', icon: DollarSign },
  { path: '/student/chat', label: 'Chat', icon: MessageCircle },
  { path: '/student/notifications', label: 'Notifications', icon: Bell },
  { path: '/student/profile', label: 'Profile', icon: User },
];

export const StudentLayout = () => (
  <div className="flex min-h-screen bg-gray-50 dark:bg-dark-200">
    <Sidebar links={studentLinks} title="Student" />
    <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </div>
    </main>
    <MobileNav links={studentLinks} />
  </div>
);

// ─── Provider Layout ────────────────────────────────────────────────────────────
const providerLinks = [
  { path: '/provider', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/provider/menu', label: 'Menu Manager', icon: ChefHat },
  { path: '/provider/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/provider/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/provider/earnings', label: 'Earnings', icon: DollarSign },
  { path: '/provider/gallery', label: 'Kitchen Gallery', icon: Home },
  { path: '/provider/profile', label: 'Profile', icon: User },
];

export const ProviderLayout = () => (
  <div className="flex min-h-screen bg-gray-50 dark:bg-dark-200">
    <Sidebar links={providerLinks} title="Provider" />
    <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </div>
    </main>
    <MobileNav links={providerLinks} />
  </div>
);

// ─── Delivery Layout ────────────────────────────────────────────────────────────
const deliveryLinks = [
  { path: '/delivery', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/delivery/active', label: 'Active Deliveries', icon: Truck },
  { path: '/delivery/earnings', label: 'Earnings', icon: DollarSign },
  { path: '/delivery/profile', label: 'Profile', icon: User },
];

export const DeliveryLayout = () => (
  <div className="flex min-h-screen bg-gray-50 dark:bg-dark-200">
    <Sidebar links={deliveryLinks} title="Delivery" />
    <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </div>
    </main>
    <MobileNav links={deliveryLinks} />
  </div>
);

// ─── Admin Layout ───────────────────────────────────────────────────────────────
const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/providers', label: 'Providers', icon: Shield },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/admin/coupons', label: 'Coupons', icon: Tag },
];

export const AdminLayout = () => (
  <div className="flex min-h-screen bg-gray-50 dark:bg-dark-200">
    <Sidebar links={adminLinks} title="Admin" />
    <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </div>
    </main>
    <MobileNav links={adminLinks} />
  </div>
);

export default StudentLayout;
