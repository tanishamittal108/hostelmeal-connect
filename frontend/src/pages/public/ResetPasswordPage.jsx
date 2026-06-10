import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-200">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-primary-500" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Set New Password</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Choose a strong password for your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input type={show ? 'text' : 'password'} placeholder="New password" value={password} onChange={e => setPassword(e.target.value)}
                className="input-field pl-10 pr-10" required minLength={8} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-3.5 text-gray-400">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)}
                className="input-field pl-10" required minLength={8} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
