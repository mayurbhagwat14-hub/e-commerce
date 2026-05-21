import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
  items: [],
  coupon: null, // applied coupon details { code, discount, discountType, discountAmount }
  loading: false,
  error: null,
};

// Helper function to calculate cart summary
const calculateTotals = (items, coupon) => {
  const itemsPrice = items.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const shippingPrice = itemsPrice > 5000 || itemsPrice === 0 ? 0 : 150;
  const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100; // 18% GST

  let discountPrice = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discountPrice = (itemsPrice * coupon.discount) / 100;
      if (coupon.maxDiscount && discountPrice > coupon.maxDiscount) {
        discountPrice = coupon.maxDiscount;
      }
    } else {
      discountPrice = coupon.discount;
    }
  }

  const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice - discountPrice) * 100) / 100;

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice: Math.round(discountPrice * 100) / 100,
    totalPrice: Math.max(0, totalPrice),
  };
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data.items; // items array from cart schema
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart', { productId, quantity });
    return data.items;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCartQuantity = createAsyncThunk(
  'cart/updateCartQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/cart', { productId, quantity });
      return data.items;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      return data.items;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async ({ code, purchaseAmount }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/coupons/apply', { code, purchaseAmount });
      return data; // { success, code, discountAmount, discountType, discount }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart');
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    removeCoupon: (state) => {
      state.coupon = null;
    },
    clearCartError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // Update quantity
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // Remove item
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // Apply Coupon
      .addCase(applyCoupon.pending, (state) => {
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.coupon = action.payload;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.coupon = null;
      });
  },
});

export const { removeCoupon, clearCartError } = cartSlice.actions;

// Custom selectors for totals
export const selectCartTotals = (state) => calculateTotals(state.cart.items, state.cart.coupon);

export default cartSlice.reducer;
