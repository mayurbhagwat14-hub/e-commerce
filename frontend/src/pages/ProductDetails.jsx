import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ShieldCheck, RefreshCw, ShoppingCart, Heart, ShieldAlert } from 'lucide-react';
import { fetchProductDetails, clearProductDetails, toggleWishlist } from '../features/products/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import { fetchProfile } from '../features/auth/authSlice';
import ReviewSection from '../components/product/ReviewSection';
import Recommendations from '../components/product/Recommendations';
import { DetailSkeleton } from '../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { productDetail, reviews, detailLoading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const isWishlisted = user?.wishlist?.some(
    (item) => (item._id || item) === productDetail?._id
  );

  useEffect(() => {
    dispatch(fetchProductDetails(id));

    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    try {
      await dispatch(addToCart({ productId: productDetail._id, quantity })).unwrap();
      toast.success(`${quantity} x ${productDetail.name} added to cart!`);
    } catch (err) {
      toast.error(err || 'Failed to add item to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to modify wishlist');
      return;
    }
    try {
      await dispatch(toggleWishlist(productDetail._id)).unwrap();
      await dispatch(fetchProfile()); // Sync user profile wishlist
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      toast.error(err || 'Wishlist update failed');
    }
  };

  if (detailLoading) return <DetailSkeleton />;

  if (error || !productDetail) {
    return (
      <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5 max-w-lg mx-auto mt-10">
        <ShieldAlert className="h-10 w-10 mx-auto text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-white">Product Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">The product details could not be retrieved, or the product does not exist.</p>
        <Link to="/products" className="mt-6 inline-block px-6 py-2 rounded-full bg-primary text-white text-xs font-bold shadow">
          Back to Shop
        </Link>
      </div>
    );
  }

  const currentPrice = productDetail.discountPrice || productDetail.price;
  const hasDiscount = !!productDetail.discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((productDetail.price - productDetail.discountPrice) / productDetail.price) * 100)
    : 0;

  return (
    <div className="py-6 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-400">
        <Link to="/" className="hover:text-secondary">Home</Link> /{' '}
        <Link to="/products" className="hover:text-secondary">Shop</Link> /{' '}
        <Link to={`/products?category=${productDetail.category?.slug}`} className="hover:text-secondary">
          {productDetail.category?.name}
        </Link>{' '}
        / <span className="text-slate-300 truncate max-w-[200px] inline-block align-bottom">{productDetail.name}</span>
      </nav>

      {/* Main product columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left Column: Product Images */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden glass-panel aspect-square border border-white/5 flex items-center justify-center bg-slate-950/20">
            <img
              src={productDetail.images[activeImage]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
              alt={productDetail.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnails */}
          {productDetail.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {productDetail.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-slate-950/20 ${activeImage === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">
              {productDetail.category?.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {productDetail.name}
            </h1>

            {/* Ratings & reviews */}
            <div className="flex items-center space-x-2.5 pt-1">
              <div className="flex items-center text-accent">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-4.5 w-4.5 ${idx < Math.round(productDetail.rating) ? 'fill-accent' : 'text-slate-600'}`}
                  />
                ))}
                <span className="text-sm font-bold text-slate-200 ml-2">{productDetail.rating || '0.0'}</span>
              </div>
              <span className="text-xs text-slate-500">|</span>
              <span className="text-xs text-slate-400 font-semibold">{productDetail.numReviews} Reviews</span>
            </div>
          </div>

          {/* Price Layout */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xxs text-slate-400 block uppercase tracking-wider">Special Price</span>
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-extrabold text-white">₹{currentPrice.toLocaleString('en-IN')}</span>
                {hasDiscount && (
                  <>
                    <span className="text-sm line-through text-slate-400">₹{productDetail.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-bold text-accent">({discountPercent}% OFF)</span>
                  </>
                )}
              </div>
            </div>
            
            {productDetail.inventory > 0 ? (
              <span className="text-xxs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg">
                In Stock ({productDetail.inventory} units)
              </span>
            ) : (
              <span className="text-xxs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg">
                Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Product Overview</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">{productDetail.description}</p>
          </div>

          {/* Specifications */}
          {productDetail.specifications?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-white/5 pt-3">
                {productDetail.specifications.map((spec, idx) => (
                  <div key={idx} className="flex justify-between border-b border-white/5 pb-1.5 text-xs">
                    <span className="text-slate-400">{spec.name}</span>
                    <span className="text-white font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector and actions */}
          {productDetail.inventory > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/5">
              {/* Quantity input */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">Qty</span>
                <div className="flex items-center rounded-xl bg-slate-800 border border-white/5 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-slate-700 transition-colors text-slate-300 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs text-white font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(productDetail.inventory, quantity + 1))}
                    className="px-3 py-1.5 hover:bg-slate-700 transition-colors text-slate-300 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex space-x-3 w-full sm:flex-1">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-4.5 w-4.5" /> <span>Add To Cart</span>
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`px-3 py-3 rounded-xl border transition-all flex items-center justify-center ${isWishlisted ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/10 text-slate-400 hover:text-white'}`}
                >
                  <Heart className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          )}

          {/* Trust assurances */}
          <div className="flex items-center space-x-4 border-t border-white/5 pt-4 text-xxs text-slate-400">
            <span className="flex items-center"><ShieldCheck className="h-4 w-4 mr-1 text-secondary" /> Genuine Product Warranty</span>
            <span className="flex items-center"><RefreshCw className="h-4 w-4 mr-1 text-accent" /> 10 Days Replacement Guarantee</span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={productDetail._id} reviews={reviews} />

      {/* Recommendations */}
      <Recommendations productId={productDetail._id} />
    </div>
  );
};

export default ProductDetails;
