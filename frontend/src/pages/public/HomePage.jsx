import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Star, Users, ChefHat, Truck, Vote, Clock, Shield, Zap, Heart, CheckCircle } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function AnimSection({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Vote, title: 'Daily Voting System', desc: 'Vote for your favourite sabji & sweet dish every evening 6–7 PM. Community decides the menu!', color: 'from-purple-500 to-violet-500' },
  { icon: Clock, title: 'Hot Food by 8–9 PM', desc: 'Fresh home-cooked meals delivered to your hostel door every evening. Never miss dinner again.', color: 'from-orange-500 to-red-500' },
  { icon: ChefHat, title: 'Verified Home Chefs', desc: 'FSSAI certified home chefs and aunties cook with love, hygiene, and fresh ingredients daily.', color: 'from-green-500 to-emerald-500' },
  { icon: Zap, title: 'Real-time Tracking', desc: 'Live order tracking with OTP verified delivery. Know exactly where your food is.', color: 'from-blue-500 to-cyan-500' },
  { icon: Heart, title: 'Monthly Subscriptions', desc: 'Subscribe and save. Get consistent home food every day without the hassle of daily ordering.', color: 'from-pink-500 to-rose-500' },
  { icon: Shield, title: 'Secure Payments', desc: 'Razorpay, wallet & UPI payments. Refunds processed instantly on cancellation.', color: 'from-indigo-500 to-purple-500' },
];

const stats = [
  { value: '2,400+', label: 'Happy Students', icon: Users },
  { value: '120+', label: 'Home Chefs', icon: ChefHat },
  { value: '18,000+', label: 'Meals Delivered', icon: Truck },
  { value: '4.8 ★', label: 'Average Rating', icon: Star },
];

const howItWorks = [
  { step: '01', title: 'Browse Providers', desc: 'Find nearby home chefs and check their menus, ratings, and reviews.' },
  { step: '02', title: "Vote for Today's Menu", desc: 'Cast your vote from 6–7 PM for your favourite sabji and sweet dish.' },
  { step: '03', title: 'Order or Subscribe', desc: 'Place a daily order or subscribe monthly and save up to 20%.' },
  { step: '04', title: 'Get it Delivered', desc: 'Fresh food delivered to your hostel by 8–9 PM. Enjoy! 🍛' },
];

const testimonials = [
  { name: 'Rahul Kumar', hostel: 'Shiv Nagar Boys Hostel', rating: 5, text: 'Finally ghar jaisa khana hostel mein! Palak paneer aur gulab jamun voting waala feature toh zabardast hai 🔥', avatar: '👨‍🎓' },
  { name: 'Priya Sharma', hostel: 'Laxmi Girls Hostel', rating: 5, text: 'Sunita aunty ki dal makhani ka koi competitor nahi. Monthly subscription liya aur ₹400 save ho gaye!', avatar: '👩‍🎓' },
  { name: 'Amit Singh', hostel: 'Engineering Hostel B', rating: 4, text: 'Delivery tracking bahut smooth hai. OTP system se trust bhi milta hai. Highly recommend!', avatar: '🧑‍💻' },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-mesh pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-200/20 dark:bg-orange-900/10 rounded-full blur-3xl" />
        </div>

        <div className="container-app py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-full text-sm text-primary-700 dark:text-primary-300 font-medium mb-6">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                🎉 2,400+ Students Already Joined
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight text-gray-900 dark:text-white mb-6">
                Ghar Jaisa<br />
                <span className="gradient-text">Khana,</span><br />
                Hostel Tak 🍛
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
                Vote for today's menu, subscribe monthly, and get authentic home-cooked meals delivered to your hostel every evening. No more canteen food!
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary flex items-center gap-2 group">
                  Start Ordering
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/providers" className="btn-secondary flex items-center gap-2">Explore Chefs</Link>
              </div>

              <div className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-3">
                  {['👨‍🎓','👩‍🎓','🧑‍💻','👩‍🏫'].map((emoji, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-900 bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center text-base">{emoji}</div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400 text-sm">★★★★★</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">4.8/5 from 800+ reviews</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Card */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block">
              <div className="relative">
                <div className="glass-card p-6 rounded-3xl max-w-sm mx-auto shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Today's Menu</p>
                      <p className="font-display font-bold text-gray-900 dark:text-white">Sunita's Kitchen 🏠</p>
                    </div>
                    <span className="badge-primary animate-pulse">Voting Open</span>
                  </div>

                  <div className="space-y-2 mb-5">
                    {[{ name: 'Palak Paneer', pct: 78 }, { name: 'Dal Makhani', pct: 52 }, { name: 'Rajma', pct: 41 }].map(item => (
                      <div key={item.name} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-28 truncate">{item.name}</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }} className="vote-bar" />
                        </div>
                        <span className="text-xs font-bold text-primary-600 w-8 text-right">{item.pct}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">₹85 <span className="text-xs text-gray-400 font-normal line-through">₹100</span></p>
                    </div>
                    <Link to="/register" className="btn-primary text-sm py-2">Order Now</Link>
                  </div>
                </div>

                <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 glass-card px-3 py-2 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 shadow-lg">
                  🔔 Menu finalized at 7 PM!
                </motion.div>
                <motion.div animate={{ y: [0,8,0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 glass-card px-3 py-2 rounded-xl text-sm font-semibold text-green-600 shadow-lg">
                  ✅ 247 students voted
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <AnimSection className="container-app grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label, icon: Icon }) => (
            <motion.div key={label} variants={fadeUp} className="text-center">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon size={22} className="text-primary-500" />
              </div>
              <p className="text-3xl font-display font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </AnimSection>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container-app">
          <AnimSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need for <span className="gradient-text">Daily Meals</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">From voting to delivery, we've built a complete ecosystem for hostel food</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc, color }) => (
                <motion.div key={title} variants={fadeUp} whileHover={{ y: -4 }} className="card p-6 group cursor-default">
                  <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-all`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-gray-50 dark:bg-dark-100">
        <div className="container-app">
          <AnimSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">How It <span className="gradient-text">Works</span></h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map(({ step, title, desc }) => (
                <motion.div key={step} variants={fadeUp} className="relative">
                  <div className="text-6xl font-display font-black text-primary-100 dark:text-primary-900/30 mb-2 leading-none">{step}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container-app">
          <AnimSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">Students <span className="gradient-text">Love Us</span></h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map(({ name, hostel, rating, text, avatar }) => (
                <motion.div key={name} variants={fadeUp} className="card p-6">
                  <div className="flex text-yellow-400 mb-3">{'★'.repeat(rating)}</div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center text-lg">{avatar}</div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{name}</p>
                      <p className="text-xs text-gray-400">{hostel}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-r from-primary-500 to-orange-600">
        <AnimSection className="container-app text-center">
          <motion.div variants={fadeUp}>
            <h2 className="text-4xl font-display font-bold text-white mb-4">Ready for Ghar Jaisa Khana?</h2>
            <p className="text-primary-100 max-w-md mx-auto mb-8">Join 2,400+ students who never eat bad hostel food again. Register free today!</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register" className="px-8 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg">Join as Student</Link>
              <Link to="/register?role=provider" className="px-8 py-3 bg-primary-600/30 border-2 border-white text-white font-bold rounded-xl hover:bg-primary-600/50 transition-colors">Register as Chef</Link>
            </div>
          </motion.div>
        </AnimSection>
      </section>
    </div>
  );
}
