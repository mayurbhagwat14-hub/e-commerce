import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { addToCart } from '../../features/cart/cartSlice';
import { toggleWishlist } from '../../features/products/productSlice';
import { fetchProfile } from '../../features/auth/authSlice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const isWishlisted = user?.wishlist?.some(
    (item) => (item._id || item) === product._id
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err || 'Failed to add item to cart');
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to modify wishlist');
      return;
    }
    try {
      await dispatch(toggleWishlist(product._id)).unwrap();
      await dispatch(fetchProfile()); // Sync user profile wishlist
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      toast.error(err || 'Wishlist update failed');
    }
  };

  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="glass-card flex flex-col justify-between rounded-2xl overflow-hidden group shadow-lg border border-white/5 bg-slate-900/40"
    >
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden aspect-square bg-slate-950/20">
        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full glass-panel hover:bg-slate-800 transition-all duration-200"
        >
          <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-300 hover:text-red-500'}`} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-xxs font-bold bg-accent text-slate-950 uppercase tracking-wider">
            {discountPercent}% OFF
          </span>
        )}

        {/* Image */}
        <img
          src={product.images[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-xxs uppercase tracking-wider font-semibold text-secondary mb-1 block">
            {product.category?.name || 'Category'}
          </span>

          {/* Name */}
          <Link to={`/products/${product._id}`}>
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-secondary line-clamp-1 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Ratings */}
          <div className="flex items-center space-x-1.5 mt-2">
            <div className="flex items-center text-accent">
              <Star className="h-3.5 w-3.5 fill-accent" />
              <span className="text-xs font-bold text-slate-200 ml-1">{product.rating || '0.0'}</span>
            </div>
            <span className="text-xxs text-slate-400">({product.numReviews} reviews)</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          {/* Pricing */}
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xxs line-through text-slate-400">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-base font-extrabold text-white">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Add to Cart Button */}
          {product.inventory > 0 ? (
            <button
              onClick={handleAddToCart}
              className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
            </button>
          ) : (
            <span className="text-xxs font-bold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-lg">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
