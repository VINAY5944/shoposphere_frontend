import { createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

// Customer login
export const loginCustomer = createAsyncThunk(
  "auth/loginCustomer",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.loginCustomer(credentials);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Customer login failed"
      );
    }
  }
);

// Admin login
export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.loginAdmin(credentials);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Admin login failed"
      );
    }
  }
);

// Fetch logged-in user's profile and permissions
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue, signal }) => {
    try {
      return await authService.getCurrentUser({ signal });
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }

      return rejectWithValue({
        message:
          error.response?.data?.message || "Failed to fetch user profile",
        status: error.response?.status,
      });
    }
  }
);