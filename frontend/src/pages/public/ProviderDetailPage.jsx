import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, ChefHat, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProviderDetailPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-dark-200">
      <div className="container-app max-w-4xl">
        <Link to="/providers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
          <ArrowLeft size={16} /> Back to Providers
        </Link>
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">👩‍🍳</div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Provider Detail</h1>
          <p className="text-gray-500 mb-4">Provider ID: {id}</p>
          <p className="text-gray-400 text-sm mb-6">Full provider detail page with menu, reviews, and ordering is available when connected to the backend API.</p>
          <Link to="/register" className="btn-primary">Register to Order</Link>
        </div>
      </div>
    </div>
  );
}
