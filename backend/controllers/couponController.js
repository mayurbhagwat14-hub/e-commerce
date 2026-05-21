import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Apply coupon code
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, purchaseAmount } = req.body;

  if (!code || purchaseAmount === undefined) {
    res.status(400);
    throw new Error('Please provide coupon code and purchase amount');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  if (!coupon.isValid(purchaseAmount)) {
    res.status(400);
    throw new Error('Coupon is either expired, inactive, or purchase amount is insufficient');
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (purchaseAmount * coupon.discount) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discount;
  }

  res.json({
    success: true,
    code: coupon.code,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountType: coupon.discountType,
    discount: coupon.discount
  });
});

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discount, discountType, minPurchase, maxDiscount, expiryDate } = req.body;

  if (!code || !discount || !expiryDate) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discount,
    discountType,
    minPurchase,
    maxDiscount,
    expiryDate: new Date(expiryDate),
  });

  res.status(201).json(coupon);
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ expiryDate: 1 });
  res.json(coupons);
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});
