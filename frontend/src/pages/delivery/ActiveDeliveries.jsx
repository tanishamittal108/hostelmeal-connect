// ===================== delivery/ActiveDeliveries.jsx =====================
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Truck, MapPin, Phone, Clock } from 'lucide-react';
import { deliveryAPI } from '../../services/api';
import { PageHeader, StatusBadge, EmptyState } from '../../components/common/index';
import { format } from 'date-fns';

export default function ActiveDeliveries() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['delivery-active-list'],
    queryFn: () => deliveryAPI.getActive().then(r => r.data.data),
    refetchInterval: 20000,
  });

  return (
    <div>
      <PageHeader title="Active Deliveries" subtitle="All your current delivery tasks" />

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
      ) : orders?.length === 0 ? (
        <EmptyState icon="🛵" title="No active deliveries" description="You're all caught up! New orders will appear here." />
      ) : (
        <div className="space-y-4">
          {orders?.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="card p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">#{order.orderNumber}</h3>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">₹{order.totalAmount}</p>
                  <p className="text-xs text-green-600 font-medium">+₹30 your earning</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                  <MapPin size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-600">Pickup</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{order.provider?.businessName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl">
                  <MapPin size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-600">Deliver</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{order.deliveryAddress?.hostelName}</p>
                    {order.deliveryAddress?.roomNumber && <p className="text-xs text-gray-400">Room {order.deliveryAddress.roomNumber}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={12} />
                  {format(new Date(order.createdAt), 'hh:mm a')}
                </div>
                {order.student?.phone && (
                  <a href={`tel:${order.student.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium">
                    <Phone size={14} /> Call Student
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
