import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ─── Loading Spinner ────────────────────────────────────────────────────────────
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin`} style={{ borderWidth: 3 }} />
    </div>
  );
};

// ─── Full Page Loader ───────────────────────────────────────────────────────────
export const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full"
    />
    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
  </div>
);

// ─── Skeleton Card ──────────────────────────────────────────────────────────────
export const SkeletonCard = ({ lines = 3 }) => (
  <div className="card p-5 animate-pulse">
    <div className="skeleton h-40 w-full rounded-xl mb-4" />
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`skeleton h-4 rounded mb-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export const SkeletonList = ({ count = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-4 animate-pulse flex gap-4">
        <div className="skeleton w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-3 w-1/4 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Stat Card ──────────────────────────────────────────────────────────────────
export const StatCard = ({ title, value, change, changeLabel, icon: Icon, color = 'primary', prefix = '', suffix = '' }) => {
  const colors = {
    primary: 'from-primary-500 to-orange-500',
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-violet-500',
    pink: 'from-pink-500 to-rose-500',
  };
  const isPositive = change > 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card p-5 cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center shadow-md`}>
          <Icon size={20} className="text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      {changeLabel && <p className="text-xs text-gray-400 mt-1">{changeLabel}</p>}
    </motion.div>
  );
};

// ─── Empty State ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon || '📭'}</div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>}
    {action}
  </div>
);

// ─── Badge ──────────────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const configs = {
    placed: { label: 'Placed', class: 'badge-info' },
    accepted: { label: 'Accepted', class: 'badge bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    preparing: { label: 'Preparing', class: 'badge-warning' },
    ready: { label: 'Ready', class: 'badge bg-orange-100 text-orange-700' },
    picked_up: { label: 'Picked Up', class: 'badge bg-purple-100 text-purple-700' },
    out_for_delivery: { label: 'On the Way', class: 'badge bg-cyan-100 text-cyan-700' },
    delivered: { label: 'Delivered', class: 'badge-success' },
    cancelled: { label: 'Cancelled', class: 'badge-error' },
    rejected: { label: 'Rejected', class: 'badge-error' },
    pending: { label: 'Pending', class: 'badge-warning' },
    approved: { label: 'Approved', class: 'badge-success' },
    active: { label: 'Active', class: 'badge-success' },
    expired: { label: 'Expired', class: 'badge-error' },
    paused: { label: 'Paused', class: 'badge-warning' },
    voting_open: { label: 'Voting Open', class: 'badge-primary' },
    finalized: { label: 'Finalized', class: 'badge-success' },
    draft: { label: 'Draft', class: 'badge bg-gray-100 text-gray-700' },
  };
  const cfg = configs[status] || { label: status, class: 'badge bg-gray-100 text-gray-700' };
  return <span className={cfg.class}>{cfg.label}</span>;
};

// ─── Page Header ────────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// ─── Modal ──────────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full ${sizes[size]} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
};

// ─── Rating Stars ───────────────────────────────────────────────────────────────
export const StarRating = ({ rating, max = 5, size = 'sm' }) => {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
  return (
    <div className={`flex gap-0.5 ${sizes[size]}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : i < rating ? 'text-yellow-300' : 'text-gray-200 dark:text-gray-700'}>★</span>
      ))}
    </div>
  );
};

// ─── Vote Progress Bar ──────────────────────────────────────────────────────────
export const VoteBar = ({ count, total, name, selected }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer ${selected ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-primary-200'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{name}</span>
        <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="vote-bar"
        />
      </div>
      <span className="text-xs text-gray-400 mt-1 block">{count} votes</span>
    </div>
  );
};
