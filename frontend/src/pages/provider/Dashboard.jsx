import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Star, TrendingUp, ChefHat, Clock, Plus, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI, orderAPI } from '../../services/api';
import { StatCard, PageHeader, StatusBadge, EmptyState, SkeletonCard } from '../../components/common/index';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

export default function ProviderDashboard() {
  const { user } = useSelector(s => s.auth);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['provider-analytics'],
    queryFn: () => analyticsAPI.getProvider(30).then(r => r.data.data),
  });

  const { data: activeOrders } = useQuery({
    queryKey: ['provider-orders', 'active'],
    queryFn: () => orderAPI.getProviderOrders({ status: 'placed' }).then(r => r.data.data),
    refetchInterval: 30000,
  });

  const orderStats = analytics?.orders || [];
  const totalRevenue = orderStats.filter(o => o._id === 'delivered').reduce((s, o) => s + o.revenue, 0);
  const totalOrders = orderStats.reduce((s, o) => s + o.count, 0);
  const delivered = orderStats.find(o => o._id === 'delivered')?.count || 0;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0]}! 👨‍🍳`}
        subtitle="Manage your kitchen and track earnings"
        action={
          <Link to="/provider/menu" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Menu
          </Link>
        }
      />

      {/* Provider Status Check */}
      {analytics?.provider?.status === 'pending' && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <Clock size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">Account Pending Verification</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Your provider account is under review. You'll be able to post menus and accept orders once approved. This usually takes 24-48 hours.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Revenue', value: totalRevenue, icon: DollarSign, color: 'primary', prefix: '₹', change: 15 },
          { title: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'blue', change: 8 },
          { title: 'Delivered', value: delivered, icon: ChefHat, color: 'green', change: 12 },
          { title: 'Avg Rating', value: analytics?.provider?.avgRating?.toFixed(1) || '—', icon: Star, color: 'purple' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-5">Revenue Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={analytics?.revenueByDay || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="provRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [n === 'revenue' ? `₹${v}` : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#provRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: Plus, label: 'Add Today\'s Menu', path: '/provider/menu', color: 'text-primary-500' },
                { icon: ShoppingBag, label: 'View Active Orders', path: '/provider/orders', color: 'text-blue-500' },
                { icon: DollarSign, label: 'Check Earnings', path: '/provider/earnings', color: 'text-green-500' },
                { icon: TrendingUp, label: 'View Analytics', path: '/provider/analytics', color: 'text-purple-500' },
              ].map(({ icon: Icon, label, path, color }) => (
                <Link key={path} to={path} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={color} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Top dishes */}
          {analytics?.topDishes?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🥘 Top Voted Dishes</h3>
              <div className="space-y-2">
                {analytics.topDishes.slice(0, 4).map(({ _id, totalVotes }, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{_id}</span>
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">{totalVotes} votes</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Orders */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-gray-900 dark:text-white">New Orders</h3>
          <Link to="/provider/orders" className="text-sm text-primary-600 hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
        </div>
        {!activeOrders?.length ? (
          <EmptyState icon="📭" title="No new orders" description="New orders will appear here in real-time" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.slice(0, 6).map(order => (
              <motion.div key={order._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="card p-4 border-l-4 border-primary-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.student?.name}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-500 mb-3">{order.deliveryAddress?.hostelName || 'Hostel delivery'}</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-primary-600">₹{order.totalAmount}</p>
                  <Link to={`/provider/orders?id=${order._id}`} className="text-xs btn-primary py-1.5 px-3">Manage</Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
