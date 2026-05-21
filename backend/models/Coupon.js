import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discount: { type: Number, required: true }, // value of discount
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  minPurchase: { type: Number, default: 0 },
  maxDiscount: { type: Number }, // max cap for percentage discounts
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
});

// Check if coupon is valid helper
couponSchema.methods.isValid = function (purchaseAmount) {
  const currentDate = new Date();
  return (
    this.isActive &&
    currentDate <= this.expiryDate &&
    purchaseAmount >= this.minPurchase
  );
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
