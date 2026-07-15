import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import BuyNow from "./pages/BuyNow";
import PaymentSuccess from "./pages/PaymentSuccess";
import Payment from "./pages/Payment";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CategoryPage from "./pages/CategoryPage";
import SearchResults from "./pages/SearchResults";
import OrderHistory from "./pages/OrderHistory";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/buy" element={<BuyNow />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/orders" element={<OrderHistory />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
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