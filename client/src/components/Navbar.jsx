import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function Navbar() {
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim()) {
      navigate(`/search?q=${search.trim()}`);
      setSearch("");
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Men", path: "/category/men" },
    { name: "Women", path: "/category/women" },
    { name: "Kids", path: "/category/kids" },
    { name: "Footwear", path: "/category/footwear" },
    { name: "Accessories", path: "/category/accessories" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="h-20 flex items-center justify-between gap-6">
          <Link
            to="/"
            className="text-2xl font-extrabold text-black whitespace-nowrap"
          >
            TrendKart
          </Link>

          <div className="hidden lg:flex items-center gap-7 font-medium text-gray-700">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="hover:text-black transition whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 xl:w-64 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-black"
              />
            </form>

            {token && (
              <Link
                to="/orders"
                className="font-medium text-gray-700 hover:text-black whitespace-nowrap"
              >
                Orders
              </Link>
            )}

            {token ? (
              <button
                onClick={handleLogout}
                className="font-medium text-gray-700 hover:text-black whitespace-nowrap"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="font-medium text-gray-700 hover:text-black whitespace-nowrap"
              >
                Login
              </Link>
            )}

            <Link
              to="/cart"
              className="bg-black text-white px-5 py-2 rounded-lg whitespace-nowrap"
            >
              Cart ({totalCartItems})
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden border px-3 py-2 rounded-lg font-semibold"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-5">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 outline-none"
              />
            </form>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="bg-gray-100 px-4 py-3 rounded-lg font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {token && (
                <Link
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center bg-gray-100 px-4 py-3 rounded-lg font-medium"
                >
                  Orders
                </Link>
              )}

              {token ? (
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-medium"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center bg-gray-100 px-4 py-3 rounded-lg font-medium"
                >
                  Login
                </Link>
              )}

              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center bg-black text-white px-4 py-3 rounded-lg font-medium"
              >
                Cart ({totalCartItems})
              </Link>
            </div>

            {token && user?.name && (
              <p className="mt-4 text-sm text-gray-500">
                Logged in as {user.name}
              </p>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;