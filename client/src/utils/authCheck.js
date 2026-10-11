import toast from "react-hot-toast";

export const checkLogin = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Please login first to view your cart");
    return false;
  }

  return true;
};