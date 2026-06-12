import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, Plus, TrendingUp, TrendingDown, Gift, Star, Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { walletAPI } from '../../services/api';
import { PageHeader, Modal } from '../../components/common/index';
import { format } from 'date-fns';

const TOP_UP_AMOUNTS = [100, 200, 500, 1000];

export default function WalletPage() {
  const { user } = useSelector(s => s.auth);
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wallet-page'],
    queryFn: () => walletAPI.get().then(r => r.data.data),
  });

  const topUpMutation = useMutation({
    mutationFn: (amt) => walletAPI.topUp(amt),
    onSuccess: (res) => {
      const { razorpayOrder } = res.data.data;
      // Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'HostelMeal Connect',
        description: 'Wallet Top Up',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            await walletAPI.confirmTopUp({ ...response, amount: razorpayOrder.amount / 100 });
            toast.success(`₹${razorpayOrder.amount / 100} added to wallet!`);
            refetch();
            setShowTopUp(false);
          } catch { toast.error('Payment verification failed'); }
        },
        theme: { color: '#f97316' },
      };
      if (window.Razorpay) {
        new window.Razorpay(options).open();
      } else {
        toast.error('Payment gateway not loaded. Please refresh.');
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Top up failed'),
  });

  const finalAmount = customAmount ? parseInt(customAmount) : amount;

  const txIcon = (type) => type === 'credit'
    ? <ArrowDownLeft size={16} className="text-green-500" />
    : <ArrowUpRight size={16} className="text-red-500" />;

  const categoryEmoji = {
    order_payment: '🍱', order_refund: '↩️', referral_bonus: '🎁',
    loyalty_reward: '⭐', cashback: '💸', top_up: '💳', withdrawal: '🏦',
  };

  return (
    <div>
      <PageHeader title="My Wallet" subtitle="Manage your balance and transactions" />

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-500 to-orange-600 rounded-3xl p-6 mb-6 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Wallet size={18} />
            <span className="text-sm font-medium">Wallet Balance</span>
          </div>
          <p className="text-5xl font-display font-black mb-1">₹{data?.balance?.toLocaleString('en-IN') || 0}</p>
          <p className="text-primary-100 text-sm">Available to spend</p>

          <div className="flex items-center gap-4 mt-6">
            <div className="bg-white/20 rounded-2xl px-4 py-2">
              <p className="text-xs opacity-70">Loyalty Points</p>
              <p className="font-bold text-lg">{user?.loyaltyPoints || 0} ⭐</p>
            </div>
            <button onClick={() => setShowTopUp(true)}
              className="flex items-center gap-2 bg-white text-primary-600 font-bold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
              <Plus size={16} /> Add Money
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Spent', value: `₹${data?.transactions?.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0) || 0}`, icon: TrendingDown, color: 'text-red-500' },
          { label: 'Total Added', value: `₹${data?.transactions?.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0) || 0}`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Transactions', value: data?.transactions?.length || 0, icon: Gift, color: 'text-primary-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <p className="font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Transaction History</h3>
        </div>
        {isLoading ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[1,2,3,4,5].map(i => <div key={i} className="p-4 flex gap-4 animate-pulse"><div className="skeleton w-10 h-10 rounded-xl" /><div className="flex-1 space-y-2"><div className="skeleton h-4 w-2/3 rounded" /><div className="skeleton h-3 w-1/3 rounded" /></div></div>)}
          </div>
        ) : data?.transactions?.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Wallet size={36} className="mx-auto mb-3 opacity-30" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {data?.transactions?.map((tx, i) => (
              <motion.div key={tx._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'credit' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <span className="text-lg">{categoryEmoji[tx.category] || (tx.type === 'credit' ? '⬇️' : '⬆️')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(tx.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </p>
                  <p className="text-xs text-gray-400">Bal: ₹{tx.balance}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      <Modal isOpen={showTopUp} onClose={() => setShowTopUp(false)} title="Add Money to Wallet">
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select amount:</p>
            <div className="grid grid-cols-4 gap-2">
              {TOP_UP_AMOUNTS.map(amt => (
                <button key={amt} onClick={() => { setAmount(amt); setCustomAmount(''); }}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    amount === amt && !customAmount
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50'
                  }`}>
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or enter custom amount:</p>
            <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
              placeholder="Enter amount (₹10 - ₹10,000)" className="input-field"
              min={10} max={10000} />
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Amount to add</span>
              <span className="font-bold text-primary-600 text-lg">₹{finalAmount || 0}</span>
            </div>
          </div>

          <button onClick={() => topUpMutation.mutate(finalAmount)} disabled={topUpMutation.isPending || !finalAmount || finalAmount < 10}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
            {topUpMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Proceed to Pay ₹{finalAmount || 0}
          </button>
        </div>
      </Modal>
    </div>
  );
}
