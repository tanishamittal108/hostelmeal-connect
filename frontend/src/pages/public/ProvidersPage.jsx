import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, Clock, ChefHat, Filter, CheckCircle, Utensils } from 'lucide-react';

const mockProviders = [
  {
    _id: '1',
    businessName: 'Sunita Tiffin Service',
    description: 'Ghar jaisa Rajasthani khana — dal baati, ker sangri, aur fresh roti har roz ❤️',
    cuisineTypes: ['North Indian', 'Rajasthani'],
    avgRating: 4.8,
    totalRatings: 124,
    basePrice: 80,
    kitchenAddress: { city: 'Jaipur', state: 'Rajasthan' },
    isAvailable: true,
    totalOrdersServed: 120,
    emoji: '👩‍🍳',
    badge: 'Top Rated',
    deliveryTime: '8–9 PM',
    speciality: 'Dal Baati Churma',
  },
  {
  _id: '2',
    businessName: 'Meena Rasoi - Talwandi',
    description: 'Talwandi area ki sabse popular tiffin service. Engineering students ki favourite! 🎓',
    cuisineTypes: ['North Indian', 'Rajasthani'],
    avgRating: 4.6,
    totalRatings: 98,
    basePrice: 75,
    kitchenAddress: { city: 'Kota', state: 'Rajasthan' },
    isAvailable: true,
    totalOrdersServed: 980,
    emoji: '🍱',
    badge: 'Best Value',
    deliveryTime: '8–9 PM',
    speciality: 'Rajasthani Kadhi Pakoda',
  },
  {
    _id: '3',
    businessName: 'Shanti Bhojan - Vigyan Nagar',
    description: 'Vigyan Nagar aur Mahaveer Nagar ke students ke liye pure veg satvik khana. 🙏',
    cuisineTypes: ['Satvik', 'North Indian'],
    avgRating: 4.5,
    totalRatings: 76,
    basePrice: 70,
    kitchenAddress: { city: 'Kota', state: 'Rajasthan' },
    isAvailable: true,
    totalOrdersServed: 760,
    emoji: '🙏',
    badge: null,
    deliveryTime: '8–9 PM',
    speciality: 'Panchmel Dal',
  },
  {
   _id: '4',
    businessName: 'Radha Kitchen - Jawahar Nagar',
    description: 'Jawahar Nagar colony mein 5 saal se chalti aai hai ye tiffin service. Trusted by 100+ families.',
    cuisineTypes: ['North Indian', 'Punjabi'],
    avgRating: 4.3,
    totalRatings: 54,
    basePrice: 80,
    kitchenAddress: { city: 'Kota', state: 'Rajasthan' },
    isAvailable: true,
    totalOrdersServed: 540,
    emoji: '🥘',
    badge: null,
    deliveryTime: '8–9 PM',
    speciality: 'Butter Dal Fry',
  },
  {
    _id: '5',
    businessName: 'Annapurna Tiffin - Kunhari',
    description: 'Kunhari kalan area. Subah nashta bhi milta hai! Poha, upma, paratha — sab fresh.',
    cuisineTypes: ['North Indian', 'Rajasthani'],
    avgRating: 4.7,
    totalRatings: 112,
    basePrice: 85,
    kitchenAddress: { city: 'Kota', state: 'Rajasthan' },
    isAvailable: true,
    totalOrdersServed: 1120,
    emoji: '🍛',
    badge: 'Most Popular',
    deliveryTime: '8–9 PM',
    speciality: 'Laal Maas (Veg)',
  },
  {
    _id: '6',
    businessName: 'Kavita Didi Tiffin - Dadabari',
    description: 'Dadabari aur Nayapura area ke coaching students ke liye affordable daily tiffin. 💪',
    cuisineTypes: ['North Indian'],
    avgRating: 4.2,
    totalRatings: 41,
    basePrice: 65,
    kitchenAddress: { city: 'Kota', state: 'Rajasthan' },
    isAvailable: false,
    totalOrdersServed: 410,
    emoji: '🏠',
    badge: 'Budget Pick',
    deliveryTime: '8–9 PM',
    speciality: 'Ghar Ki Dal Sabji',
  },
];

