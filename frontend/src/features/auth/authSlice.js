import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Get user from local storage as initial state
const storedUser = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

const initialState = {
  user: storedUser,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.warn('Backend logout request failed, clearing local session anyway.', err);
  }
  localStorage.removeItem('user');
  return null;
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/profile');
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', profileData);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addAddress = createAsyncThunk('auth/addAddress', async (addressData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/address', addressData);
    return data; // returns array of addresses
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (addressId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/auth/address/${addressId}`);
    return data; // returns updated addresses
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    forceLogout: (state) => {
      localStorage.removeItem('user');
      state.user = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      // Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Address management
      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.user) state.user.addresses = action.payload;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.user) state.user.addresses = action.payload;
      });
  },
});

export const { clearAuthError, forceLogout } = authSlice.actions;
export default authSlice.reducer;
