import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsAPI } from '../../services/api';
import { PageHeader, StatCard } from '../../components/common/index';
import { TrendingUp, ShoppingBag, Star, DollarSign } from 'lucide-react';

const COLORS = ['#f97316', '#8b5cf6', '#06b6d4', '#22c55e', '#f43f5e'];

export default function ProviderAnalytics() {
  const [range, setRange] = useState('30');

  const { data, isLoading } = useQuery({
    queryKey: ['provider-analytics', range],
    queryFn: () => analyticsAPI.getProvider(range).then(r => r.data.data),
  });

  const orders = data?.orders || [];
  const totalRevenue = orders.filter(o => o._id === 'delivered').reduce((s, o) => s + o.revenue, 0);
  const totalOrders = orders.reduce((s, o) => s + o.count, 0);
  const delivered = orders.find(o => o._id === 'delivered')?.count || 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Deep dive into your performance"
        action={
          <select value={range} onChange={e => setRange(e.target.value)} className="input-field w-32 py-2 text-sm">
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Revenue', value: totalRevenue, icon: DollarSign, color: 'primary', prefix: '₹', change: 15 },
          { title: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'blue', change: 8 },
          { title: 'Delivered', value: delivered, icon: TrendingUp, color: 'green', change: 12 },
          { title: 'Avg Rating', value: data?.provider?.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'purple' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-5">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.revenueByDay || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [n === 'revenue' ? `₹${v}` : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#analyticsGrad)" />
              <Area type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} fill="none" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-5">Order Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={orders} cx="50%" cy="50%" outerRadius={70} dataKey="count" nameKey="_id" label={({ _id, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {orders.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {orders.map(({ _id, count }, i) => (
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

      {/* Top Dishes */}
      <div className="card p-5">
        <h3 className="font-display font-bold text-gray-900 dark:text-white mb-5">🥘 Most Voted Dishes</h3>
        {data?.topDishes?.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No voting data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.topDishes?.slice(0, 6) || []} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="totalVotes" name="Votes" radius={[6,6,0,0]}>
                {(data?.topDishes || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
