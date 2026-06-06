import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/src/services/authService";
import { User } from "@/src/types";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async (data: { email: string; full_name: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      localStorage.setItem("user", JSON.stringify(res.user));
      return res;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Registration failed"));
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.login(data);
      localStorage.setItem("user", JSON.stringify(res.user));
      return res;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Login failed"));
    }
  }
);

export const fetchProfile = createAsyncThunk("auth/profile", async (_, { rejectWithValue }) => {
  try {
    return await authService.getProfile();
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, "Failed to fetch profile"));
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
  localStorage.removeItem("user");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loadFromStorage(state) {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user");
        if (user) {
          state.user = JSON.parse(user);
          state.isAuthenticated = true;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.isAuthenticated = true; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.isAuthenticated = true; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.user = action.payload; state.isAuthenticated = true; })
      .addCase(fetchProfile.rejected, (state) => { state.user = null; state.isAuthenticated = false; })
      .addCase(logout.fulfilled, (state) => { state.user = null; state.isAuthenticated = false; });
  },
});

export const { loadFromStorage } = authSlice.actions;
export default authSlice.reducer;
