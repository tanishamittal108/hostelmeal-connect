import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, Truck, Star, TrendingUp, Wallet } from 'lucide-react';
import { deliveryAPI } from '../../services/api';
import { PageHeader, StatCard } from '../../components/common/index';

export default function DeliveryEarnings() {
  const { data } = useQuery({
    queryKey: ['delivery-earnings-page'],
    queryFn: () => deliveryAPI.getEarnings().then(r => r.data.data),
  });

  const perDelivery = 30;
  const completedOrders = data?.completedOrders || 0;

  return (
    <div>
      <PageHeader title="My Earnings" subtitle="Track your delivery income" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Earned', value: data?.totalEarnings || 0, icon: DollarSign, color: 'primary', prefix: '₹' },
          { title: 'Pending Payout', value: data?.pendingPayout || 0, icon: Wallet, color: 'green', prefix: '₹' },
          { title: 'Total Deliveries', value: data?.totalDeliveries || 0, icon: Truck, color: 'blue' },
          { title: 'Avg Rating', value: data?.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'purple' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Earnings breakdown */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">💰 Earnings Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Per Delivery', value: `₹${perDelivery}` },
              { label: 'Completed Deliveries', value: completedOrders },
              { label: 'Gross Earnings', value: `₹${completedOrders * perDelivery}` },
              { label: 'Pending Payout', value: `₹${data?.pendingPayout || 0}`, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                <span className={`font-semibold ${highlight ? 'text-primary-600 text-base' : 'text-gray-900 dark:text-white text-sm'}`}>{value}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary w-full mt-4 text-sm">Request Payout</button>
        </div>

        {/* Tips */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🚀 Earn More Tips</h3>
          <div className="space-y-3">
            {[
              { emoji: '⚡', tip: 'Accept orders quickly — fast acceptance = more orders' },
              { emoji: '📍', tip: 'Stay online during 7–9 PM peak delivery time' },
              { emoji: '⭐', tip: 'Maintain 4.5+ rating for priority order assignments' },
              { emoji: '🛵', tip: 'Complete 50+ deliveries for bonus ₹500 reward' },
              { emoji: '📱', tip: 'Always update location in real-time for tracking' },
            ].map(({ emoji, tip }) => (
              <div key={tip} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-lg flex-shrink-0">{emoji}</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
