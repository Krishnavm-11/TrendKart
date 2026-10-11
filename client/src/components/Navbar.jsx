import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  ShoppingBag,
  Search,
  Menu,
  X,
  UserRound,
  Package,
  ChevronDown,
} from "lucide-react";

import { checkLogin } from "../utils/authCheck";

function Navbar() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Men", path: "/category/men" },
    { name: "Women", path: "/category/women" },
    { name: "Kids", path: "/category/kids" },
    { name: "Footwear", path: "/category/footwear" },
    { name: "Accessories", path: "/category/accessories" },
  ];

  const handleSearch = (event) => {
    event.preventDefault();

    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    // Remove login information.
    // Do not clear Redux cart/wishlist here because
    // that may overwrite the saved user's shopping data.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setMenuOpen(false);
    navigate("/login");
  };

  const handleCartClick = () => {
    setMenuOpen(false);

    if (checkLogin()) {
      navigate("/cart");
    }
  };

  const handleWishlistClick = () => {
    setMenuOpen(false);

    if (checkLogin()) {
      navigate("/wishlist");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#eae3d9] bg-[#fffdf9]">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 xl:px-10">

        {/* Main Navbar */}
        <div className="flex min-h-[82px] items-center justify-between gap-5">

          {/* Brand Logo */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="group flex shrink-0 items-center gap-2.5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#191713] text-[#d7bd96] transition duration-300 group-hover:bg-[#8d704b] group-hover:text-white">
              <ShoppingBag size={23} strokeWidth={1.6} />
            </div>

            <div className="flex flex-col">
              <span className="text-[21px] font-extrabold leading-none tracking-[1.2px]">
                <span className="text-[#191713]">TREND</span>
                <span className="text-[#a8875c]">KART</span>
              </span>

              <span className="mt-1.5 text-[8px] font-medium tracking-[3px] text-[#8a8073]">
                STYLE THAT SPEAKS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-5 xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="relative whitespace-nowrap py-2 text-[13px] font-medium text-[#45413b] transition hover:text-[#a8875c] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#a8875c] after:transition-all hover:after:w-full"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex w-40 items-center rounded-full border border-[#e8e0d5] bg-white px-3 transition focus-within:border-[#b79a72] xl:w-48"
            >
              <Search size={16} className="shrink-0 text-[#81786c]" />

              <input
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent px-2 py-2.5 text-xs text-[#26231e] outline-none placeholder:text-[#a29a8f]"
              />
            </form>

            {/* Orders */}
            {token && (
              <Link
                to="/orders"
                className="whitespace-nowrap text-[13px] font-medium text-[#45413b] transition hover:text-[#a8875c]"
              >
                Orders
              </Link>
            )}

            {/* Login / Logout */}
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="whitespace-nowrap text-[13px] font-medium text-[#45413b] transition hover:text-[#a8875c]"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="whitespace-nowrap text-[13px] font-medium text-[#45413b] transition hover:text-[#a8875c]"
              >
                Login
              </Link>
            )}

            {/* Wishlist */}
            <button
              type="button"
              title="Wishlist"
              aria-label="Open wishlist"
              onClick={handleWishlistClick}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#34302a] transition hover:bg-[#f1ebe2] hover:text-[#a8875c]"
            >
              <Heart size={21} strokeWidth={1.6} />
            </button>

            {/* Cart */}
            <button
              type="button"
              title="Cart"
              aria-label="Open cart"
              onClick={handleCartClick}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#34302a] transition hover:bg-[#191713] hover:text-white"
            >
              <ShoppingCart size={21} strokeWidth={1.6} />
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              title="Wishlist"
              aria-label="Open wishlist"
              onClick={handleWishlistClick}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#34302a] hover:bg-[#f1ebe2]"
            >
              <Heart size={21} strokeWidth={1.7} />
            </button>

            <button
              type="button"
              title="Cart"
              aria-label="Open cart"
              onClick={handleCartClick}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#34302a] hover:bg-[#f1ebe2]"
            >
              <ShoppingCart size={21} strokeWidth={1.7} />
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#191713] text-white"
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-[#eae3d9] bg-[#fffdf9] px-5 pb-6 pt-5 lg:hidden">

          {/* User */}
          {token && (
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#f4efe7] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#191713] text-[#d7bd96]">
                <UserRound size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-[#8a8073]">Welcome back</p>
                <p className="truncate text-sm font-semibold text-[#191713]">
                  {user?.name || user?.email || "TrendKart customer"}
                </p>
              </div>
            </div>
          )}

          {/* Mobile Search */}
          <form
            onSubmit={handleSearch}
            className="mb-5 flex items-center rounded-xl border border-[#e8e0d5] bg-white px-3"
          >
            <Search size={18} className="text-[#81786c]" />

            <input
              type="text"
              placeholder="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent px-3 py-3 text-sm outline-none"
            />
          </form>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-[#eee7dd] px-4 py-3 text-sm font-medium text-[#34302a] transition hover:border-[#c4a77d] hover:bg-[#f6f0e7]"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Account Actions */}
          <div className="mt-4 flex gap-2">
            {token ? (
              <>
                <Link
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#f0ebe3] px-4 py-3 text-sm font-medium text-[#34302a]"
                >
                  <Package size={17} />
                  My Orders
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 rounded-lg bg-[#191713] px-4 py-3 text-sm font-medium text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-[#191713] px-4 py-3 text-sm font-medium text-white"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;