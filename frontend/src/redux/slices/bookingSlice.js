import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  draft: null,
  lastCreatedBooking: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookingDraft: (state, action) => {
      state.draft = action.payload;
    },
    updateDraftPricing: (state, action) => {
      if (state.draft) {
        state.draft = {
          ...state.draft,
          ...action.payload,
        };
      }
    },
    setLastCreatedBooking: (state, action) => {
      state.lastCreatedBooking = action.payload;
    },
    clearBookingDraft: (state) => {
      state.draft = null;
    },
  },
});

export const {
  setBookingDraft,
  updateDraftPricing,
  setLastCreatedBooking,
  clearBookingDraft,
} = bookingSlice.actions;

export default bookingSlice.reducer;
