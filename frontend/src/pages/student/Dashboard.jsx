import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, Vote, CreditCard, Wallet, TrendingUp, Clock, Star, ArrowRight, Zap } from 'lucide-react';
import { menuAPI, orderAPI, walletAPI } from '../../services/api';
import { StatCard, SkeletonCard, EmptyState, StatusBadge, PageHeader } from '../../components/common/index';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useSelector(s => s.auth);

  const { data: todayMenus, isLoading: menusLoading } = useQuery({
    queryKey: ['today-menus'],
    queryFn: () => menuAPI.getTodayMenus().then(r => r.data.data),
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders', { limit: 5 }],
    queryFn: () => orderAPI.getMyOrders({ limit: 5 }).then(r => r.data.data),
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletAPI.get().then(r => r.data.data),
  });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    if (h < 20) return 'Good Evening';
    return 'Good Night';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{getGreeting()} 👋</p>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
            {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {new Date().getHours() >= 18 && new Date().getHours() < 19
              ? '🗳️ Voting is LIVE right now! Cast your vote before 7 PM'
              : "Here's your meal dashboard for today"}
          </p>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Wallet Balance', value: `₹${wallet?.balance || 0}`, icon: Wallet, color: 'green', href: '/student/wallet' },
          { title: 'Total Orders', value: user?.totalOrders || 0, icon: ShoppingBag, color: 'blue', href: '/student/orders' },
          { title: 'Loyalty Points', value: user?.loyaltyPoints || 0, icon: Star, color: 'purple', href: '/student/wallet' },
          { title: 'Active Sub', value: 'Monthly', icon: CreditCard, color: 'pink', href: '/student/subscription' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link to={stat.href}>
              <StatCard {...stat} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Voting Banner */}
      {new Date().getHours() >= 18 && new Date().getHours() < 19 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-20">🗳️</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
              <p className="text-white/80 text-sm font-medium">VOTING IS LIVE!</p>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Vote for Tonight's Menu</h3>
            <p className="text-primary-100 text-sm mb-4">Hurry! Voting closes at 7:00 PM sharp. Your vote determines what's cooked!</p>
            <Link to="/student/vote" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors shadow-md">
              <Vote size={16} /> Cast Your Vote <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Menus */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">Today's Menus</h2>
            <Link to="/providers" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {menusLoading ? (
            <div className="space-y-4">
              <SkeletonCard lines={3} />
              <SkeletonCard lines={3} />
            </div>
          ) : todayMenus?.length === 0 ? (
            <EmptyState icon="🍽️" title="No menus today" description="Providers haven't posted today's menu yet. Check back after 3 PM!" />
          ) : (
            <div className="space-y-4">
              {todayMenus?.slice(0, 3).map((menu, i) => (
                <motion.div
                  key={menu._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{menu.provider?.businessName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{menu.provider?.kitchenAddress?.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">₹{menu.finalPrice || menu.basePrice}</p>
                      <StatusBadge status={menu.status} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {menu.sabjiOptions?.slice(0, 3).map(s => (
                      <span key={s._id} className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-lg font-medium">
                        {s.name}
                      </span>
                    ))}
                    {menu.sweetDishOptions?.[0] && (
                      <span className="px-2.5 py-1 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 text-xs rounded-lg font-medium">
                        🍬 {menu.sweetDishOptions[0].name}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/student/vote?menu=${menu._id}`} className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5">
                      <Vote size={13} /> Vote
                    </Link>
                    <Link to={`/student/checkout?menu=${menu._id}`} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                      <ShoppingBag size={13} /> Order
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Vote, label: 'Vote Now', path: '/student/vote', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
                { icon: ShoppingBag, label: 'My Orders', path: '/student/orders', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
                { icon: Wallet, label: 'Wallet', path: '/student/wallet', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
                { icon: CreditCard, label: 'Subscribe', path: '/student/subscription', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
              ].map(({ icon: Icon, label, path, color }) => (
                <Link key={path} to={path} className={`flex flex-col items-center gap-2 p-4 rounded-xl ${color} hover:scale-105 transition-transform`}>
                  <Icon size={20} />
                  <span className="text-xs font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
              <Link to="/student/orders" className="text-xs text-primary-600">View all</Link>
            </div>
            {ordersLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
              </div>
            ) : recentOrders?.length === 0 ? (
              <EmptyState icon="📦" title="No orders yet" description="Place your first order!" />
            ) : (
              <div className="space-y-3">
                {recentOrders?.slice(0, 4).map(order => (
                  <Link key={order._id} to={`/student/orders/${order._id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{format(new Date(order.createdAt), 'dd MMM')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">₹{order.totalAmount}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
