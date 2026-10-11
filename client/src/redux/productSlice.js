
import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "products",

  initialState: {
    products: [],
  },

  reducers: {
    setProducts: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.products = action.payload;
      } else {
        state.products = [];
      }
    },
  },
});

export const { setProducts } = productSlice.actions;

export default productSlice.reducer;