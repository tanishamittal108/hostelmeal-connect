import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { registerUser } from '../../store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading } = useSelector(s => s.auth);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    role: searchParams.get('role') || 'student', referralCode: ''
  });

  const roles = [
    { value: 'student', label: 'Student', emoji: '🎓', desc: 'Order daily meals' },
    { value: 'provider', label: 'Home Chef', emoji: '👨‍🍳', desc: 'Cook & earn' },
    { value: 'delivery', label: 'Delivery', emoji: '🛵', desc: 'Deliver & earn' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      const paths = { student: '/student', provider: '/provider', delivery: '/delivery' };
      navigate(paths[role] || '/');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-primary-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="text-6xl mb-6">🏠</div>
          <h2 className="text-4xl font-display font-bold text-white mb-4">Join the Family!</h2>
          <p className="text-orange-100 max-w-xs text-lg">Register in under 2 minutes and get ₹25 welcome bonus in your wallet!</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-orange-600 rounded-xl flex items-center justify-center"><span className="text-white text-lg">🍛</span></div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">HostelMeal<span className="text-primary-500">Connect</span></span>
          </div>

          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link></p>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">I am a...</p>
            <div className="grid grid-cols-3 gap-3">
              {roles.map(({ value, label, emoji, desc }) => (
                <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${form.role === value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-200'}`}>
                  <div className="text-2xl mb-1">{emoji}</div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative"><User size={17} className="absolute left-3.5 top-3.5 text-gray-400" /><input type="text" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field pl-10" required /></div>
            <div className="relative"><Mail size={17} className="absolute left-3.5 top-3.5 text-gray-400" /><input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field pl-10" required /></div>
            <div className="relative"><Phone size={17} className="absolute left-3.5 top-3.5 text-gray-400" /><input type="tel" placeholder="Phone number (10 digits)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field pl-10" /></div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input type={showPwd ? 'text' : 'password'} placeholder="Password (min. 8 characters)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field pl-10 pr-10" required minLength={8} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-3.5 text-gray-400">{showPwd ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            <div className="relative"><span className="absolute left-3.5 top-3 text-gray-400 text-sm">🎁</span><input type="text" placeholder="Referral code (optional)" value={form.referralCode} onChange={e => setForm({ ...form, referralCode: e.target.value })} className="input-field pl-10 uppercase" /></div>
            <p className="text-xs text-gray-400">By registering, you agree to our Terms of Service and Privacy Policy.</p>
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
