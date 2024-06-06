import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  BookingCount: {
    Employee: 0,
    Rise: 0,
    Others: 0,
  },
  Bookings:[],
};

const counterSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookingCount: (state, action) => {
      state.BookingCount = action.payload;
    },
    addBooking: (state, action) => {
      state.BookingCount[action.payload.type] += action.payload.count;
    },
    deleteBooking: (state, action) => {
      state.BookingCount[action.payload.type] = Math.max(
        0,
        state.BookingCount[action.payload.type] - action.payload.count
      );
    },
    reset: (state) => {
      state.BookingCount.Employees = 0;
      state.BookingCount.Rise = 0;
      state.BookingCount.Others = 0;
    },
  },
});

export const { setBookingCount,addBooking, deleteBooking, reset } = counterSlice.actions;

export const selectCount = (state) => state.booking.BookingCount;

export default counterSlice.reducer;
