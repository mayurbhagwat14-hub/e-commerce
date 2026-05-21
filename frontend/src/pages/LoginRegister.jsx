import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { login, register, clearAuthError } from '../features/auth/authSlice';
import { ShieldCheck, UserPlus, LogIn, Mail, Lock, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Zod schemas for input validation
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const LoginRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user, loading, error } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('login');
  const redirect = searchParams.get('redirect') || '/';

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
    
    return () => {
      dispatch(clearAuthError());
    };
  }, [user, navigate, redirect, dispatch]);

  // Hook forms setup
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: regRegister,
    handleSubmit: handleRegSubmit,
    formState: { errors: regErrors },
    reset: resetRegForm
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data) => {
    try {
      await dispatch(login(data)).unwrap();
      toast.success('Logged in successfully!');
    } catch (err) {
      toast.error(err || 'Invalid login details');
    }
  };

  const onRegSubmit = async (data) => {
    try {
      await dispatch(register(data)).unwrap();
      toast.success('Registration successful!');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  const toggleTab = (tab) => {
    setActiveTab(tab);
    dispatch(clearAuthError());
    resetLoginForm();
    resetRegForm();
  };

  return (
    <div className="py-12 max-w-md mx-auto">
      <div className="glass-card rounded-3xl border border-white/5 bg-slate-900/40 p-8 shadow-2xl space-y-6">
        {/* Tab Headers */}
        <div className="flex border-b border-white/5 pb-2">
          <button
            onClick={() => toggleTab('login')}
            className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${activeTab === 'login' ? 'border-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <LogIn className="h-4 w-4" /> <span>Sign In</span>
          </button>
          <button
            onClick={() => toggleTab('register')}
            className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${activeTab === 'register' ? 'border-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <UserPlus className="h-4 w-4" /> <span>Register</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Tab View */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xxs text-slate-400 block uppercase tracking-wider font-semibold">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...loginRegister('email')}
                  className={`w-full glass-input px-3 py-2.5 pl-10 rounded-xl text-xs focus:outline-none focus:ring-1 ${loginErrors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              {loginErrors.email && <p className="text-[10px] text-red-400 font-semibold">{loginErrors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xxs text-slate-400 block uppercase tracking-wider font-semibold">Password</label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-secondary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...loginRegister('password')}
                  className={`w-full glass-input px-3 py-2.5 pl-10 rounded-xl text-xs focus:outline-none focus:ring-1 ${loginErrors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              {loginErrors.password && <p className="text-[10px] text-red-400 font-semibold">{loginErrors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
        )}

        {/* Register Tab View */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegSubmit(onRegSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xxs text-slate-400 block uppercase tracking-wider font-semibold">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  {...regRegister('name')}
                  className={`w-full glass-input px-3 py-2.5 pl-10 rounded-xl text-xs focus:outline-none focus:ring-1 ${regErrors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              {regErrors.name && <p className="text-[10px] text-red-400 font-semibold">{regErrors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xxs text-slate-400 block uppercase tracking-wider font-semibold">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...regRegister('email')}
                  className={`w-full glass-input px-3 py-2.5 pl-10 rounded-xl text-xs focus:outline-none focus:ring-1 ${regErrors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              {regErrors.email && <p className="text-[10px] text-red-400 font-semibold">{regErrors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xxs text-slate-400 block uppercase tracking-wider font-semibold">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...regRegister('password')}
                  className={`w-full glass-input px-3 py-2.5 pl-10 rounded-xl text-xs focus:outline-none focus:ring-1 ${regErrors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              {regErrors.password && <p className="text-[10px] text-red-400 font-semibold">{regErrors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;
