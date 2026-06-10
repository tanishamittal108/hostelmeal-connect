import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(res => { setStatus('success'); setMessage(res.data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed'); });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-200">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <><Loader2 size={48} className="text-primary-500 animate-spin mx-auto mb-4" /><p className="text-gray-600 dark:text-gray-400">Verifying your email...</p></>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Email Verified! 🎉</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">{message}</p>
            <p className="text-sm text-green-600 font-medium mb-6">₹25 welcome bonus added to your wallet!</p>
            <Link to="/login" className="btn-primary">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={56} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <Link to="/login" className="btn-secondary">Back to Login</Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
