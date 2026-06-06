import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService } from "@/src/services/dashboardService";
import { DashboardMetrics } from "@/src/types";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

interface DashboardState {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: null,
  loading: false,
  error: null,
};

export const fetchMetrics = createAsyncThunk("dashboard/metrics", async (_, { rejectWithValue }) => {
  try {
    return await dashboardService.getMetrics();
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, "Failed to fetch metrics"));
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMetrics.fulfilled, (state, action) => { state.loading = false; state.metrics = action.payload; })
      .addCase(fetchMetrics.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export default dashboardSlice.reducer;
