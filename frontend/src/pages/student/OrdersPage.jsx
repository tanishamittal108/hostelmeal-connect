import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Clock, ArrowRight, Search } from 'lucide-react';
import { orderAPI } from '../../services/api';
import { PageHeader, StatusBadge, EmptyState, SkeletonList } from '../../components/common/index';
import { format } from 'date-fns';

const STATUS_TABS = ['all', 'placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', activeTab, page],
    queryFn: () => orderAPI.getMyOrders({ status: activeTab === 'all' ? undefined : activeTab, page, limit: 10 }).then(r => r.data),
    keepPreviousData: true,
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <PageHeader title="My Orders" subtitle={`${pagination?.total || 0} total orders`} />

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}>
            {tab === 'all' ? '🍽️ All' : tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders found"
          description={activeTab === 'all' ? "You haven't placed any orders yet!" : `No ${activeTab} orders`}
          action={<Link to="/providers" className="btn-primary">Browse Providers</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">#{order.orderNumber}</h3>
                    <StatusBadge status={order.status} />
                    {order.isEmergency && <span className="badge bg-red-100 text-red-700">🚨 Emergency</span>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.provider?.businessName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">₹{order.totalAmount}</p>
                  <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {order.items?.slice(0, 3).map((item, j) => (
                  <span key={j} className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-lg font-medium">
                    {item.name}
                  </span>
                ))}
                {order.items?.length > 3 && (
                  <span className="text-xs text-gray-400 flex items-center">+{order.items.length - 3} more</span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {format(new Date(order.createdAt), 'dd MMM, hh:mm a')}
                  </span>
                  {order.deliveryAddress?.hostelName && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {order.deliveryAddress.hostelName}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {['out_for_delivery', 'placed', 'accepted', 'preparing'].includes(order.status) && (
                    <Link to={`/student/orders/${order._id}/track`}
                      className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                      Track <ArrowRight size={12} />
                    </Link>
                  )}
                  <Link to={`/student/orders/${order._id}`}
                    className="text-xs btn-secondary py-1.5 px-3">
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Previous</button>
              <span className="text-sm text-gray-500">Page {page} of {pagination.pages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
