import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
  
    addToCart: (state, action) => {
      const product = action.payload;

      const existingItem = state.cartItems.find(
        (item) => item._id === product._id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({
          ...product,
          quantity: 1,
        });
      }
    },

    
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload
      );
    },

    
    increaseQty: (state, action) => {
      const item = state.cartItems.find(
        (item) => item._id === action.payload
      );

      if (item) {
        item.quantity += 1;
      }
    },

    
    decreaseQty: (state, action) => {
      const item = state.cartItems.find(
        (item) => item._id === action.payload
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQty,
  decreaseQty,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;