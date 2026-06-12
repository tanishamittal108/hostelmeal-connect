// ===================== Profile.jsx =====================
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save, Loader2, MapPin, Phone, Star, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { providerAPI } from '../../services/api';
import { PageHeader } from '../../components/common/index';
import { updateUserData } from '../../store/slices/authSlice';

export default function ProviderProfile() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();

  const { data: providerData } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => providerAPI.getOne('me').then(r => r.data.data).catch(() => null),
  });

  const [form, setForm] = useState({
    businessName: providerData?.businessName || '',
    description: providerData?.description || '',
    cuisineTypes: providerData?.cuisineTypes?.join(', ') || '',
    basePrice: providerData?.basePrice || 80,
    maxCapacity: providerData?.maxCapacity || 50,
    serviceRadius: providerData?.serviceRadius || 5,
    isAvailable: providerData?.isAvailable ?? true,
    isVegetarianOnly: providerData?.isVegetarianOnly ?? true,
    fssaiNumber: providerData?.fssaiNumber || '',
    bankDetails: {
      upiId: providerData?.bankDetails?.upiId || '',
      accountHolderName: providerData?.bankDetails?.accountHolderName || '',
      accountNumber: providerData?.bankDetails?.accountNumber || '',
      ifscCode: providerData?.bankDetails?.ifscCode || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => providerAPI.updateProfile(data),
    onSuccess: () => toast.success('Profile updated successfully!'),
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      ...form,
      cuisineTypes: form.cuisineTypes.split(',').map(c => c.trim()).filter(Boolean),
    });
  };

  const statusConfig = {
    approved: { label: 'Verified Provider', color: 'text-green-600 bg-green-50', icon: CheckCircle },
    pending: { label: 'Pending Verification', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
    rejected: { label: 'Verification Rejected', color: 'text-red-600 bg-red-50', icon: Clock },
  };
  const status = statusConfig[providerData?.status || 'pending'];

  return (
    <div>
      <PageHeader title="Provider Profile" subtitle="Manage your kitchen details and settings" />

      {/* Status Banner */}
      {status && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border mb-6 ${status.color} border-current/20`}>
          <status.icon size={20} />
          <div>
            <p className="font-semibold text-sm">{status.label}</p>
            {providerData?.status === 'pending' && (
              <p className="text-xs opacity-80">Upload your FSSAI license and kitchen photos to speed up verification</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🏠 Basic Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Business Name *</label>
              <input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })}
                className="input-field" placeholder="e.g. Sunita Tiffin Service" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">FSSAI Number</label>
              <input value={form.fssaiNumber} onChange={e => setForm({ ...form, fssaiNumber: e.target.value })}
                className="input-field" placeholder="14-digit FSSAI number" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="input-field resize-none" rows={3} placeholder="Tell students about your cooking style..." maxLength={500} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Cuisine Types</label>
              <input value={form.cuisineTypes} onChange={e => setForm({ ...form, cuisineTypes: e.target.value })}
                className="input-field" placeholder="North Indian, Rajasthani (comma separated)" />
            </div>
          </div>
        </div>

        {/* Pricing & Capacity */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">💰 Pricing & Capacity</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Base Price (₹)</label>
              <input type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: Number(e.target.value) })}
                className="input-field" min={50} max={500} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Max Capacity</label>
              <input type="number" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: Number(e.target.value) })}
                className="input-field" min={10} max={200} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Service Radius (km)</label>
              <input type="number" value={form.serviceRadius} onChange={e => setForm({ ...form, serviceRadius: Number(e.target.value) })}
                className="input-field" min={1} max={20} />
            </div>
          </div>
          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
                className="w-4 h-4 accent-primary-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Currently Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isVegetarianOnly} onChange={e => setForm({ ...form, isVegetarianOnly: e.target.checked })}
                className="w-4 h-4 accent-primary-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Vegetarian Only</span>
            </label>
          </div>
        </div>

        {/* Bank Details */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🏦 Payment Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">UPI ID</label>
              <input value={form.bankDetails.upiId} onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, upiId: e.target.value } })}
                className="input-field" placeholder="yourname@upi" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Account Holder Name</label>
              <input value={form.bankDetails.accountHolderName} onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, accountHolderName: e.target.value } })}
                className="input-field" placeholder="Full name" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Account Number</label>
              <input value={form.bankDetails.accountNumber} onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: e.target.value } })}
                className="input-field" placeholder="Bank account number" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">IFSC Code</label>
              <input value={form.bankDetails.ifscCode} onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, ifscCode: e.target.value } })}
                className="input-field" placeholder="e.g. SBIN0001234" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex items-center gap-2">
          {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
