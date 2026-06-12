import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Eye, Send, Edit3, ChefHat, Loader2, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuAPI } from '../../services/api';
import { PageHeader, StatusBadge, EmptyState, Modal } from '../../components/common/index';
import { format } from 'date-fns';

const emptyDish = { name: '', description: '', calories: '', protein: '' };

export default function MenuManage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    basePrice: 80,
    sabjiOptions: [{ ...emptyDish }, { ...emptyDish }, { ...emptyDish }],
    dalOptions: [{ ...emptyDish }],
    rotiRiceOptions: [{ ...emptyDish }],
    sweetDishOptions: [{ ...emptyDish }, { ...emptyDish }],
  });

  const { data: menus, isLoading } = useQuery({
    queryKey: ['my-menus'],
    queryFn: () => menuAPI.getMyMenus().then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => menuAPI.createMenu(data),
    onSuccess: () => {
      toast.success('Menu created successfully!');
      queryClient.invalidateQueries(['my-menus']);
      setShowCreate(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create menu'),
  });

  const publishMutation = useMutation({
    mutationFn: (id) => menuAPI.publishMenu(id),
    onSuccess: () => {
      toast.success('Menu published! Voting is now open 🗳️');
      queryClient.invalidateQueries(['my-menus']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to publish'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => menuAPI.deleteMenu(id),
    onSuccess: () => {
      toast.success('Menu deleted');
      queryClient.invalidateQueries(['my-menus']);
    },
  });

  const updateDish = (category, index, field, value) => {
    setForm(prev => {
      const updated = [...prev[category]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [category]: updated };
    });
  };

  const addDish = (category) => {
    setForm(prev => ({ ...prev, [category]: [...prev[category], { ...emptyDish }] }));
  };

  const removeDish = (category, index) => {
    setForm(prev => ({ ...prev, [category]: prev[category].filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filtered = {
      ...form,
      sabjiOptions: form.sabjiOptions.filter(d => d.name.trim()),
      dalOptions: form.dalOptions.filter(d => d.name.trim()),
      rotiRiceOptions: form.rotiRiceOptions.filter(d => d.name.trim()),
      sweetDishOptions: form.sweetDishOptions.filter(d => d.name.trim()),
    };
    if (filtered.sabjiOptions.length < 3) return toast.error('Minimum 3 sabji options required');
    if (filtered.sweetDishOptions.length < 2) return toast.error('Minimum 2 sweet dish options required');
    createMutation.mutate(filtered);
  };

  const DishInputs = ({ category, label, emoji, min, max }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{emoji} {label}</h4>
        {form[category].length < max && (
          <button type="button" onClick={() => addDish(category)}
            className="text-xs text-primary-600 flex items-center gap-1 hover:underline">
            <Plus size={13} /> Add option
          </button>
        )}
      </div>
      <div className="space-y-3">
        {form[category].map((dish, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input placeholder={`${label} name *`} value={dish.name}
                onChange={e => updateDish(category, i, 'name', e.target.value)}
                className="input-field text-sm py-2" />
              <input placeholder="Description (optional)" value={dish.description}
                onChange={e => updateDish(category, i, 'description', e.target.value)}
                className="input-field text-sm py-2" />
            </div>
            {form[category].length > min && (
              <button type="button" onClick={() => removeDish(category, i)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg mt-0.5 transition-colors">
                <X size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Menu Manager"
        subtitle="Create and manage your daily menus"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Today's Menu
          </button>
        }
      />

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">📋 How it works:</p>
        <div className="grid sm:grid-cols-3 gap-2 text-xs text-blue-600 dark:text-blue-400">
          <span>1️⃣ Create menu with options</span>
          <span>2️⃣ Publish → voting opens 6–7 PM</span>
          <span>3️⃣ Auto-finalized at 7 PM</span>
        </div>
      </div>

      {/* Menus List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : menus?.length === 0 ? (
        <EmptyState icon="📋" title="No menus yet" description="Create your first menu to start accepting orders!"
          action={<button onClick={() => setShowCreate(true)} className="btn-primary">Create Menu</button>} />
      ) : (
        <div className="space-y-4">
          {menus?.map((menu, i) => (
            <motion.div key={menu._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {format(new Date(menu.date), 'EEEE, dd MMM yyyy')}
                    </h3>
                    <StatusBadge status={menu.status} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {menu.sabjiOptions?.slice(0, 4).map(s => (
                      <span key={s._id} className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-lg">
                        {s.name}
                      </span>
                    ))}
                    {menu.sabjiOptions?.length > 4 && (
                      <span className="text-xs text-gray-400">+{menu.sabjiOptions.length - 4} more</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>💰 ₹{menu.finalPrice || menu.basePrice}/meal</span>
                    <span>🗳️ {menu.totalVotesCast || 0} votes</span>
                    {menu.finalPrice && <span className="text-green-600 font-medium">Final: ₹{menu.finalPrice}</span>}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {menu.status === 'draft' && (
                    <>
                      <button onClick={() => publishMutation.mutate(menu._id)}
                        disabled={publishMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">
                        {publishMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Publish
                      </button>
                      <button onClick={() => deleteMutation.mutate(menu._id)}
                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  {menu.status === 'finalized' && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                      <CheckCircle size={14} /> Finalized
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Menu Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Today's Menu" size="xl">
        <form onSubmit={handleSubmit} className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Base Price (₹) *</label>
              <input type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: Number(e.target.value) })}
                className="input-field" min={50} max={300} required />
            </div>
          </div>

          <DishInputs category="sabjiOptions" label="Sabji Options" emoji="🥬" min={3} max={6} />
          <DishInputs category="dalOptions" label="Dal Options" emoji="🫕" min={1} max={3} />
          <DishInputs category="rotiRiceOptions" label="Roti/Rice Options" emoji="🍚" min={1} max={3} />
          <DishInputs category="sweetDishOptions" label="Sweet Dish Options" emoji="🍬" min={2} max={4} />

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 pb-1">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ChefHat size={16} />}
              Create Menu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
