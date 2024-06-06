import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  disabledArray: JSON.parse(localStorage.getItem("settings")) ?? [],
};

const disabledSlice = createSlice({
  name: "disabled",
  initialState,
  reducers: {
    setDisabledDates: (state, action) => {
      state.disabledArray = action.payload;
      localStorage.setItem(
        "settings",
        JSON.stringify(action.payload)
      );
    },
  },
});

export const { setDisabledDates } = disabledSlice.actions;

export const selectDisabledDates = (state) => state.disabled.disabledArray;

export default disabledSlice.reducer;
