import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-200">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft size={16} /> Back to Login
          </Link>
          {sent ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Email Sent!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Check your inbox for the password reset link. It expires in 15 minutes.</p>
              <Link to="/login" className="btn-primary">Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-primary-500" />
                </div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your email and we'll send a reset link</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
