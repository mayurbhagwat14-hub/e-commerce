import mongoose from 'mongoose';
import Product from './Product.js';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  name: { type: String, required: true }, // Cache reviewer name
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, {
  timestamps: true,
});

// Force single review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to calculate avg rating of product
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        numReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      numReviews: stats[0].numReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0
    });
  }
};

// Calculate ratings on save
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

// Calculate ratings on delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
