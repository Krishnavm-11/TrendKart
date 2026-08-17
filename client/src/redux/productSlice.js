import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  loading: false,
};

const productSlice = createSlice({
  name: "products",

  initialState,

  reducers: {
    setProducts: (state, action) => {
      state.products = Array.isArray(
        action.payload
      )
        ? action.payload
        : [];
    },
  },
});

export const { setProducts } =
  productSlice.actions;

export default productSlice.reducer;