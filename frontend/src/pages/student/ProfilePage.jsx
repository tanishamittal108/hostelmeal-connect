import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Camera, Save, Loader2, Star, ShoppingBag, Wallet, Gift, Copy, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { authAPI } from '../../services/api';
import { updateUserData } from '../../store/slices/authSlice';
import { PageHeader } from '../../components/common/index';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put('/users/profile', data),
    onSuccess: (res) => {
      dispatch(updateUserData(res.data.data));
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const avatarMutation = useMutation({
    mutationFn: (formData) => api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: (res) => {
      dispatch(updateUserData(res.data.data));
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Failed to upload avatar'),
  });

  const pwdMutation = useMutation({
    mutationFn: (data) => authAPI.updatePassword(data),
    onSuccess: () => {
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    avatarMutation.mutate(formData);
  };

  const handlePwdSubmit = (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) return toast.error('Passwords do not match');
    if (pwdForm.newPassword.length < 8) return toast.error('Min 8 characters');
    pwdMutation.mutate({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'security', label: 'Security' },
    { key: 'referral', label: 'Referral & Rewards' },
  ];

  const statCards = [
    { label: 'Total Orders', value: user?.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Wallet Balance', value: `₹${user?.walletBalance || 0}`, icon: Wallet, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
    { label: 'Loyalty Points', value: user?.loyaltyPoints || 0, icon: Star, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Referrals', value: user?.referralCount || 0, icon: Gift, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account and preferences" />

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors shadow-md">
              {avatarMutation.isPending ? <Loader2 size={13} className="text-white animate-spin" /> : <Camera size={13} className="text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge capitalize ${user?.role === 'student' ? 'badge-info' : 'badge-primary'}`}>{user?.role}</span>
              {user?.isVerified ? (
                <span className="badge-success flex items-center gap-1"><CheckCircle size={11} /> Verified</span>
              ) : (
                <span className="badge-warning">Unverified</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${color}`}>
                <Icon size={16} />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Personal Information</h3>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder="Your full name" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Phone Number</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input-field" placeholder="10-digit mobile number" maxLength={10} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Email Address</label>
              <input value={user?.email} className="input-field bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed" readOnly />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Delivery Address</label>
              <div className="grid md:grid-cols-2 gap-3">
                <input value={form.address.street} onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                  className="input-field" placeholder="Street / Hostel name" />
                <input value={form.address.city} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                  className="input-field" placeholder="City" />
                <input value={form.address.state} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                  className="input-field" placeholder="State" />
                <input value={form.address.pincode} onChange={e => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })}
                  className="input-field" placeholder="Pincode" maxLength={6} />
              </div>
            </div>

            <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex items-center gap-2">
              {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </form>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Change Password</h3>
          <form onSubmit={handlePwdSubmit} className="space-y-4 max-w-md">
            {[
              { key: 'currentPassword', label: 'Current Password', show: showPwd.current, toggle: () => setShowPwd(p => ({ ...p, current: !p.current })) },
              { key: 'newPassword', label: 'New Password', show: showPwd.new, toggle: () => setShowPwd(p => ({ ...p, new: !p.new })) },
              { key: 'confirm', label: 'Confirm New Password', show: showPwd.new },
            ].map(({ key, label, show, toggle }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">{label}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input type={show ? 'text' : 'password'} value={pwdForm[key]}
                    onChange={e => setPwdForm({ ...pwdForm, [key]: e.target.value })}
                    className="input-field pl-10 pr-10" required minLength={key !== 'currentPassword' ? 8 : 1} />
                  {toggle && (
                    <button type="button" onClick={toggle} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600">
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={pwdMutation.isPending} className="btn-primary flex items-center gap-2">
              {pwdMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              Update Password
            </button>
          </form>
        </motion.div>
      )}

      {/* Referral Tab */}
      {activeTab === 'referral' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Referral Code */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🎁 Your Referral Code</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Share this code and earn ₹50 for every friend who joins!</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-lg font-mono font-bold text-primary-600 tracking-widest">{user?.referralCode}</p>
              </div>
              <button onClick={copyReferral} className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'btn-primary'}`}>
                {copied ? <><CheckCircle size={15} /> Copied!</> : <><Copy size={15} /> Copy</>}
              </button>
            </div>
          </div>

          {/* Loyalty Points */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">⭐ Loyalty Points</h3>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Star size={28} className="text-white fill-white" />
              </div>
              <div>
                <p className="text-3xl font-display font-black text-gray-900 dark:text-white">{user?.loyaltyPoints || 0}</p>
                <p className="text-sm text-gray-500">Points earned</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">How to earn points:</p>
              {[
                { action: 'Place an order', points: '+10 points' },
                { action: 'Order delivered', points: '+20 points' },
                { action: 'Write a review', points: '+15 points' },
                { action: 'Refer a friend', points: '+100 points' },
                { action: 'Email verification', points: '+50 points' },
              ].map(({ action, points }) => (
                <div key={action} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{action}</span>
                  <span className="text-sm font-semibold text-primary-600">{points}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                💡 <strong>100 points = ₹10</strong> wallet credit. Redeem at checkout!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
