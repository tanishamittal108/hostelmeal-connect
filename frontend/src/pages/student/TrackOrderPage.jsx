// ===================== TrackOrderPage.jsx =====================
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Phone, Clock, CheckCircle } from 'lucide-react';
import { orderAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/index';
import { getSocket } from '../../services/socket';
import { format } from 'date-fns';

const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📋', desc: 'Your order has been placed' },
  { key: 'accepted', label: 'Accepted', icon: '✅', desc: 'Chef accepted your order' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', desc: 'Chef is cooking your meal' },
  { key: 'ready', label: 'Ready', icon: '📦', desc: 'Food is packed and ready' },
  { key: 'picked_up', label: 'Picked Up', icon: '🛵', desc: 'Delivery partner picked up' },
  { key: 'out_for_delivery', label: 'On the Way', icon: '🚀', desc: 'Almost there!' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Enjoy your meal!' },
];

export default function TrackOrderPage() {
  const { id } = useParams();
  const [liveStatus, setLiveStatus] = useState(null);

  const { data: orderData, refetch } = useQuery({
    queryKey: ['track-order', id],
    queryFn: () => orderAPI.getOrder(id).then(r => r.data.data),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('order_status_update', ({ orderId, status }) => {
      if (orderId === id) { setLiveStatus(status); refetch(); }
    });
    return () => socket.off('order_status_update');
  }, [id]);

  const order = orderData;
  const currentStatus = liveStatus || order?.status;
  const currentIndex = STEPS.findIndex(s => s.key === currentStatus);

  if (!order) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <Link to={`/student/orders/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={16} /> Back to Order Details
      </Link>

      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="card p-5 mb-6 text-center">
          <div className="text-5xl mb-3">{STEPS[currentIndex]?.icon || '📋'}</div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1">
            {STEPS[currentIndex]?.label}
          </h2>
          <p className="text-gray-500 text-sm">{STEPS[currentIndex]?.desc}</p>
          {order.estimatedDelivery && currentStatus !== 'delivered' && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-primary-600 font-medium">
              <Clock size={14} />
              Est. delivery: {format(new Date(order.estimatedDelivery), 'hh:mm a')}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Order Timeline</h3>
          <div className="space-y-1">
            {STEPS.map((step, i) => {
              const done = i <= currentIndex;
              const active = i === currentIndex;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all ${
                      active ? 'bg-primary-500 shadow-glow scale-110' :
                      done ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-gray-100 dark:bg-gray-800 opacity-40'
                    }`}>
                      {done && !active ? '✓' : step.icon}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 rounded-full ${i < currentIndex ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                  </div>
                  <div className={`pb-4 ${!done ? 'opacity-40' : ''}`}>
                    <p className={`font-medium text-sm ${active ? 'text-primary-600' : 'text-gray-900 dark:text-white'}`}>
                      {step.label}
                      {active && <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full inline-block animate-ping" />}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                    {order.statusHistory?.find(h => h.status === step.key) && (
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
                        {format(new Date(order.statusHistory.find(h => h.status === step.key).timestamp), 'hh:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Partner */}
        {order.deliveryPartner && (
          <div className="card p-5 mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🛵 Delivery Partner</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center text-white font-bold">
                  {order.deliveryPartner.name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.deliveryPartner.name}</p>
                  <p className="text-xs text-gray-400">Delivery Partner</p>
                </div>
              </div>
              {order.deliveryPartner.phone && (
                <a href={`tel:${order.deliveryPartner.phone}`}
                  className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">
                  <Phone size={14} /> Call
                </a>
              )}
            </div>
          </div>
        )}

        {/* OTP */}
        {order.deliveryOtp && !order.deliveryOtpVerified && currentStatus === 'out_for_delivery' && (
          <div className="card p-5 border-2 border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔐 Delivery OTP</h3>
            <p className="text-xs text-gray-500 mb-3">Share this OTP with delivery partner to confirm delivery</p>
            <div className="flex justify-center gap-3">
              {order.deliveryOtp.split('').map((digit, i) => (
                <div key={i} className="w-12 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 flex items-center justify-center text-2xl font-bold text-primary-600">
                  {digit}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStatus === 'delivered' && (
          <div className="card p-5 text-center bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
            <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-700 dark:text-green-400">Order Delivered Successfully!</p>
            <p className="text-sm text-gray-500 mt-1">Enjoy your meal! Don't forget to rate your experience.</p>
            <Link to={`/student/orders/${id}`} className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              Rate & Review
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
