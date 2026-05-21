import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import razorpay from '../config/razorpay.js';
import asyncHandler from '../utils/asyncHandler.js';
import crypto from 'crypto';

// @desc    Create a Razorpay order session
// @route   POST /api/orders/checkout-session
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid payment amount');
  }

  const options = {
    amount: Math.round(amount * 100), // Razorpay expects amount in paise
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);
    res.status(201).json({
      success: true,
      keyId: razorpay.key_id,
      order: razorpayOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error(`Razorpay Order creation failed: ${error.message}`);
  }
});

// @desc    Verify payment signature and save order
// @route   POST /api/orders/verify
// @access  Private
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderItems,
    shippingAddress,
    pricing
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Payment credentials missing');
  }

  // Cryptographic signature validation
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isSignatureValid = generatedSignature === razorpay_signature;

  // For testing: permit bypass if using mock credentials
  const isMockPayment = razorpay_order_id.startsWith('mock_') || process.env.NODE_ENV === 'development';

  if (!isSignatureValid && !isMockPayment) {
    res.status(400);
    throw new Error('Invalid signature. Payment verification failed.');
  }

  // Create the Order in MongoDB
  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: 'Razorpay',
    paymentResult: {
      id: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'success',
      updateTime: new Date().toISOString(),
    },
    pricing,
    isPaid: true,
    paidAt: Date.now(),
    status: 'Paid'
  });

  const createdOrder = await order.save();

  // Deplete stock counts for purchased products
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.inventory = Math.max(0, product.inventory - item.quantity);
      await product.save();
    }
  }

  // Clear user's shopping cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(201).json({ success: true, order: createdOrder });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    // Check if requester owns the order or is an admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// ADMIN ENDPOINTS

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status (Processing -> Shipped -> Delivered)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    
    if (req.body.status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});
