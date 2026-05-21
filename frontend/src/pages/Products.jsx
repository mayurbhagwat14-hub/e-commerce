import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts, fetchCategories } from '../features/products/productSlice';
import ProductCard from '../components/product/ProductCard';
import { GridSkeleton } from '../components/common/LoadingSkeleton';

export const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux states
  const { products, categories, loading, page, pages } = useSelector((state) => state.products);

  // Local filters states
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Trigger API fetch whenever parameters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 8,
    };

    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (rating) params.rating = rating;
    if (sortBy) params.sortBy = sortBy;
    if (inStock) params.inStock = inStock;

    dispatch(fetchProducts(params));
  }, [dispatch, currentPage, keyword, category, minPrice, maxPrice, rating, sortBy, inStock]);

  const updateFilters = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    
    // Reset page to 1 on filter change
    nextParams.set('page', '1');

    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        nextParams.set(key, value.toString());
      } else {
        nextParams.delete(key);
      }
    });

    setSearchParams(nextParams);
  };

  const handleCategoryChange = (catVal) => {
    setCategory(catVal);
    updateFilters({ category: catVal });
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateFilters({ minPrice, maxPrice });
  };

  const handleRatingChange = (ratingVal) => {
    setRating(ratingVal);
    updateFilters({ rating: ratingVal });
  };

  const handleSortChange = (sortVal) => {
    setSortBy(sortVal);
    updateFilters({ sortBy: sortVal });
  };

  const handleStockChange = (stockVal) => {
    setInStock(stockVal);
    updateFilters({ inStock: stockVal });
  };

  const handleResetFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSortBy('newest');
    setInStock(false);
    setSearchParams({}); // Clear all search queries
  };

  const handlePageChange = (pageNum) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', pageNum.toString());
    setSearchParams(nextParams);
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {keyword ? `Search Results for "${keyword}"` : 'Browse Catalog'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Explore our range of premium products.</p>
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="glass-input text-xs px-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-40"
          >
            <option value="newest">Newest First</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 border border-white/5 text-xs text-slate-300 font-semibold"
          >
            <Filter className="h-4 w-4" /> <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters Desktop */}
        <aside className="hidden md:block glass-panel rounded-2xl p-6 border border-white/5 h-fit space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center">
              <SlidersHorizontal className="h-4.5 w-4.5 mr-2 text-primary" /> Filters
            </h2>
            <button onClick={handleResetFilters} className="text-xxs font-semibold text-red-400 hover:text-red-300 flex items-center space-x-0.5">
              <RefreshCw className="h-3 w-3" /> <span>Clear All</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200">Category</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => handleCategoryChange('')}
                className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${!category ? 'bg-primary/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${category === cat.slug ? 'bg-primary/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200">Price Range (₹)</h3>
            <form onSubmit={handlePriceApply} className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full glass-input px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full glass-input px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow transition-colors">
                Apply Price
              </button>
            </form>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200">Minimum Rating</h3>
            <div className="space-y-1.5">
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => handleRatingChange(stars)}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${Number(rating) === stars ? 'bg-primary/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                >
                  {stars}★ & Above
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Filter */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-xs font-semibold text-slate-300">In Stock Only</span>
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => handleStockChange(e.target.checked)}
              className="accent-primary h-4 w-4 rounded cursor-pointer"
            />
          </div>
        </aside>

        {/* Mobile Filters Drawer Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex justify-end">
            <div className="w-80 h-full bg-slate-900 p-6 shadow-2xl border-l border-white/10 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h2 className="text-sm font-bold text-white flex items-center">
                    <Filter className="h-4.5 w-4.5 mr-2 text-primary" /> Filters
                  </h2>
                  <button onClick={() => setShowMobileFilters(false)} className="p-1 text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Categories */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-200">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`px-3 py-1 rounded-full text-xxs font-semibold ${!category ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`px-3 py-1 rounded-full text-xxs font-semibold ${category === cat.slug ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Price */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-200">Price Range</h3>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full glass-input px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full glass-input px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mobile Rating */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-200">Rating</h3>
                  <div className="flex space-x-2">
                    {[4, 3, 2].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => handleRatingChange(stars)}
                        className={`px-3 py-1 rounded-full text-xxs font-semibold ${Number(rating) === stars ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'}`}
                      >
                        {stars}★+
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Stock */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs font-semibold text-slate-300">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => handleStockChange(e.target.checked)}
                    className="accent-primary h-4 w-4"
                  />
                </div>
              </div>

              <div className="flex space-x-4 border-t border-white/10 pt-6">
                <button
                  onClick={() => {
                    handleResetFilters();
                    setShowMobileFilters(false);
                  }}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    updateFilters({ minPrice, maxPrice });
                    setShowMobileFilters(false);
                  }}
                  className="w-1/2 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid Panel */}
        <main className="md:col-span-3 space-y-8">
          {loading ? (
            <GridSkeleton count={6} />
          ) : products.length === 0 ? (
            <div className="glass-panel text-center py-20 rounded-2xl border border-white/5">
              <SlidersHorizontal className="h-10 w-10 mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-bold text-white">No Products Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                We couldn't find any products matching your search terms or filter constraints. Try adjusting your fields.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-6 py-2 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="flex justify-center items-center space-x-2 border-t border-white/5 pt-8">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-slate-800 border border-white/5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: pages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-9 w-9 rounded-lg text-xs font-bold border transition-colors ${page === pageNum ? 'bg-primary border-primary text-white shadow' : 'bg-slate-800 border-white/5 hover:bg-slate-700 text-slate-300'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="p-2 rounded-lg bg-slate-800 border border-white/5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
