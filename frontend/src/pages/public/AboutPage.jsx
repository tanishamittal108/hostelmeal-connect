import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, ChefHat, Truck, ArrowRight, Star, Shield, Zap } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const team = [
  { name: 'Arjun Sharma', role: 'Founder & CEO', emoji: '👨‍💻', desc: 'Ex-hostelite who got tired of bad canteen food. Built HostelMeal to fix that.' },
  { name: 'Priya Patel', role: 'Head of Operations', emoji: '👩‍💼', desc: 'Manages 100+ home chefs across 5 cities. Food quality is her obsession.' },
  { name: 'Rahul Verma', role: 'Lead Engineer', emoji: '🧑‍💻', desc: 'Built the real-time voting system that makes HostelMeal unique.' },
  { name: 'Sunita Devi', role: 'Star Home Chef', emoji: '👩‍🍳', desc: 'Our first provider. Has fed 10,000+ students with her legendary dal baati!' },
];

const milestones = [
  { year: '2022', title: 'The Idea', desc: 'Arjun eats bad hostel food for 3rd time that week. Decides to build something better.' },
  { year: '2023', title: 'First 10 Chefs', desc: 'Launched in Jaipur with 10 home chefs and 50 students. Voting system born!' },
  { year: '2023', title: '1000 Students', desc: 'Word spread fast. 1000 students in 3 months. ₹10L GMV in first year.' },
  { year: '2024', title: 'Pan-India', desc: '5 cities, 120+ chefs, 2400+ students. ₹1Cr+ meals delivered!' },
];

const values = [
  { icon: Heart, title: 'Food with Love', desc: 'Every meal is cooked by a real person who cares — just like your mother.', color: 'from-pink-500 to-rose-500' },
  { icon: Shield, title: 'Trust & Safety', desc: 'FSSAI verified kitchens, OTP delivery, and transparent reviews for every chef.', color: 'from-blue-500 to-indigo-500' },
  { icon: Zap, title: 'Student First', desc: 'Affordable pricing, easy UX, and features built for busy students.', color: 'from-yellow-500 to-orange-500' },
  { icon: Users, title: 'Community', desc: 'Building a community of students, chefs, and delivery partners who support each other.', color: 'from-green-500 to-emerald-500' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-200 pt-24">

      {/* Hero */}
      <section className="section bg-mesh">
        <div className="container-app">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-center max-w-3xl mx-auto">
            <motion.div variants={fadeUp} className="text-6xl mb-6">🍛</motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
              We Believe Every Student Deserves <span className="gradient-text">Ghar Jaisa Khana</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              HostelMeal Connect was born from a simple frustration — hostel food is terrible. We built a platform that connects students with verified home chefs, making authentic home-cooked meals accessible to everyone.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '2,400+', label: 'Happy Students', emoji: '🎓' },
              { value: '120+', label: 'Verified Chefs', emoji: '👨‍🍳' },
              { value: '18,000+', label: 'Meals Delivered', emoji: '🍱' },
              { value: '5', label: 'Cities', emoji: '🏙️' },
            ].map(({ value, label, emoji }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-3xl mb-2">{emoji}</div>
                <p className="text-3xl font-display font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container-app">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-2 mb-6">
                Started with a Simple Question: <em>"Why Can't Hostel Food Taste Like Home?"</em>
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  In 2022, our founder Arjun was a 3rd year engineering student at a hostel in Jaipur. Every day, he'd eat the same bland canteen food and miss his mother's cooking.
                </p>
                <p>
                  He noticed that many local aunties and home chefs could cook amazing food but had no way to reach students directly. Delivery apps were too expensive and not designed for daily tiffin.
                </p>
                <p>
                  So he built HostelMeal Connect — a platform where students vote for what they want to eat, home chefs cook exactly that, and nearby hotels/delivery partners bring it to the hostel door.
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Today, we've served 18,000+ meals and the mission remains the same: <span className="gradient-text">Ghar Jaisa Khana, Hostel Tak.</span>
                </p>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-4">
              {milestones.map(({ year, title, desc }, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                      {year.slice(2)}
                    </div>
                    {i < milestones.length - 1 && <div className="w-0.5 h-full bg-primary-100 dark:bg-primary-900/30 mt-2" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs text-primary-600 font-semibold mb-0.5">{year}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-gray-50 dark:bg-dark-100">
        <div className="container-app">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-3">Our Values</h2>
            <p className="text-gray-500 dark:text-gray-400">What drives every decision we make</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} className="card p-6 text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container-app">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-3">Meet the Team</h2>
            <p className="text-gray-500 dark:text-gray-400">The people who make ghar ka khana reach your hostel</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(({ name, role, emoji, desc }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-orange-100 dark:from-primary-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {emoji}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{name}</h3>
                <p className="text-sm text-primary-600 font-medium mb-3">{role}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-r from-primary-500 to-orange-600">
        <div className="container-app text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-display font-bold text-white mb-4">Join the HostelMeal Family</h2>
            <p className="text-primary-100 mb-8 max-w-md mx-auto">Whether you're a student, chef, or delivery partner — there's a place for you here.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register" className="px-6 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-md flex items-center gap-2">
                Join as Student <ArrowRight size={16} />
              </Link>
              <Link to="/register?role=provider" className="px-6 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2">
                Become a Chef <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
