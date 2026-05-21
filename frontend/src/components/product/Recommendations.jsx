import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendations } from '../../features/products/productSlice';
import ProductCard from './ProductCard';
import { Sparkles } from 'lucide-react';

export const Recommendations = ({ productId }) => {
  const dispatch = useDispatch();
  const { recommendations } = useSelector((state) => state.products);

  useEffect(() => {
    if (productId) {
      dispatch(fetchRecommendations(productId));
    }
  }, [dispatch, productId]);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-6 mt-16">
      <h3 className="text-xl font-bold text-slate-100 flex items-center">
        <Sparkles className="h-5 w-5 mr-2 text-accent animate-pulse" /> You Might Also Like
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map((prod) => (
          <ProductCard key={prod._id} product={prod} />
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
