import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { interactionService } from "@/src/services/interactionService";
import { Interaction } from "@/src/types";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

interface InteractionState {
  items: Interaction[];
  current: Interaction | null;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: InteractionState = {
  items: [],
  current: null,
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

export const fetchInteractions = createAsyncThunk(
  "interactions/list",
  async (params: Record<string, string | number> | undefined, { rejectWithValue }) => {
    try {
      return await interactionService.list(params);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch interactions"));
    }
  }
);

export const fetchInteraction = createAsyncThunk(
  "interactions/get",
  async (id: number, { rejectWithValue }) => {
    try {
      return await interactionService.get(id);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch interaction"));
    }
  }
);

const interactionSlice = createSlice({
  name: "interactions",
  initialState,
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchInteractions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchInteraction.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInteraction.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchInteraction.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearCurrent } = interactionSlice.actions;
export default interactionSlice.reducer;
