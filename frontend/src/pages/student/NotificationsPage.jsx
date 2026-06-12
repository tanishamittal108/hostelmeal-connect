// ===================== NotificationsPage.jsx =====================
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, ShoppingBag, Vote, CreditCard, Star } from 'lucide-react';
import { notificationAPI } from '../../services/api';
import { markAllRead } from '../../store/slices/notificationSlice';
import { PageHeader, EmptyState } from '../../components/common/index';
import { formatDistanceToNow } from 'date-fns';

const notifIcon = (type) => ({ order: ShoppingBag, vote: Vote, payment: CreditCard, review: Star }[type] || Bell);
const notifColor = (type) => ({ order: 'bg-blue-50 text-blue-500', vote: 'bg-purple-50 text-purple-500', payment: 'bg-green-50 text-green-500', review: 'bg-yellow-50 text-yellow-500' }[type] || 'bg-gray-50 text-gray-500');

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page'],
    queryFn: () => notificationAPI.getAll().then(r => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => { dispatch(markAllRead()); queryClient.invalidateQueries(['notifications-page']); },
  });

  const markOneMutation = useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications-page']),
  });

  const notifications = data?.data || [];
  const unread = data?.unreadCount || 0;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up!'}
        action={unread > 0 && (
          <button onClick={() => markAllMutation.mutate()} className="btn-secondary text-sm flex items-center gap-2">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      />

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up! Notifications will appear here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const Icon = notifIcon(notif.type);
            const colorClass = notifColor(notif.type);
            return (
              <motion.div key={notif._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => !notif.isRead && markOneMutation.mutate(notif._id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  !notif.isRead
                    ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{notif.title}</p>
                    {!notif.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
