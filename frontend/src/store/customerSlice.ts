import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customerService } from "@/src/services/customerService";
import { Customer } from "@/src/types";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

interface CustomerState {
  items: Customer[];
  current: Customer | null;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  items: [],
  current: null,
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

export const fetchCustomers = createAsyncThunk(
  "customers/list",
  async (params: Record<string, string | number> | undefined, { rejectWithValue }) => {
    try {
      return await customerService.list(params);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch customers"));
    }
  }
);

export const fetchCustomer = createAsyncThunk(
  "customers/get",
  async (id: number, { rejectWithValue }) => {
    try {
      return await customerService.get(id);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch customer"));
    }
  }
);

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchCustomers.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchCustomer.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCustomer.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchCustomer.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearCurrent } = customerSlice.actions;
export default customerSlice.reducer;
