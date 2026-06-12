// ===================== delivery/Dashboard.jsx =====================
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Truck, DollarSign, Star, Package, MapPin, Phone, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deliveryAPI, orderAPI } from '../../services/api';
import { PageHeader, StatCard, StatusBadge, EmptyState } from '../../components/common/index';

export default function DeliveryDashboard() {
  const queryClient = useQueryClient();

  const { data: earningsData } = useQuery({
    queryKey: ['delivery-earnings'],
    queryFn: () => deliveryAPI.getEarnings().then(r => r.data.data),
  });

  const { data: activeOrders } = useQuery({
    queryKey: ['delivery-active'],
    queryFn: () => deliveryAPI.getActive().then(r => r.data.data),
    refetchInterval: 15000,
  });

  const [otp, setOtp] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);

  const verifyMutation = useMutation({
    mutationFn: ({ id, otp }) => orderAPI.verifyDelivery(id, otp),
    onSuccess: () => {
      toast.success('✅ Delivery verified! Great job!');
      queryClient.invalidateQueries(['delivery-active']);
      queryClient.invalidateQueries(['delivery-earnings']);
      setVerifyingId(null);
      setOtp('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid OTP'),
  });

  return (
    <div>
      <PageHeader title="Delivery Dashboard" subtitle="Manage your deliveries and track earnings" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Deliveries', value: earningsData?.totalDeliveries || 0, icon: Truck, color: 'blue' },
          { title: 'Total Earned', value: earningsData?.totalEarnings || 0, icon: DollarSign, color: 'primary', prefix: '₹' },
          { title: 'Pending Payout', value: earningsData?.pendingPayout || 0, icon: DollarSign, color: 'green', prefix: '₹' },
          { title: 'Avg Rating', value: earningsData?.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'purple' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Active Deliveries */}
      <div>
        <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4">Active Deliveries</h2>
        {activeOrders?.length === 0 ? (
          <EmptyState icon="🛵" title="No active deliveries" description="New delivery tasks will appear here" />
        ) : (
          <div className="space-y-4">
            {activeOrders?.map(order => (
              <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card p-5 border-l-4 border-primary-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">#{order.orderNumber}</h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm font-semibold text-primary-600">₹{order.totalAmount}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">₹30 earning</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {/* Pickup */}
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-600 mb-1">📍 Pickup From</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order.provider?.businessName}</p>
                    <p className="text-xs text-gray-500">{order.provider?.kitchenAddress?.street}</p>
                  </div>
                  {/* Deliver to */}
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3">
                    <p className="text-xs font-semibold text-green-600 mb-1">🎯 Deliver To</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order.deliveryAddress?.hostelName || order.student?.name}</p>
                    <p className="text-xs text-gray-500">Room {order.deliveryAddress?.roomNumber}</p>
                  </div>
                </div>

                {/* Student contact */}
                {order.student?.phone && (
                  <a href={`tel:${order.student.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4">
                    <Phone size={14} /> {order.student.phone}
                  </a>
                )}

                {/* OTP Verify */}
                {order.status === 'out_for_delivery' && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Enter OTP to confirm delivery:</p>
                    {verifyingId === order._id ? (
                      <div className="flex gap-2">
                        <input type="text" maxLength={4} value={otp} onChange={e => setOtp(e.target.value)}
                          placeholder="4-digit OTP" className="input-field text-center text-xl font-mono tracking-widest flex-1" />
                        <button onClick={() => verifyMutation.mutate({ id: order._id, otp })}
                          disabled={verifyMutation.isPending || otp.length !== 4}
                          className="btn-primary px-4 flex items-center gap-2">
                          {verifyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          Verify
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setVerifyingId(order._id)} className="btn-primary w-full flex items-center justify-center gap-2">
                        <CheckCircle size={16} /> Enter OTP & Confirm Delivery
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
