import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ChefHat, Truck, Loader2, Phone, MapPin, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api';
import { PageHeader, StatusBadge, EmptyState } from '../../components/common/index';
import { getSocket } from '../../services/socket';
import { format } from 'date-fns';

const STATUS_TABS = ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

export default function ProviderOrders() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('placed');

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['provider-orders', activeTab],
    queryFn: () => orderAPI.getProviderOrders({ status: activeTab }).then(r => r.data.data),
    refetchInterval: 30000,
  });

  // Real-time new order notification
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('new_order', () => {
      toast.success('🆕 New order received!');
      queryClient.invalidateQueries(['provider-orders']);
    });
    return () => socket.off('new_order');
  }, []);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, note }) => orderAPI.updateStatus(id, { status, note }),
    onSuccess: () => {
      toast.success('Order status updated!');
      queryClient.invalidateQueries(['provider-orders']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const getNextAction = (status) => {
    const actions = {
      placed: { label: 'Accept Order', next: 'accepted', icon: CheckCircle, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
      accepted: { label: 'Start Preparing', next: 'preparing', icon: ChefHat, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
      preparing: { label: 'Mark Ready', next: 'ready', icon: CheckCircle, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
      ready: { label: 'Picked Up', next: 'picked_up', icon: Truck, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
    };
    return actions[status];
  };

  const tabCounts = { placed: orders?.length || 0 };

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Manage incoming orders in real-time"
        action={
          <button onClick={() => refetch()} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}>
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : orders?.length === 0 ? (
        <EmptyState icon="📭" title={`No ${activeTab} orders`} description="Orders will appear here in real-time" />
      ) : (
        <div className="space-y-4">
          {orders?.map((order, i) => {
            const action = getNextAction(order.status);
            return (
              <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card p-5 border-l-4 ${
                  order.status === 'placed' ? 'border-primary-500' :
                  order.status === 'preparing' ? 'border-yellow-500' :
                  order.status === 'delivered' ? 'border-green-500' : 'border-gray-300'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">#{order.orderNumber}</h3>
                      <StatusBadge status={order.status} />
                      {order.isEmergency && <span className="badge bg-red-100 text-red-700">🚨 Emergency</span>}
                    </div>

                    {/* Student info */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                          {order.student?.name?.[0]}
                        </div>
                        {order.student?.name}
                      </div>
                      {order.student?.phone && (
                        <a href={`tel:${order.student.phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          <Phone size={12} /> {order.student.phone}
                        </a>
                      )}
                    </div>

                    {/* Delivery address */}
                    {order.deliveryAddress?.hostelName && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                        <MapPin size={12} className="text-primary-500" />
                        {order.deliveryAddress.hostelName}
                        {order.deliveryAddress.roomNumber && ` — Room ${order.deliveryAddress.roomNumber}`}
                      </div>
                    )}

                    {/* Items */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {order.items?.map((item, j) => (
                        <span key={j} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg border border-gray-100 dark:border-gray-700">
                          {item.name} ×{item.quantity}
                        </span>
                      ))}
                    </div>

                    {order.specialInstructions && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
                        📝 {order.specialInstructions}
                      </p>
                    )}
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">₹{order.totalAmount}</p>
                      <p className="text-xs text-gray-400">{order.paymentMethod} • {order.paymentStatus}</p>
                      <p className="text-xs text-gray-400 mt-1">{format(new Date(order.createdAt), 'hh:mm a')}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {order.status === 'placed' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'rejected', note: 'Rejected by provider' })}
                          disabled={updateStatusMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors">
                          <XCircle size={14} /> Reject
                        </button>
                      )}
                      {action && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: order._id, status: action.next })}
                          disabled={updateStatusMutation.isPending}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${action.color}`}>
                          {updateStatusMutation.isPending
                            ? <Loader2 size={14} className="animate-spin" />
                            : <action.icon size={14} />}
                          {action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
