
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminProducts from "../components/admin/AdminProducts";
import AdminUsers from "../components/admin/AdminUsers";
import AdminOrders from "../components/admin/AdminOrders";
import AdminOffers from "../components/admin/AdminOffers";
import AdminAnalytics from "../components/admin/AdminAnalytics";

function AdminDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
  });

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/admin/login", { replace: true });
      return;
    }

    const getArray = (data, key) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.[key])) return data[key];
      if (Array.isArray(data?.data)) return data.data;
      return [];
    };

    const fetchStats = async () => {
      try {
        const results = await Promise.allSettled([
          API.get("/admin/users"),
          API.get("/products"),
          API.get("/orders"),
        ]);

        setStats({
          users:
            results[0].status === "fulfilled"
              ? Number(
                  results[0].value.data.totalUsers ??
                  getArray(results[0].value.data, "users").length
                )
              : 0,

          products:
            results[1].status === "fulfilled"
              ? Number(
                  results[1].value.data.totalProducts ??
                  getArray(results[1].value.data, "products").length
                )
              : 0,

          orders:
            results[2].status === "fulfilled"
              ? Number(
                  results[2].value.data.totalOrders ??
                  getArray(results[2].value.data, "orders").length
                )
              : 0,
        });

        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(
              `Dashboard request ${index + 1} failed:`,
              result.reason?.response?.data ||
                result.reason?.message
            );
          }
        });
      } catch (error) {
        console.error("Dashboard statistics error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/admin/login", { replace: true });
  };

  const cards = [
    {
      label: "Total Users",
      value: stats.users,
      description: "Registered customers",
      symbol: "U",
    },
    {
      label: "Total Products",
      value: stats.products,
      description: "Products in your store",
      symbol: "P",
    },
    {
      label: "Total Orders",
      value: stats.orders,
      description: "Orders received",
      symbol: "O",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f7f5f0] text-[#211f1b]">
      <AdminSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      />

      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-12">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#927858]">
              TRENDKART / ADMIN
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {activePage}
            </h1>

            <p className="mt-2 text-sm text-[#817b72]">
              {activePage === "Dashboard"
                ? "A clear overview of your store."
                : `Manage your store's ${activePage.toLowerCase()}.`}
            </p>
          </div>

          <div className="rounded-full border border-[#e4dccf] bg-white px-4 py-2">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#7a8b67]" />
            <span className="text-xs font-medium text-[#5f594f]">
              Admin workspace
            </span>
          </div>
        </header>

        {activePage === "Dashboard" && (
          <>
            <section className="mb-8 rounded-2xl bg-[#201e1a] p-6 text-white sm:p-9">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c6b59b]">
                STORE OVERVIEW
              </p>

              <h2 className="mt-4 max-w-lg text-2xl font-medium leading-snug sm:text-3xl">
                Everything your store needs,
                <span className="block text-[#d9c5a5]">
                  in one place.
                </span>
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-[#c4beb3]">
                Monitor your store activity and manage your
                products, customers, and orders.
              </p>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Store statistics
                </h2>

                <span className="text-xs text-[#817b72]">
                  All-time totals
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-[#e7e0d5] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#817b72]">
                        {card.label}
                      </p>

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2ede4] text-sm font-semibold text-[#8b7355]">
                        {card.symbol}
                      </span>
                    </div>

                    <p className="mt-6 text-4xl font-semibold tracking-tight">
                      {loading
                        ? "—"
                        : card.value.toLocaleString()}
                    </p>

                    <p className="mt-2 text-xs text-[#928b80]">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 rounded-2xl border border-[#e7e0d5] bg-white p-6">
              <p className="text-sm font-semibold">Quick note</p>

              <p className="mt-2 text-sm leading-6 text-[#817b72]">
                Use the sidebar to manage products, review orders,
                view customers, configure offers, and explore analytics.
              </p>
            </section>
          </>
        )}

        {activePage === "Users" && <AdminUsers />}
        {activePage === "Products" && <AdminProducts />}
        {activePage === "Orders" && <AdminOrders />}
        {activePage === "Offers & Discounts" && <AdminOffers />}
        {activePage === "Analytics" && <AdminAnalytics />}
      </main>
    </div>
  );
}

export default AdminDashboard;
