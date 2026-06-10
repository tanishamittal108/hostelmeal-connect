import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, Heart, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Daily Order',
    emoji: '🍽️',
    price: { daily: 85, monthly: null },
    description: 'Order karo jab mann kare. No commitment.',
    icon: Heart,
    color: 'from-blue-500 to-cyan-500',
    badge: null,
    features: [
      { text: 'Vote for daily menu', included: true },
      { text: 'Order anytime', included: true },
      { text: 'Wallet payments', included: true },
      { text: 'Real-time tracking', included: true },
      { text: 'Monthly discount', included: false },
      { text: 'Priority support', included: false },
      { text: 'Streak rewards', included: false },
      { text: 'Skip day option', included: false },
    ],
    cta: 'Order Daily',
    ctaPath: '/register',
  },
  {
    name: 'Weekly Plan',
    emoji: '📅',
    price: { daily: 75, monthly: 525 },
    description: '7 din ka plan. Save ₹70 vs daily ordering.',
    icon: Zap,
    color: 'from-primary-500 to-orange-500',
    badge: 'Popular',
    features: [
      { text: 'Vote for daily menu', included: true },
      { text: 'Order anytime', included: true },
      { text: 'Wallet payments', included: true },
      { text: 'Real-time tracking', included: true },
      { text: '12% weekly discount', included: true },
      { text: 'Priority support', included: false },
      { text: 'Streak rewards', included: true },
      { text: 'Skip day option', included: true },
    ],
    cta: 'Get Weekly Plan',
    ctaPath: '/register',
  },
  {
    name: 'Monthly Plan',
    emoji: '👑',
    price: { daily: 67, monthly: 2000 },
    description: '30 din ka plan. Save ₹550 vs daily ordering!',
    icon: Crown,
    color: 'from-purple-500 to-violet-500',
    badge: 'Best Value',
    features: [
      { text: 'Vote for daily menu', included: true },
      { text: 'Order anytime', included: true },
      { text: 'Wallet payments', included: true },
      { text: 'Real-time tracking', included: true },
      { text: '21% monthly discount', included: true },
      { text: 'Priority support', included: true },
      { text: 'Streak rewards + badges', included: true },
      { text: 'Skip day option', included: true },
    ],
    cta: 'Get Monthly Plan',
    ctaPath: '/register',
    highlighted: true,
  },
];

const faqs = [
  {
    q: 'Kya main bich mein subscription cancel kar sakta hoon?',
    a: 'Haan! Aap subscription pause ya cancel kar sakte hain. Remaining days ka refund wallet mein aata hai.',
  },
  {
    q: 'Agar ek din food nahi chahiye toh?',
    a: 'Weekly aur Monthly plan mein "Skip Day" feature hai. Ek din pehle skip kar do, woh meal count save ho jaata hai.',
  },
  {
    q: 'Payment methods kya hain?',
    a: 'Razorpay (UPI, cards, netbanking), Wallet balance, aur subscription auto-debit — sab available hai.',
  },
  {
    q: 'Delivery kab hoti hai?',
    a: 'Har shaam 8 PM se 9 PM ke beech. OTP verified secure delivery hoti hai.',
  },
  {
    q: 'Kya plan change ho sakta hai?',
    a: 'Bilkul! Current plan expire hone par nayi plan choose karo — upgrade/downgrade dono possible hain.',
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200 pt-24 pb-16">
      <div className="container-app">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 rounded-full text-sm text-green-700 font-medium mb-4">
            💰 Save up to 21% with subscription
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Simple, <span className="gradient-text">Student-Friendly</span> Pricing
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
            Koi hidden charges nahi. Jitna order karo utna pay karo — ya subscribe karke save karo!
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative card p-6 flex flex-col ${plan.highlighted ? 'ring-2 ring-primary-500 shadow-glow' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${plan.color} shadow-md`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <span className="text-2xl">{plan.emoji}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-display font-black text-gray-900 dark:text-white">₹{plan.price.daily}</span>
                  <span className="text-gray-400 text-sm mb-2">/meal</span>
                </div>
                {plan.price.monthly && (
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-bold text-primary-600">₹{plan.price.monthly}</span> total per month
                  </p>
                )}
                {!plan.price.monthly && (
                  <p className="text-sm text-gray-400 mt-1">Pay per order</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(({ text, included }) => (
                  <li key={text} className="flex items-center gap-3 text-sm">
                    {included ? (
                      <Check size={15} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <X size={15} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    )}
                    <span className={included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={plan.ctaPath}
                className={`w-full text-center py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {plan.cta} <ArrowRight size={15} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* How Pricing Works */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="card p-8 mb-16">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6 text-center">
            💡 Pricing Kaise Kaam Karta Hai?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🗳️', title: 'Vote Karo', desc: 'Shaam 6–7 PM mein vote karo. Jyada votes wala sabzi aur sweet dish banegi.' },
              { icon: '⚡', title: 'Dynamic Price', desc: 'Jyada demand hogi toh price thoda adjust hoga (max 20% hi). Fair aur transparent.' },
              { icon: '💰', title: 'Subscribe & Save', desc: 'Monthly plan lo aur ₹550+ bachao. Wallet mein top-up karo aur instantly pay karo.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center p-4">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Savings Calculator */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-500 to-orange-500 rounded-3xl p-8 mb-16 text-white">
          <h2 className="text-2xl font-display font-bold mb-6 text-center">📊 Monthly Savings Calculator</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { label: 'Daily Ordering (30 days)', price: '₹2,550', sub: '₹85 × 30 days', highlight: false },
              { label: 'Weekly Plan (4 weeks)', price: '₹2,100', sub: '₹525 × 4 weeks', highlight: false },
              { label: 'Monthly Plan', price: '₹2,000', sub: 'Save ₹550 vs daily!', highlight: true },
            ].map(({ label, price, sub, highlight }) => (
              <div key={label} className={`p-5 rounded-2xl ${highlight ? 'bg-white text-primary-600 shadow-lg scale-105' : 'bg-white/20'}`}>
                <p className={`text-sm font-medium mb-2 ${highlight ? 'text-primary-500' : 'text-primary-100'}`}>{label}</p>
                <p className={`text-3xl font-display font-black mb-1 ${highlight ? 'text-primary-600' : 'text-white'}`}>{price}</p>
                <p className={`text-xs ${highlight ? 'text-green-600 font-bold' : 'text-primary-200'}`}>{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white text-center mb-8">
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{faq.q}</span>
                  <span className={`text-2xl text-primary-500 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-5 pb-5"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
            Ready to Get Started?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Register free • No credit card required • Cancel anytime</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
            Start Ordering Today <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
