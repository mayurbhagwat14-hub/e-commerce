import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { selectCartTotals } from '../features/cart/cartSlice';
import { createCheckoutSession, verifyPayment, resetCheckout } from '../features/orders/orderSlice';
import { addAddress, fetchProfile } from '../features/auth/authSlice';
import { ShieldCheck, Plus, Check, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { checkoutLoading, success, orderDetail } = useSelector((state) => state.orders);

  const totals = useSelector(selectCartTotals);

  // Address selection state
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  
  // New address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Set default selected address index
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultIdx = user.addresses.findIndex(addr => addr.isDefault);
      setSelectedAddressIndex(defaultIdx >= 0 ? defaultIdx : 0);
    }
  }, [user]);

  // Redirect on successful payment
  useEffect(() => {
    if (success && orderDetail) {
      navigate('/payment-success', { replace: true });
      dispatch(resetCheckout());
    }
  }, [success, orderDetail, navigate, dispatch]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!name || !phone || !street || !city || !state || !zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }
    try {
      await dispatch(addAddress({ name, phone, street, city, state, zipCode })).unwrap();
      toast.success('Address added successfully');
      setShowAddressForm(false);
      // Reset form
      setName('');
      setPhone('');
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
    } catch (err) {
      toast.error(err || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!user.addresses || user.addresses.length === 0) {
      toast.error('Please add a shipping address');
      return;
    }

    const shippingAddress = user.addresses[selectedAddressIndex];
    const orderItems = items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      image: item.product.images[0]?.url,
      price: item.product.discountPrice || item.product.price,
      product: item.product._id
    }));

    const isDevelopment = import.meta.env.MODE === 'development';
    
    try {
      // 1. Create Razorpay order details on backend
      const checkoutSession = await dispatch(createCheckoutSession(totals.totalPrice)).unwrap();
      
      // 2. Load script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // 3. Trigger Razorpay Checkout UI
      const options = {
        key: checkoutSession.keyId,
        amount: checkoutSession.order.amount,
        currency: checkoutSession.order.currency,
        name: 'QuantumShop',
        description: 'Payment for your order',
        order_id: checkoutSession.order.id,
        handler: async (response) => {
          // Callback after checkout completes
          try {
            await dispatch(verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderItems,
              shippingAddress,
              pricing: totals
            })).unwrap();
            toast.success('Payment verified & order created!');
          } catch (err) {
            toast.error(err || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#7C3AED' // Primary violet color theme matching site
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment checkout dismissed');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      // Fallback for development if keys aren't configured or if the request fails
      if (isDevelopment) {
        const confirmMock = window.confirm(
          `Razorpay API key error: "${err}".\nWould you like to simulate a successful Mock payment to place this order?`
        );
        if (confirmMock) {
          try {
            await dispatch(verifyPayment({
              razorpay_order_id: `mock_order_${Date.now()}`,
              razorpay_payment_id: `mock_pay_${Date.now()}`,
              razorpay_signature: 'mock_signature',
              orderItems,
              shippingAddress,
              pricing: totals
            })).unwrap();
            toast.success('Placed Mock Order (Development Bypass)');
          } catch (mockErr) {
            toast.error(mockErr || 'Failed to place mock order');
          }
        }
      } else {
        toast.error(err || 'Order checkout failed');
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5 max-w-md mx-auto mt-10">
        <h3 className="text-lg font-bold text-white">No items to checkout</h3>
        <p className="text-xs text-slate-400 mt-1">Please add products to your cart before proceeding.</p>
        <Link to="/products" className="mt-6 inline-block px-6 py-2 rounded-full bg-primary text-white text-xs font-bold shadow">
          Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      <div className="flex items-center space-x-3">
        <Link to="/cart" className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Secure Checkout</h1>
          <p className="text-xs text-slate-400 mt-1">Complete your transaction details safely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Address Selection & Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/30 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                <MapPin className="h-4.5 w-4.5 mr-2 text-primary" /> Shipping Address
              </h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xxs font-bold text-secondary hover:text-secondary-light flex items-center space-x-0.5"
              >
                <Plus className="h-3.5 w-3.5" /> <span>Add New</span>
              </button>
            </div>

            {/* Address Grid */}
            {!user.addresses || user.addresses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No shipping addresses configured. Please add one below.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr, idx) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressIndex === idx ? 'border-primary bg-primary/10' : 'border-white/5 bg-slate-800/20 hover:border-white/10'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white">{addr.name}</span>
                      {selectedAddressIndex === idx && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-xxs text-slate-400 mt-2 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2 font-semibold">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Address Form inline drawer */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="border-t border-white/5 pt-4 mt-4 space-y-4">
                <h3 className="text-xs font-bold text-slate-200">New Address details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Recipient Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Contact Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="glass-input px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Street / Locality"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="sm:col-span-2 glass-input px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Zip / Pin Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="glass-input px-3 py-2 rounded-lg text-xs focus:outline-none"
                  />
                  <div className="flex space-x-2 sm:col-span-2 justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 bg-slate-800 text-xs rounded-lg font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-xs rounded-lg font-bold shadow"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: checkout pricing breakdown */}
        <div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/30 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Order Breakdown
            </h2>

            <div className="space-y-4 max-h-40 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.product._id} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 line-clamp-1 max-w-[150px]">{item.product.name}</span>
                  <span className="text-slate-200 font-medium">
                    {item.quantity} x ₹{(item.product.discountPrice || item.product.price).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Cart Total</span>
                <span className="text-white font-semibold">₹{totals.itemsPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shipping Fees</span>
                <span className="text-white font-semibold">{totals.shippingPrice === 0 ? 'FREE' : `₹${totals.shippingPrice}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GST (18%)</span>
                <span className="text-white font-semibold">₹{totals.taxPrice.toLocaleString('en-IN')}</span>
              </div>
              {totals.discountPrice > 0 && (
                <div className="flex justify-between text-accent font-semibold">
                  <span>Coupon Savings</span>
                  <span>- ₹{totals.discountPrice.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-white/5 pt-3 mt-3 flex justify-between text-sm font-extrabold text-white">
                <span>Payable Amount</span>
                <span>₹{totals.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={checkoutLoading || user.addresses?.length === 0}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin mr-1.5" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4.5 w-4.5 mr-1" />
                  <span>Pay with Razorpay (Secure)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
