import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, Tag, X } from 'lucide-react';
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  selectCartTotals
} from '../features/cart/cartSlice';
import toast from 'react-hot-toast';

export const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, coupon, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  const totals = useSelector(selectCartTotals);

  const handleQtyChange = async (productId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty <= 0) return;
    try {
      await dispatch(updateCartQuantity({ productId, quantity: newQty })).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
      toast.success('Product removed from cart');
    } catch (err) {
      toast.error(err || 'Failed to remove product');
    }
  };

  const handleCouponApply = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    try {
      const data = await dispatch(
        applyCoupon({ code: couponCode.trim(), purchaseAmount: totals.itemsPrice })
      ).unwrap();
      toast.success(`Coupon "${data.code}" applied! Saved ₹${data.discountAmount}`);
      setCouponCode('');
    } catch (err) {
      toast.error(err || 'Invalid or expired coupon');
    }
  };

  const handleCouponRemove = () => {
    dispatch(removeCoupon());
    toast.success('Coupon removed');
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5 max-w-md mx-auto mt-10">
        <ShoppingCart className="h-10 w-10 mx-auto text-slate-500 mb-4" />
        <h3 className="text-lg font-bold text-white">Login to View Cart</h3>
        <p className="text-xs text-slate-400 mt-1">Please sign in to add products or view items in your cart.</p>
        <Link to="/login" className="mt-6 inline-block px-6 py-2 rounded-full bg-primary text-white text-xs font-bold shadow">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <ShoppingCart className="h-6 w-6 mr-2 text-primary" /> Your Cart
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage products added to your checkout basket.</p>
      </div>

      {loading && items.length === 0 ? (
        <div className="text-center py-20 text-slate-400">Loading cart...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5 max-w-md mx-auto">
          <ShoppingCart className="h-10 w-10 mx-auto text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-white">Your Cart is Empty</h3>
          <p className="text-xs text-slate-400 mt-1">Add items from the store to continue shopping.</p>
          <Link to="/products" className="mt-6 inline-block px-6 py-2 rounded-full bg-primary text-white text-xs font-bold shadow">
            Shop Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product;
              const price = product.discountPrice || product.price;
              return (
                <div
                  key={product._id}
                  className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/5 bg-slate-900/20 gap-4"
                >
                  <img
                    src={product.images[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-950/20"
                  />
                  
                  <div className="flex-1 space-y-1">
                    <Link to={`/products/${product._id}`} className="text-xs font-bold text-white hover:text-secondary line-clamp-1">
                      {product.name}
                    </Link>
                    <span className="text-xxs font-semibold text-slate-400 block">
                      Price: ₹{price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center rounded-lg bg-slate-800 border border-white/5 overflow-hidden">
                    <button
                      onClick={() => handleQtyChange(product._id, item.quantity, -1)}
                      className="px-2 py-1 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xxs text-white font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(product._id, item.quantity, 1)}
                      className="px-2 py-1 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Total price & delete */}
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold text-white whitespace-nowrap">
                      ₹{(price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Order Summary panel */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/30 space-y-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white font-semibold">₹{totals.itemsPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-white font-semibold">
                    {totals.shippingPrice === 0 ? 'FREE' : `₹${totals.shippingPrice}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GST Tax (18%)</span>
                  <span className="text-white font-semibold">₹{totals.taxPrice.toLocaleString('en-IN')}</span>
                </div>
                {totals.discountPrice > 0 && (
                  <div className="flex justify-between text-accent font-semibold">
                    <span>Discount</span>
                    <span>- ₹{totals.discountPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-3 mt-3 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span>₹{totals.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Coupon inputs */}
              {!coupon ? (
                <form onSubmit={handleCouponApply} className="flex">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-l-lg text-xxs focus:outline-none"
                  />
                  <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white border-y border-r border-white/10 px-4 rounded-r-lg text-xxs font-bold transition-colors">
                    Apply
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-xxs text-accent">
                  <span className="flex items-center font-bold">
                    <Tag className="h-3.5 w-3.5 mr-1" /> {coupon.code} Applied
                  </span>
                  <button onClick={handleCouponRemove} className="text-slate-400 hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Checkout button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
