import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./bookingSlice";
import disabledReducer from "./disabledSlice";

export default configureStore({
  reducer: {
    booking: bookingReducer,
    disabled: disabledReducer,
  },
});
