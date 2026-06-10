import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { loginUser } from '../../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      const paths = { student: '/student', provider: '/provider', delivery: '/delivery', admin: '/admin' };
      navigate(paths[role] || '/');
    }
  };

  const demoLogin = (email, password) => setForm({ email, password });

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-orange-500 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="text-6xl mb-6 animate-float">🍛</div>
          <h2 className="text-4xl font-display font-bold text-white mb-4">Welcome Back!</h2>
          <p className="text-primary-100 max-w-xs text-lg">Ghar jaisa khana awaits you. Vote, order, and enjoy every evening.</p>
        </div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-orange-600 rounded-xl flex items-center justify-center"><span className="text-white text-lg">🍛</span></div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">HostelMeal<span className="text-primary-500">Connect</span></span>
          </div>

          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Sign In</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Don't have an account? <Link to="/register" className="text-primary-600 font-medium hover:underline">Register free</Link></p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">🔑 Demo Credentials:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Student', email: 'rahul@example.com', pwd: 'Student@123' },
                { label: 'Provider', email: 'sunita@example.com', pwd: 'Provider@123' },
                { label: 'Admin', email: 'admin@hostelmeal.com', pwd: 'Admin@123456' },
                { label: 'Delivery', email: 'ramesh@example.com', pwd: 'Delivery@123' },
              ].map(({ label, email, pwd }) => (
                <button key={label} onClick={() => demoLogin(email, pwd)}
                  className="text-xs bg-amber-100 dark:bg-amber-800/30 hover:bg-amber-200 text-amber-800 dark:text-amber-300 px-2 py-1.5 rounded-lg transition-colors font-medium">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field pl-10" required />
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input type={showPwd ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
