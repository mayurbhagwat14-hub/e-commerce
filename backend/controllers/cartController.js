import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name price discountPrice images inventory category'
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json(cart);
});

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += qty;
  } else {
    cart.items.push({ product: productId, quantity: qty });
  }

  await cart.save();
  
  const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name price discountPrice images inventory category'
  });

  res.status(200).json(populatedCart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart
// @access  Private
export const updateCartQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity);

  if (qty <= 0) {
    res.status(400);
    throw new Error('Quantity must be greater than 0');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity = qty;
    await cart.save();
  } else {
    res.status(404);
    throw new Error('Product not found in cart');
  }

  const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name price discountPrice images inventory category'
  });

  res.json(populatedCart);
});

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();

  const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name price discountPrice images inventory category'
  });

  res.json(populatedCart);
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ message: 'Cart cleared successfully', items: [] });
});
