

import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-app py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🍛</span>
              </div>
              <span className="font-display font-bold text-xl text-white">HostelMeal<span className="text-primary-400">Connect</span></span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Connecting hostel students with home chefs for authentic, nutritious, and affordable daily meals. Ghar jaisa khana, hostel tak! 🏠❤️
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[['Home', '/'], ['Providers', '/providers'], ['Pricing', '/pricing'], ['About', '/about'], ['Login', '/login']].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              {[
                [Mail, 'support@hostelmealconnect.com'],
                [Phone, '+91 98765 43210'],
                [MapPin, 'Jaipur, Rajasthan, India'],
              ].map(([Icon, text]) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-gray-400">
                  <Icon size={15} className="text-primary-400 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} HostelMeal Connect. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-primary-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-primary-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
