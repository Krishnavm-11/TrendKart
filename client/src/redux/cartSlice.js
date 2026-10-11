import { createSlice } from "@reduxjs/toolkit";

const normalizeSize = (size) => size || null;

const isSameCartItem = (item, product) => {
  return (
    String(item._id) === String(product._id) &&
    normalizeSize(item.selectedSize) ===
      normalizeSize(product.selectedSize)
  );
};

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    cartItems: [],
  },

  reducers: {
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },

    addToCart: (state, action) => {
      const product = action.payload;

      const existingItem = state.cartItems.find((item) =>
        isSameCartItem(item, product)
      );

      if (existingItem) {
        existingItem.quantity += Number(product.quantity) || 1;
      } else {
        state.cartItems.push({
          ...product,
          selectedSize: normalizeSize(product.selectedSize),
          quantity: Number(product.quantity) || 1,
        });
      }
    },

    // Select or change the size from the Cart page
    selectCartItemSize: (state, action) => {
      const { id, oldSize = null, newSize } = action.payload;

      if (!newSize) return;

      const itemIndex = state.cartItems.findIndex(
        (item) =>
          String(item._id) === String(id) &&
          normalizeSize(item.selectedSize) ===
            normalizeSize(oldSize)
      );

      if (itemIndex === -1) return;

      const item = state.cartItems[itemIndex];

      const existingItemIndex = state.cartItems.findIndex(
        (otherItem, index) =>
          index !== itemIndex &&
          String(otherItem._id) === String(id) &&
          normalizeSize(otherItem.selectedSize) ===
            normalizeSize(newSize)
      );

      if (existingItemIndex !== -1) {
        state.cartItems[existingItemIndex].quantity +=
          item.quantity;

        state.cartItems.splice(itemIndex, 1);
      } else {
        item.selectedSize = newSize;
      }
    },

    // Update the size from Product Details
    updateCartItemSize: (state, action) => {
      const { id, selectedSize } = action.payload;
      const newSize = normalizeSize(selectedSize);

      const itemIndex = state.cartItems.findIndex(
        (item) => String(item._id) === String(id)
      );

      if (itemIndex === -1) return;

      const item = state.cartItems[itemIndex];

      // Avoid doing anything if the size is unchanged
      if (normalizeSize(item.selectedSize) === newSize) {
        return;
      }

      // Merge with an existing entry of the same product and size
      const existingItemIndex = state.cartItems.findIndex(
        (otherItem, index) =>
          index !== itemIndex &&
          String(otherItem._id) === String(id) &&
          normalizeSize(otherItem.selectedSize) === newSize
      );

      if (existingItemIndex !== -1) {
        state.cartItems[existingItemIndex].quantity +=
          item.quantity;

        state.cartItems.splice(itemIndex, 1);
      } else {
        item.selectedSize = newSize;
      }
    },

    increaseQty: (state, action) => {
      const { id, selectedSize } =
        typeof action.payload === "object"
          ? action.payload
          : {
              id: action.payload,
              selectedSize: undefined,
            };

      const item = state.cartItems.find((item) => {
        if (String(item._id) !== String(id)) return false;

        return (
          selectedSize === undefined ||
          normalizeSize(item.selectedSize) ===
            normalizeSize(selectedSize)
        );
      });

      if (item) {
        item.quantity += 1;
      }
    },

    decreaseQty: (state, action) => {
      const { id, selectedSize } =
        typeof action.payload === "object"
          ? action.payload
          : {
              id: action.payload,
              selectedSize: undefined,
            };

      const item = state.cartItems.find((item) => {
        if (String(item._id) !== String(id)) return false;

        return (
          selectedSize === undefined ||
          normalizeSize(item.selectedSize) ===
            normalizeSize(selectedSize)
        );
      });

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    updateQuantity: (state, action) => {
      const { id, selectedSize, quantity } = action.payload;

      const item = state.cartItems.find((item) => {
        if (String(item._id) !== String(id)) return false;

        return (
          selectedSize === undefined ||
          normalizeSize(item.selectedSize) ===
            normalizeSize(selectedSize)
        );
      });

      if (
        item &&
        Number.isInteger(quantity) &&
        quantity > 0
      ) {
        item.quantity = quantity;
      }
    },

    removeFromCart: (state, action) => {
      const { id, selectedSize } =
        typeof action.payload === "object"
          ? action.payload
          : {
              id: action.payload,
              selectedSize: undefined,
            };

      state.cartItems = state.cartItems.filter((item) => {
        if (String(item._id) !== String(id)) return true;

        if (selectedSize === undefined) return false;

        return (
          normalizeSize(item.selectedSize) !==
          normalizeSize(selectedSize)
        );
      });
    },

    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const {
  setCartItems,
  addToCart,
  selectCartItemSize,
  updateCartItemSize,
  increaseQty,
  decreaseQty,
  updateQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;