import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer";

import Home from "./pages/Home.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import BuyNow from "./pages/BuyNow.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import Payment from "./pages/Payment.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";

import { setCartItems } from "./redux/cartSlice";
import { setWishlistItems } from "./redux/wishlistSlice";

import {
  getUserId,
  getUserCart,
  getUserWishlist,
  saveUserCart,
  saveUserWishlist,
} from "./utils/userStorage";

function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const userId = getUserId();
  const loadedUserId = useRef(undefined);

  // Check whether the current page is an admin page
  const isAdminPage = location.pathname.startsWith("/admin");

  // Load the correct user's cart and wishlist
  useEffect(() => {
    if (loadedUserId.current === userId) {
      return;
    }

    loadedUserId.current = userId;

    dispatch(setCartItems(getUserCart(userId)));
    dispatch(setWishlistItems(getUserWishlist(userId)));
  }, [userId, dispatch]);

  // Save cart for the current user
  useEffect(() => {
    if (loadedUserId.current !== userId) {
      return;
    }

    if (userId) {
      saveUserCart(userId, cartItems);
    }
  }, [cartItems, userId]);

  // Save wishlist for the current user
  useEffect(() => {
    if (loadedUserId.current !== userId) {
      return;
    }

    if (userId) {
      saveUserWishlist(userId, wishlistItems);
    }
  }, [wishlistItems, userId]);

  return (
    <>
      {/* Hide the customer navbar on admin pages */}
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* Customer pages */}
        <Route path="/" element={<Home />} />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route path="/cart" element={<Cart />} />

        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="/buy" element={<BuyNow />} />

        <Route path="/payment" element={<Payment />} />

        <Route
          path="/payment-success"
          element={<PaymentSuccess />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/category/:categoryName"
          element={<CategoryPage />}
        />

        <Route path="/search" element={<SearchResults />} />

        <Route path="/orders" element={<OrderHistory />} />

        {/* Admin pages */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      {/* Hide the customer footer on admin pages */}
      {!isAdminPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;