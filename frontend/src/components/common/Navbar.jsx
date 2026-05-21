import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingCart, Heart, User, Sun, Moon, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import useTheme from '../../hooks/useTheme';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  
  const [keyword, setKeyword] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = user?.wishlist?.length || 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${keyword.trim()}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err || 'Logout failed');
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 dark:border-white/5 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              QUANTUM<span className="font-light">SHOP</span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search premium products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full glass-input px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          </form>

          {/* Actions & Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-sm font-medium hover:text-secondary transition-colors duration-200">Shop</Link>
            
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 hover:bg-white/10 dark:hover:bg-slate-800 rounded-full transition-all duration-200">
              {theme === 'dark' ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5 text-primary" />}
            </button>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative p-2 hover:bg-white/10 dark:hover:bg-slate-800 rounded-full transition-all duration-200">
              <Heart className="h-5 w-5 hover:text-red-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-slate-950 font-bold text-xxs h-4.5 w-4.5 flex items-center justify-center rounded-full scale-90">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative p-2 hover:bg-white/10 dark:hover:bg-slate-800 rounded-full transition-all duration-200">
              <ShoppingCart className="h-5 w-5 hover:text-secondary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white font-bold text-xxs h-4.5 w-4.5 flex items-center justify-center rounded-full scale-90">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center space-x-2 p-2 hover:bg-white/10 dark:hover:bg-slate-800 rounded-full transition-all duration-200 focus:outline-none"
                >
                  <User className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold max-w-[100px] truncate">{user.name}</span>
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg glass-panel py-1 border border-white/10 focus:outline-none">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdown(false)}
                      className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserDropdown(false)}
                      className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                    >
                      Order History
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center px-4 py-2 text-sm text-secondary hover:bg-white/10 transition-colors font-semibold"
                      >
                        <ShieldAlert className="h-4 w-4 mr-1.5" /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-1.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-slate-800">
              {theme === 'dark' ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5 text-primary" />}
            </button>
            
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-slate-800">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full glass-input px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          </form>

          <Link
            to="/products"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-lg hover:bg-white/10 font-medium text-sm"
          >
            Shop
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setMenuOpen(false)}
            className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-white/10 font-medium text-sm"
          >
            <span>Wishlist</span>
            {wishlistCount > 0 && <span className="bg-accent px-2 py-0.5 rounded-full text-xxs font-bold text-slate-900">{wishlistCount}</span>}
          </Link>
          <Link
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-white/10 font-medium text-sm"
          >
            <span>Cart</span>
            {cartCount > 0 && <span className="bg-primary px-2 py-0.5 rounded-full text-xxs font-bold text-white">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="border-t border-white/10 pt-3 space-y-1">
              <div className="px-3 py-1 text-xs text-slate-400">Signed in as {user.name}</div>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-white/10 text-sm"
              >
                My Profile
              </Link>
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-white/10 text-sm"
              >
                My Orders
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-secondary font-semibold"
                >
                  Admin Control Panel
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-3 py-2 rounded-lg text-red-400 hover:bg-white/10 text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block text-center w-full px-5 py-2 mt-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
