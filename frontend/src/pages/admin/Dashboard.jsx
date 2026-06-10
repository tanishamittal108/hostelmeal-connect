import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, ChefHat, ShoppingBag, DollarSign, TrendingUp, Clock, Shield, Tag } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsAPI, adminAPI } from '../../services/api';
import { StatCard, PageHeader, SkeletonCard, StatusBadge } from '../../components/common/index';

const COLORS = ['#f97316', '#8b5cf6', '#06b6d4', '#22c55e', '#f43f5e'];

export default function AdminDashboard() {
  const [range, setRange] = useState('30');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics', range],
    queryFn: () => analyticsAPI.getAdmin(range).then(r => r.data.data),
  });

  const { data: pendingProviders } = useQuery({
    queryKey: ['pending-providers'],
    queryFn: () => adminAPI.getPendingProviders().then(r => r.data.data),
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Admin Dashboard" subtitle="Platform overview and analytics" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <SkeletonCard key={i} lines={2} />)}
        </div>
      </div>
    );
  }

  const ov = analytics?.overview || {};

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform overview and analytics"
        action={
          <select value={range} onChange={e => setRange(e.target.value)}
            className="input-field w-32 py-2 text-sm">
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Students', value: ov.totalUsers, icon: Users, color: 'blue', change: 12 },
          { title: 'Active Providers', value: ov.totalProviders, icon: ChefHat, color: 'green', change: 8 },
          { title: 'Total Orders', value: ov.totalOrders, icon: ShoppingBag, color: 'purple', change: 23 },
          { title: 'Total Revenue', value: ov.totalRevenue, icon: DollarSign, color: 'primary', prefix: '₹', change: 18 },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'New Users (Period)', value: ov.newUsers || 0, icon: TrendingUp, color: 'text-blue-500' },
          { label: 'New Orders (Period)', value: ov.newOrders || 0, icon: ShoppingBag, color: 'text-purple-500' },
          { label: 'Active Subscriptions', value: ov.activeSubscriptions || 0, icon: Clock, color: 'text-green-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <Icon size={20} className={color} />
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-5">Revenue & Orders Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={analytics?.revenueByDay || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [n === 'revenue' ? `₹${v}` : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} fill="none" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="card p-5">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-5">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={analytics?.ordersByStatus || []} cx="50%" cy="50%" outerRadius={70} dataKey="count" nameKey="_id" label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {(analytics?.ordersByStatus || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {(analytics?.ordersByStatus || []).map(({ _id, count }, i) => (
              <div key={_id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="capitalize text-gray-600 dark:text-gray-400">{_id}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Providers */}
        <div className="card p-5">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">🏆 Top Providers</h3>
          <div className="space-y-3">
            {(analytics?.topProviders || []).map(({ provider, totalOrders, revenue }, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{provider?.businessName}</p>
                  <p className="text-xs text-gray-400">{totalOrders} orders</p>
                </div>
                <p className="text-sm font-bold text-primary-600">₹{revenue?.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Providers */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-gray-900 dark:text-white">⏳ Pending Approvals</h3>
            {pendingProviders?.length > 0 && (
              <span className="badge-warning">{pendingProviders.length} pending</span>
            )}
          </div>
          {pendingProviders?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Shield size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">All caught up! No pending approvals.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProviders?.slice(0, 4).map(p => (
                <div key={p._id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.businessName}</p>
                    <p className="text-xs text-gray-400">{p.user?.email}</p>
                  </div>
                  <a href="/admin/providers" className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                    Review
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Dishes */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-5">🥘 Most Voted Dishes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics?.topDishes?.slice(0, 8) || []} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="totalVotes" name="Total Votes" radius={[6, 6, 0, 0]}>
                {(analytics?.topDishes || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
