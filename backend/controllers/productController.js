import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Fetch all products with filters & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 8;
  const page = Number(req.query.page) || 1;

  // Search keyword (text index search)
  const keyword = req.query.keyword
    ? {
        $text: { $search: req.query.keyword },
      }
    : {};

  // Category filtering
  let categoryFilter = {};
  if (req.query.category) {
    // Check if category is objectId or slug
    const categoryDoc = await Category.findOne({
      $or: [{ slug: req.query.category }, { _id: req.query.category }],
    });
    if (categoryDoc) {
      categoryFilter = { category: categoryDoc._id };
    }
  }

  // Price range filtering
  const priceFilter = {};
  if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
  if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
  const priceQuery = Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {};

  // Rating filtering
  const ratingQuery = req.query.rating
    ? { rating: { $gte: Number(req.query.rating) } }
    : {};

  // In-stock filtering
  const stockQuery = req.query.inStock === 'true'
    ? { inventory: { $gt: 0 } }
    : {};

  // Combine query filters
  const filterQuery = {
    ...keyword,
    ...categoryFilter,
    ...priceQuery,
    ...ratingQuery,
    ...stockQuery,
  };

  // Sorting
  let sortOption = {};
  if (req.query.sortBy === 'priceAsc') {
    sortOption = { price: 1 };
  } else if (req.query.sortBy === 'priceDesc') {
    sortOption = { price: -1 };
  } else if (req.query.sortBy === 'rating') {
    sortOption = { rating: -1 };
  } else {
    sortOption = { createdAt: -1 }; // Default: Newest first
  }

  const count = await Product.countDocuments(filterQuery);
  const products = await Product.find(filterQuery)
    .populate('category', 'name slug')
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), count });
});

// @desc    Fetch single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');

  if (product) {
    // Fetch product reviews
    const reviews = await Review.find({ product: product._id }).populate('user', 'name');
    res.json({ product, reviews });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Please add a rating and comment');
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed this product
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  const review = await Review.create({
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id,
    product: productId
  });

  res.status(201).json({ message: 'Review added', review });
});

// @desc    Get top rated featured products
// @route   GET /api/products/top/featured
// @access  Public
export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true })
    .populate('category', 'name slug')
    .sort({ rating: -1 })
    .limit(5);

  res.json(products);
});

// @desc    Get recommendations (AI style category correlation)
// @route   GET /api/products/:id/recommendations
// @access  Public
export const getRecommendations = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Recommend products in the same category, excluding the current product
  const recommendations = await Product.find({
    category: product.category,
    _id: { $ne: product._id }
  })
    .populate('category', 'name slug')
    .sort({ rating: -1 })
    .limit(4);

  res.json(recommendations);
});

// @desc    Toggle wishlist product
// @route   POST /api/products/:id/wishlist
// @access  Private
export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const index = user.wishlist.indexOf(product._id);
  let action = '';

  if (index >= 0) {
    user.wishlist.splice(index, 1);
    action = 'removed';
  } else {
    user.wishlist.push(product._id);
    action = 'added';
  }

  await user.save();
  const populatedUser = await User.findById(user._id).populate('wishlist');
  res.json({ message: `Product ${action} wishlist`, wishlist: populatedUser.wishlist });
});

// ADMIN CONTROLLERS

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, images, inventory, specifications, isFeatured } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Invalid product category');
  }

  const product = new Product({
    name,
    price,
    description,
    category,
    images: images || [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', publicId: '' }],
    inventory: inventory || 0,
    specifications: specifications || [],
    isFeatured: isFeatured || false
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, images, inventory, specifications, isFeatured } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.images = images || product.images;
    product.inventory = inventory !== undefined ? inventory : product.inventory;
    product.specifications = specifications || product.specifications;
    product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.findByIdAndDelete(req.params.id);
    // Delete reviews linked to this product
    await Review.deleteMany({ product: req.params.id });
    res.json({ message: 'Product deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});
