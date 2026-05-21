import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { fetchProfile } from '../features/auth/authSlice';
import ProductCard from '../components/product/ProductCard';

export const Wishlist = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (!user) {
    return (
      <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5 max-w-md mx-auto mt-10">
        <Heart className="h-10 w-10 mx-auto text-slate-500 mb-4" />
        <h3 className="text-lg font-bold text-white">Login to View Wishlist</h3>
        <p className="text-xs text-slate-400 mt-1">Please sign in to view items added to your wishlist.</p>
        <Link to="/login" className="mt-6 inline-block px-6 py-2 rounded-full bg-primary text-white text-xs font-bold shadow">
          Sign In
        </Link>
      </div>
    );
  }

  const wishlist = user.wishlist || [];

  return (
    <div className="py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <Heart className="h-6 w-6 mr-2 text-red-500 fill-red-500" /> Your Wishlist
        </h1>
        <p className="text-xs text-slate-400 mt-1">Keep track of your favorite products.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5 max-w-md mx-auto">
          <Heart className="h-10 w-10 mx-auto text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-400 mt-1">Add items from the store to catalog your favorites.</p>
          <Link to="/products" className="mt-6 inline-block px-6 py-2 rounded-full bg-primary text-white text-xs font-bold shadow">
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
