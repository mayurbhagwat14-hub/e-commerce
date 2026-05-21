import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, MessageSquare } from 'lucide-react';
import { createProductReview } from '../../features/products/productSlice';
import toast from 'react-hot-toast';

export const ReviewSection = ({ productId, reviews }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasReviewed = reviews.some(rev => rev.user?._id === user?._id || rev.user === user?._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    setSubmitting(true);
    try {
      await dispatch(createProductReview({ productId, reviewData: { rating, comment } })).unwrap();
      toast.success('Review submitted successfully!');
      setComment('');
    } catch (err) {
      toast.error(err || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 mt-12">
      <h3 className="text-xl font-bold text-slate-100 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-primary" /> Customer Reviews ({reviews.length})
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400">No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">{rev.name}</span>
                  <span className="text-xxs text-slate-500">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex text-accent space-x-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-3 w-3 ${idx < rev.rating ? 'fill-accent' : 'text-slate-600'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Submit Review Form */}
        <div>
          {user ? (
            hasReviewed ? (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center text-xs text-green-400">
                You have already submitted a review for this product.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-slate-800/30 border border-white/5 space-y-4">
                <h4 className="text-sm font-bold text-white">Write a Review</h4>
                
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 block">Rating</label>
                  <div className="flex space-x-1.5">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const starVal = idx + 1;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setRating(starVal)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-5 w-5 ${starVal <= rating ? 'fill-accent text-accent' : 'text-slate-600'}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 block">Your Review</label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like or dislike?"
                    className="w-full glass-input p-3 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )
          ) : (
            <div className="p-4 rounded-xl bg-slate-800/40 border border-white/5 text-center text-xs text-slate-400">
              Please <a href="/login" className="text-secondary font-semibold hover:underline">login</a> to write a product review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
