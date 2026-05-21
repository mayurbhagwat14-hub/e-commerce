import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export const PaymentSuccess = () => {
  return (
    <div className="py-20 max-w-md mx-auto text-center space-y-6">
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle className="h-10 w-10 text-green-400" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white">Payment Successful!</h1>
        <p className="text-xs text-slate-400">
          Thank you for your purchase. Your order has been placed successfully and is being processed.
        </p>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/30 text-xs space-y-4">
        <p className="text-slate-300 leading-relaxed">
          Order updates will be sent to your account profile. You can monitor progress in real-time under your order history dashboard.
        </p>
        <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500">
          <Calendar className="h-3.5 w-3.5" /> <span>Estimated Delivery: 3-5 Working Days</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Link
          to="/orders"
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors border border-white/5 flex items-center justify-center space-x-2"
        >
          <span>View Orders</span> <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/products"
          className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-xs font-bold transition-opacity flex items-center justify-center space-x-2"
        >
          <ShoppingBag className="h-4 w-4" /> <span>Continue Shop</span>
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
