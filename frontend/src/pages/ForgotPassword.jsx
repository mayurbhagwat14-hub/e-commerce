import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, ShieldAlert } from 'lucide-react';
import api from '../utils/axios';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message || 'Reset link sent to your email!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 max-w-md mx-auto">
      <div className="glass-card rounded-3xl border border-white/5 bg-slate-900/40 p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-white/5 pb-4">
          <Link to="/login" className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <h1 className="text-lg font-bold text-white">Reset Password</h1>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Enter your registered email address below. We'll send you a secure link to reset your account password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xxs text-slate-400 block uppercase tracking-wider font-semibold">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input px-3 py-2.5 pl-10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="h-4 w-4" /> <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
