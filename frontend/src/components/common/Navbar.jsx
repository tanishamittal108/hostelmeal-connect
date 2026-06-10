import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, Bell, ShoppingCart, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Providers', path: '/providers' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useSelector(s => s.ui);
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const { unreadCount } = useSelector(s => s.notifications);
  const cartCount = useSelector(s => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    const paths = { student: '/student', provider: '/provider', delivery: '/delivery', admin: '/admin' };
    return paths[user?.role] || '/';
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50'
          : 'bg-transparent'
      }`}
    >
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow">
              <span className="text-white text-lg">🍛</span>
            </div>
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white hidden sm:block">
              HostelMeal<span className="text-primary-500">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated && user ? (
              <>
                {/* Cart */}
                {user.role === 'student' && (
                  <button
                    onClick={() => navigate('/student/checkout')}
                    className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Notifications */}
                <button
                  onClick={() => navigate(`${getDashboardPath()}/notifications`)}
                  className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center">
                      {user.avatar?.url ? (
                        <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block max-w-20 truncate">{user.name}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                        <div className="p-2">
                          <button onClick={() => { navigate(getDashboardPath()); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <LayoutDashboard size={16} /> Dashboard
                          </button>
                          <button onClick={() => { navigate(`${getDashboardPath()}/profile`); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <User size={16} /> Profile
                          </button>
                          <hr className="my-1 border-gray-100 dark:border-gray-800" />
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <LogOut size={16} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="container-app py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1 btn-secondary text-center text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="flex-1 btn-primary text-center text-sm" onClick={() => setMenuOpen(false)}>Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
