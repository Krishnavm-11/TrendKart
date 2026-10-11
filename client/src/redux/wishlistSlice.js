
import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",

  initialState: {
    wishlistItems: [],
  },

  reducers: {
    // Load the logged-in user's wishlist
    setWishlistItems: (state, action) => {
      state.wishlistItems = action.payload;
    },

    // Add or remove a product from the wishlist
    toggleWishlist: (state, action) => {
      const product = action.payload;

      const existingItem = state.wishlistItems.find(
        (item) => item._id === product._id
      );

      if (existingItem) {
        state.wishlistItems = state.wishlistItems.filter(
          (item) => item._id !== product._id
        );
      } else {
        state.wishlistItems.push(product);
      }
    },

    // Remove a product from the wishlist
    removeFromWishlist: (state, action) => {
      state.wishlistItems = state.wishlistItems.filter(
        (item) => item._id !== action.payload
      );
    },

    // Clear the current wishlist on logout
    clearWishlist: (state) => {
      state.wishlistItems = [];
    },
  },
});

export const {
  setWishlistItems,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;