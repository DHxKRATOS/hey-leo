import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  authApi,
  AuthResponse,
  ProfileResponse,
  SignUpData,
  SignInData,
} from "../api/authApi";
import { cookieUtils } from "../utils/cookies";

export interface User {
  user: any;
  id: number;
  email: string;
  name: string;
  confirmed: boolean;
  blocked: boolean;
  avatar?: {
    url: string;
  };
  avatar_url?: string;
  preferences?: any;
  subscription?: {
    plan: {
      id: number;
      name: string;
      price: number;
      features: Array<{
        feature: {
          name: string;
          category: string;
        };
        value: string;
        limit: number | null;
      }>;
    };
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: cookieUtils.getToken() || null,
  isAuthenticated: !!cookieUtils.getToken(),
  isLoading: false,
  error: null,
};

// Async thunks
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (data: SignUpData, { rejectWithValue }) => {
    try {
      const response = await authApi.signUp(data);
      cookieUtils.setToken(response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Sign up failed");
    }
  }
);

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (data: SignInData, { rejectWithValue }) => {
    try {
      const response = await authApi.signIn(data);
      cookieUtils.setToken(response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Sign in failed");
    }
  }
);

export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.signOut();
      cookieUtils.clearAuthCookies();
    } catch (error: any) {
      // Even if API call fails, clear local tokens
      cookieUtils.clearAuthCookies();
      return rejectWithValue(error.message || "Sign out failed");
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data: Partial<ProfileResponse>, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update profile");
    }
  }
);

export const socialAuth = createAsyncThunk(
  "auth/socialAuth",
  async (
    { provider, userData }: { provider: "linkedin" | "google"; userData?: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.socialAuth(provider, userData);
      cookieUtils.setToken(response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || `${provider} authentication failed`
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      cookieUtils.clearAuthCookies();
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      cookieUtils.setToken(action.payload.token);
    },
  },
  extraReducers: (builder) => {
    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Sign Out
    builder
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload, confirmed: true, blocked: false };
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload, confirmed: true, blocked: false };
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Social Auth
    builder
      .addCase(socialAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(socialAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(socialAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
