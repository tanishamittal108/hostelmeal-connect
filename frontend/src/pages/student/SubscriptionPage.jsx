// ===================== SubscriptionPage.jsx =====================
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Pause, Play, X, CheckCircle, Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionAPI, providerAPI } from '../../services/api';
import { PageHeader, StatusBadge, EmptyState, Modal } from '../../components/common/index';
import { format } from 'date-fns';

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [plan, setPlan] = useState('monthly');

  const { data: subs, isLoading } = useQuery({
    queryKey: ['my-subscriptions'],
    queryFn: () => subscriptionAPI.getMy().then(r => r.data.data),
  });

  const { data: providers } = useQuery({
    queryKey: ['providers-for-sub'],
    queryFn: () => providerAPI.getAll({ limit: 20 }).then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => subscriptionAPI.create(data),
    onSuccess: () => { toast.success('Subscription created!'); queryClient.invalidateQueries(['my-subscriptions']); setShowNew(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const pauseMutation = useMutation({
    mutationFn: (id) => subscriptionAPI.pause(id, 'Paused by student'),
    onSuccess: () => { toast.success('Subscription paused'); queryClient.invalidateQueries(['my-subscriptions']); },
  });

  const resumeMutation = useMutation({
    mutationFn: (id) => subscriptionAPI.resume(id),
    onSuccess: () => { toast.success('Subscription resumed!'); queryClient.invalidateQueries(['my-subscriptions']); },
  });

  const plans = [
    { value: 'weekly', label: '7 Days', price: 525, saving: '₹70 saved', color: 'border-blue-300' },
    { value: 'monthly', label: '30 Days', price: 2000, saving: '₹550 saved', color: 'border-primary-500', popular: true },
  ];

  return (
    <div>
      <PageHeader title="My Subscriptions"
        subtitle="Save up to 21% with monthly plans"
        action={<button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2"><CreditCard size={16} /> New Subscription</button>}
      />

      {isLoading ? (
        <div className="space-y-4">{[1,2].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      ) : subs?.length === 0 ? (
        <div>
          <EmptyState icon="📅" title="No active subscriptions"
            description="Subscribe monthly and save ₹550 vs daily ordering!"
            action={<button onClick={() => setShowNew(true)} className="btn-primary">Subscribe Now</button>} />
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {plans.map(p => (
              <div key={p.value} className={`card p-6 border-2 ${p.color} ${p.popular ? 'shadow-glow' : ''}`}>
                {p.popular && <span className="badge-primary mb-2">Most Popular</span>}
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{p.label}</h3>
                <p className="text-3xl font-display font-black text-primary-600 my-2">₹{p.price}</p>
                <p className="text-sm text-green-600 font-medium">{p.saving}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {subs?.map((sub, i) => (
            <motion.div key={sub._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{sub.provider?.businessName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={sub.status} />
                    <span className="text-xs text-gray-400 capitalize">{sub.plan} plan</span>
                  </div>
                </div>
                <p className="font-bold text-primary-600 text-lg">₹{sub.totalAmount}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Start', value: format(new Date(sub.startDate), 'dd MMM') },
                  { label: 'End', value: format(new Date(sub.endDate), 'dd MMM') },
                  { label: 'Streak', value: `${sub.streakDays || 0} days 🔥` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((new Date() - new Date(sub.startDate)) / (new Date(sub.endDate) - new Date(sub.startDate)) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.round((new Date() - new Date(sub.startDate)) / (new Date(sub.endDate) - new Date(sub.startDate)) * 100))}%` }}
                    className="vote-bar"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {sub.status === 'active' && (
                  <button onClick={() => pauseMutation.mutate(sub._id)} disabled={pauseMutation.isPending}
                    className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 rounded-xl text-xs font-medium hover:bg-yellow-100 transition-colors">
                    <Pause size={13} /> Pause
                  </button>
                )}
                {sub.status === 'paused' && (
                  <button onClick={() => resumeMutation.mutate(sub._id)} disabled={resumeMutation.isPending}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 rounded-xl text-xs font-medium hover:bg-green-100 transition-colors">
                    <Play size={13} /> Resume
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Subscription Modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New Subscription">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Select Provider</label>
            <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)} className="input-field">
              <option value="">Choose a chef...</option>
              {providers?.map(p => <option key={p._id} value={p._id}>{p.businessName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Plan</label>
            <div className="grid grid-cols-2 gap-3">
              {plans.map(p => (
                <button key={p.value} onClick={() => setPlan(p.value)} type="button"
                  className={`p-4 rounded-xl border-2 text-center transition-all ${plan === p.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <p className="font-bold text-gray-900 dark:text-white">{p.label}</p>
                  <p className="text-primary-600 font-bold">₹{p.price}</p>
                  <p className="text-xs text-green-600">{p.saving}</p>
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => createMutation.mutate({ providerId: selectedProvider, plan, startDate: new Date(), mealsPerDay: 1 })}
            disabled={!selectedProvider || createMutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Subscribe Now
          </button>
        </div>
      </Modal>
    </div>
  );
}
