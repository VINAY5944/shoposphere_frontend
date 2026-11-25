import { createSlice } from "@reduxjs/toolkit";
import { storage } from "../shared/utils/storage";

import {
  loginCustomer,
  loginAdmin,
  fetchCurrentUser,
} from "./authThunks";

const savedToken = storage.getToken();
const savedUser = storage.getUser();

const initialState = {
  user: savedUser,
  accessToken: savedToken,
  isAuthenticated: Boolean(savedToken && savedUser),

  loading: Boolean(savedToken),
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Store login credentials manually if needed
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;

      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;

      storage.setToken(accessToken);
      storage.setUser(user);
    },

    // Update user profile
    updateUser: (state, action) => {
      state.user = action.payload;
      storage.setUser(action.payload);
    },

    // Clear authentication state
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      storage.removeToken();
      storage.removeUser();
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // CUSTOMER LOGIN
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;

        const { accessToken, user } = action.payload;

        state.accessToken = accessToken;
        state.user = user;
        state.isAuthenticated = true;

        storage.setToken(accessToken);
        storage.setUser(user);
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADMIN LOGIN
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;

        const { accessToken, user } = action.payload;

        state.accessToken = accessToken;
        state.user = user;
        state.isAuthenticated = true;

        storage.setToken(accessToken);
        storage.setUser(user);
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH CURRENT USER
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        storage.setUser(action.payload);
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        if (action.meta.aborted) {
          return;
        }

        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch user profile";

        if (action.payload?.status === 401) {
          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;

          storage.removeToken();
          storage.removeUser();
        } else {
          state.isAuthenticated = Boolean(state.accessToken && state.user);
        }
      });
  },
});

export const {
  setCredentials,
  updateUser,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;