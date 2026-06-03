import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Async Actions ──

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Step 1: Register
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);

      // Step 2: Fetch full profile
      const profileRes = await api.get('/users/me');
      const fullUser = { ...profileRes.data, token: data.token };

      localStorage.setItem('user', JSON.stringify(fullUser));
      return fullUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Register failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      // Step 1: Login to get token
      const { data } = await api.post('/auth/login', userData);
      localStorage.setItem('token', data.token);

      // Step 2: Fetch full profile (includes skills)
      const profileRes = await api.get('/users/me');
      const fullUser = { ...profileRes.data, token: data.token };

      localStorage.setItem('user', JSON.stringify(fullUser));
      return fullUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const getMyProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/me');
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// ── Slice ──

const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUserFromStorage(),  // Persist login on page refresh
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;