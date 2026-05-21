import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-slate-900/60 dark:bg-slate-950/60 backdrop-blur-md py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gradient">QUANTUMSHOP</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premium curated products crafted for high-performance lifestyles. Built with state-of-the-art technology for seamless user experiences.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Shop Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/products?category=electronics" className="hover:text-secondary transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-secondary transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=home-decor" className="hover:text-secondary transition-colors">Home Decor</Link></li>
              <li><Link to="/products?category=books" className="hover:text-secondary transition-colors">Books</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Customer Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/orders" className="hover:text-secondary transition-colors">Track Orders</Link></li>
              <li><Link to="/profile" className="hover:text-secondary transition-colors">Shipping & Returns</Link></li>
              <li><a href="#" className="hover:text-secondary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-xs text-slate-400 mb-4">
              Subscribe to receive exclusive coupons, updates, and early access sales.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input
                type="email"
                placeholder="Enter email..."
                className="w-full glass-input px-3 py-1.5 rounded-l-lg text-xs focus:outline-none"
              />
              <button className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-r-lg text-xs font-semibold">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xxs text-slate-500">
          <p>© {currentYear} QuantumShop. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
