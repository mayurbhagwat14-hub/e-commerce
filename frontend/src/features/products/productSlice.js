import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
  products: [],
  productDetail: null,
  reviews: [],
  topProducts: [],
  recommendations: [],
  categories: [],
  page: 1,
  pages: 1,
  count: 0,
  loading: false,
  detailLoading: false,
  categoriesLoading: false,
  error: null,
};

// Fetch Products with optional query strings
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (queryParams, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products', { params: queryParams });
      return data; // products, page, pages, count
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch Categories
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/categories');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch Product Details
export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${productId}`);
      return data; // product, reviews
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch Top Products
export const fetchTopProducts = createAsyncThunk(
  'products/fetchTopProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products/top');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch recommendations
export const fetchRecommendations = createAsyncThunk(
  'products/fetchRecommendations',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${productId}/recommendations`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create product review
export const createProductReview = createAsyncThunk(
  'products/createProductReview',
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, reviewData);
      return data.review;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Toggle wishlist
export const toggleWishlist = createAsyncThunk(
  'products/toggleWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/products/${productId}/wishlist`);
      return data.wishlist;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ADMIN THUNKS

// Create product
export const adminCreateProduct = createAsyncThunk(
  'products/adminCreateProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/products', productData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update product
export const adminUpdateProduct = createAsyncThunk(
  'products/adminUpdateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/products/${productId}`, productData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete product
export const adminDeleteProduct = createAsyncThunk(
  'products/adminDeleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${productId}`);
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    clearProductDetails: (state) => {
      state.productDetail = null;
      state.reviews = [];
      state.recommendations = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.count = action.payload.count;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      })
      // Product details
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.productDetail = action.payload.product;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      // Top products
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.topProducts = action.payload;
      })
      // Recommendations
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      })
      // Reviews
      .addCase(createProductReview.fulfilled, (state, action) => {
        state.reviews.push(action.payload);
        if (state.productDetail) {
          // Increment review stats locally
          const totalRating = state.reviews.reduce((acc, rev) => acc + rev.rating, 0);
          state.productDetail.numReviews = state.reviews.length;
          state.productDetail.rating = Math.round((totalRating / state.reviews.length) * 10) / 10;
        }
      })
      // Admin deletes
      .addCase(adminDeleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      });
  },
});

export const { clearProductError, clearProductDetails } = productSlice.actions;
export default productSlice.reducer;
