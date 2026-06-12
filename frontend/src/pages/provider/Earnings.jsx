// ===================== Earnings.jsx =====================
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, ShoppingBag, Star, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../../services/api';
import { PageHeader, StatCard } from '../../components/common/index';

export default function ProviderEarnings() {
  const { data, isLoading } = useQuery({
    queryKey: ['provider-analytics-earnings'],
    queryFn: () => analyticsAPI.getProvider(30).then(r => r.data.data),
  });

  const orders = data?.orders || [];
  const totalRevenue = orders.filter(o => o._id === 'delivered').reduce((s, o) => s + o.revenue, 0);
  const totalDelivered = orders.find(o => o._id === 'delivered')?.count || 0;
  const totalOrders = orders.reduce((s, o) => s + o.count, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalDelivered) : 0;

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Track your income and payouts" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Revenue', value: totalRevenue, icon: DollarSign, color: 'primary', prefix: '₹', change: 18 },
          { title: 'Orders Delivered', value: totalDelivered, icon: ShoppingBag, color: 'blue', change: 12 },
          { title: 'Avg Order Value', value: avgOrderValue, icon: TrendingUp, color: 'green', prefix: '₹' },
          { title: 'Avg Rating', value: data?.provider?.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'purple' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-gray-900 dark:text-white">Revenue (Last 30 Days)</h3>
          <button className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
            <Download size={14} /> Export
          </button>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data?.revenueByDay || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#earningsGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Payout Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">💳 Payout Details</h3>
          <div className="space-y-3">
            {[
              { label: 'Available Balance', value: `₹${data?.provider?.pendingPayout || 0}`, highlight: true },
              { label: 'Total Earned', value: `₹${data?.provider?.totalEarnings || totalRevenue}` },
              { label: 'Platform Fee (10%)', value: `₹${Math.round(totalRevenue * 0.1)}` },
              { label: 'Net Earnings', value: `₹${Math.round(totalRevenue * 0.9)}`, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                <span className={`font-semibold ${highlight ? 'text-primary-600 text-base' : 'text-gray-900 dark:text-white text-sm'}`}>{value}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary w-full mt-4 text-sm">Request Payout</button>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📊 Order Breakdown</h3>
          <div className="space-y-3">
            {orders.map(({ _id, count, revenue }) => (
              <div key={_id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-400" />
                  <span className="text-sm capitalize text-gray-600 dark:text-gray-400">{_id}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{count} orders</span>
                  {revenue > 0 && <span className="text-xs text-gray-400 ml-2">₹{revenue}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
