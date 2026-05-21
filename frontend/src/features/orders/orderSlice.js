import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
  myOrders: [],
  allOrders: [], // admin
  orderDetail: null,
  checkoutLoading: false,
  loading: false,
  error: null,
  success: false, // flag for order creation redirect
};

// Create Razorpay order session
export const createCheckoutSession = createAsyncThunk(
  'orders/createCheckoutSession',
  async (amount, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/orders/checkout-session', { amount });
      return data; // keyId, order details
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Verify Razorpay Payment and place Order
export const verifyPayment = createAsyncThunk(
  'orders/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/orders/verify', paymentData);
      return data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch My Orders
export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/orders/myorders');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch Single Order Details
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ADMIN THUNKS

// Fetch All Orders
export const adminFetchAllOrders = createAsyncThunk(
  'orders/adminFetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/orders');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update Order Status
export const adminUpdateOrderStatus = createAsyncThunk(
  'orders/adminUpdateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetCheckout: (state) => {
      state.success = false;
      state.error = null;
    },
    clearOrderError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Checkout Session Creation
      .addCase(createCheckoutSession.pending, (state) => {
        state.checkoutLoading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state) => {
        state.checkoutLoading = false;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.error = action.payload;
      })
      // Verify Payment / Order placement
      .addCase(verifyPayment.pending, (state) => {
        state.checkoutLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.success = true;
        state.orderDetail = action.payload;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.error = action.payload;
      })
      // My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetail = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin Fetch All
      .addCase(adminFetchAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminFetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload;
      })
      .addCase(adminFetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin update order
      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        state.orderDetail = action.payload;
        // update in list if present
        const index = state.allOrders.findIndex(o => o._id === action.payload._id);
        if (index >= 0) {
          state.allOrders[index] = action.payload;
        }
      });
  },
});

export const { resetCheckout, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
