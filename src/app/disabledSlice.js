import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {BaseUrl} from "../helper/Constant.js";

const initialState = {
  disabledArray: JSON.parse(localStorage.getItem("settings")) ?? [],
  isLoading: false,
  error: null,
};

export const fetchDisabledDates = createAsyncThunk(
  "disabled/fetchDisabledDates", // Just a unique action type, not the actual URL
  async (axiosInstance, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BaseUrl}/settings/dates/get`); // URL only here
      const result = response.data.data;
      return result;
    } catch (error) {
      console.log("Error fetching disabled dates:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const disabledSlice = createSlice({
  name: "disabled",
  initialState,
  reducers: {
    setDisabledDates: (state, action) => {
      state.disabledArray = action.payload;
      localStorage.setItem("settings", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDisabledDates.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDisabledDates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.disabledArray = action.payload;
        state.error = null;
      })
      .addCase(fetchDisabledDates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch disabled dates";
      });
  },
});

export const { setDisabledDates } = disabledSlice.actions;

export const selectDisabledDates = (state) => state.disabled.disabledArray;

export default disabledSlice.reducer;
