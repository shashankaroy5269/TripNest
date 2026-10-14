import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../api";

const savedUser = localStorage.getItem("tripnest_user");
const initialUser = savedUser ? JSON.parse(savedUser) : null;
const initialToken = localStorage.getItem("tripnest_token") || null;

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await authApi.register(formData);
      return res;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const verifyEmailToken = createAsyncThunk(
  "auth/verifyEmailToken",
  async (token, { rejectWithValue }) => {
    try {
      const res = await authApi.verifyEmail(token);
      return res;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.getProfile();
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    token: initialToken,
    isAuthenticated: Boolean(initialToken && initialUser),
    isLoading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.isAuthenticated = true;
      state.error = null;

      if (accessToken) {
        localStorage.setItem("tripnest_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("tripnest_refresh_token", refreshToken);
      }
      if (user) {
        localStorage.setItem("tripnest_user", JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("tripnest_token");
      localStorage.removeItem("tripnest_refresh_token");
      localStorage.removeItem("tripnest_user");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;

        if (action.payload.accessToken) {
          localStorage.setItem("tripnest_token", action.payload.accessToken);
        }
        if (action.payload.refreshToken) {
          localStorage.setItem("tripnest_refresh_token", action.payload.refreshToken);
        }
        if (action.payload.user) {
          localStorage.setItem("tripnest_user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("tripnest_user", JSON.stringify(action.payload));
      });
  },
});

export const { setCredentials, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
