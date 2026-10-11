
export const getUserId = () => {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  return user?._id || user?.id || user?.email || null;
};

export const getCartKey = (userId) =>
  `cartItems_${userId}`;

export const getWishlistKey = (userId) =>
  `wishlistItems_${userId}`;

export const getUserCart = (userId) => {
  if (!userId) return [];

  return JSON.parse(
    localStorage.getItem(getCartKey(userId)) || "[]"
  );
};

export const getUserWishlist = (userId) => {
  if (!userId) return [];

  return JSON.parse(
    localStorage.getItem(getWishlistKey(userId)) || "[]"
  );
};

export const saveUserCart = (userId, items) => {
  if (!userId) return;

  localStorage.setItem(
    getCartKey(userId),
    JSON.stringify(items)
  );
};

export const saveUserWishlist = (userId, items) => {
  if (!userId) return;

  localStorage.setItem(
    getWishlistKey(userId),
    JSON.stringify(items)
  );
};