const cuisineFilters = ['All', 'North Indian', 'South Indian', 'Gujarati', 'Rajasthani', 'Punjabi'];

export default function ProvidersPage() {
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  const filtered = mockProviders
    .filter(p => {
      const matchSearch = p.businessName.toLowerCase().includes(search.toLowerCase()) ||
        p.kitchenAddress.city.toLowerCase().includes(search.toLowerCase());
      const matchCuisine = cuisine === 'All' || p.cuisineTypes.includes(cuisine);
      const matchAvail = !onlyAvailable || p.isAvailable;
      return matchSearch && matchCuisine && matchAvail;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.avgRating - a.avgRating;
      if (sortBy === 'price') return a.basePrice - b.basePrice;
      if (sortBy === 'orders') return b.totalOrdersServed - a.totalOrdersServed;
      return 0;
    });

  const badgeColors = {
    'Top Rated': 'bg-yellow-100 text-yellow-700',
    'Best Value': 'bg-green-100 text-green-700',
    'Most Popular': 'bg-purple-100 text-purple-700',
    'Budget Pick': 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200 pt-24 pb-16">
      <div className="container-app">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-full text-sm text-primary-700 dark:text-primary-300 font-medium mb-4">
            🍳 {mockProviders.filter(p => p.isAvailable).length} Chefs Available Today
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Find Your <span className="gradient-text">Home Chef</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
            FSSAI verified home chefs delivering authentic ghar ka khana to your hostel every evening
          </p>
        </motion.div>

        {/* Search + Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by chef name or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-full md:w-44">
              <option value="rating">⭐ Top Rated</option>
              <option value="price">💰 Lowest Price</option>
              <option value="orders">📦 Most Orders</option>
            </select>

            {/* Available toggle */}
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all whitespace-nowrap ${
                onlyAvailable
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <CheckCircle size={15} />
              Available Now
            </button>
          </div>

          {/* Cuisine filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            {cuisineFilters.map(c => (
              <button key={c} onClick={() => setCuisine(c)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  cuisine === c
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> chefs
          {cuisine !== 'All' && ` for "${cuisine}"`}
          {search && ` matching "${search}"`}
        </p>

        {/* Provider Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No chefs found</h3>
            <p className="text-gray-500">Try changing your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((provider, i) => (
              <motion.div
                key={provider._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="card overflow-hidden group"
              >
                {/* Card Header */}
                <div className="relative h-36 bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center">
                  <span className="text-6xl">{provider.emoji}</span>
                  {provider.badge && (
                    <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${badgeColors[provider.badge]}`}>
                      {provider.badge}
                    </span>
                  )}
                  {!provider.isAvailable && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full">
                        Currently Unavailable
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg leading-tight">
                      {provider.businessName}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{provider.avgRating}</span>
                      <span className="text-xs text-gray-400">({provider.totalRatings})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <MapPin size={12} />
                    <span>{provider.kitchenAddress.city}, {provider.kitchenAddress.state}</span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {provider.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {provider.cuisineTypes.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-md font-medium">
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Speciality */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                    <Utensils size={12} className="text-primary-500" />
                    <span>Speciality: <span className="font-semibold text-gray-700 dark:text-gray-300">{provider.speciality}</span></span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">₹{provider.basePrice}</span>
                      <span className="text-xs text-gray-400"> /meal</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/providers/${provider._id}`}
                        className="btn-secondary text-xs py-2 px-3">
                        View Menu
                      </Link>
                      <Link to={`/register?role=student`}
                        className={`text-xs py-2 px-3 rounded-xl font-semibold transition-all ${
                          provider.isAvailable
                            ? 'btn-primary'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}>
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Banner */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-primary-500 to-orange-500 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-display font-bold text-white mb-2">Aap bhi Chef hain? 👨‍🍳</h3>
          <p className="text-primary-100 mb-6">Register as a home chef and start earning from your kitchen today!</p>
          <Link to="/register?role=provider"
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
            Register as Chef
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
