import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/orders/analytics");

      setAnalytics(response.data);
    } catch (error) {
      console.error("Analytics loading error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const summary = analytics?.summary;

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#e6dfd2] border-t-[#8b7355]" />
          <p className="mt-4 text-sm text-gray-500">
            Loading store analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-[#211f1b]">
          Analytics unavailable
        </h3>

        <p className="mt-2 text-sm text-gray-500">{error}</p>

        <button
          onClick={fetchAnalytics}
          className="mt-5 rounded-lg bg-[#211f1b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#514638]"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statusColors = {
    Pending: "#c5a572",
    Confirmed: "#718c77",
    Shipped: "#7796b5",
    Delivered: "#52785c",
    Cancelled: "#c47b75",
    Declined: "#9a6666",
  };

  const statusCounts = analytics?.statusCounts || {};
  const monthlySales = analytics?.monthlySales || [];
  const topProducts = analytics?.topProducts || [];

  const maxRevenue = Math.max(
    ...monthlySales.map((item) => item.revenue),
    1
  );

  const maxQuantity = Math.max(
    ...topProducts.map((item) => item.quantitySold),
    1
  );

  const totalStatusOrders = Object.values(statusCounts).reduce(
    (total, count) => total + count,
    0
  );

  const metrics = [
    {
      label: "Total Revenue",
      value: formatCurrency(summary?.totalRevenue),
      description: "Revenue from paid orders",
      icon: "₹",
    },
    {
      label: "Total Orders",
      value: summary?.totalOrders ?? 0,
      description: "All orders received",
      icon: "O",
    },
    {
      label: "Paid Orders",
      value: summary?.paidOrders ?? 0,
      description: "Successfully paid orders",
      icon: "✓",
    },
    {
      label: "Average Order Value",
      value: formatCurrency(summary?.averageOrderValue),
      description: "Average value per paid order",
      icon: "↗",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-gray-500">
            Track sales, orders and product performance.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#e6dfd2] bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-[#f3eee5] sm:self-auto"
        >
          <span>↻</span>
          Refresh Data
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-[#e6dfd2] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-gray-500">{metric.label}</p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3eee5] font-semibold text-[#8b7355]">
                {metric.icon}
              </span>
            </div>

            <h3 className="mt-5 break-words text-2xl font-semibold tracking-tight text-[#211f1b]">
              {metric.value}
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              {metric.description}
            </p>
          </div>
        ))}
      </div>

      {/* Current month */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#e6dfd2] bg-[#211f1b] p-6 text-white">
          <p className="text-sm text-[#d3c7b5]">Current Month Revenue</p>

          <h3 className="mt-3 text-3xl font-semibold">
            {formatCurrency(summary?.currentMonthRevenue)}
          </h3>

          <p className="mt-3 text-sm text-[#d3c7b5]">
            Revenue from paid orders created this month
          </p>
        </div>

        <div className="rounded-2xl border border-[#e6dfd2] bg-white p-6">
          <p className="text-sm text-gray-500">Current Month Orders</p>

          <h3 className="mt-3 text-3xl font-semibold text-[#211f1b]">
            {summary?.currentMonthOrders ?? 0}
          </h3>

          <p className="mt-3 text-sm text-gray-500">
            Orders created during the current month
          </p>
        </div>
      </div>

      {/* Monthly revenue chart */}
      <section className="rounded-2xl border border-[#e6dfd2] bg-white p-6">
        <div className="mb-7">
          <h3 className="text-lg font-semibold text-[#211f1b]">
            Monthly Sales Overview
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Revenue and order activity over the available months
          </p>
        </div>

        {monthlySales.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-gray-500">
            No order data available yet.
          </div>
        ) : (
          <div className="space-y-5">
            {monthlySales.map((item) => {
              const monthLabel = new Date(
                `${item.month}-01T12:00:00`
              ).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              });

              return (
                <div key={item.month}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#211f1b]">
                      {monthLabel}
                    </span>

                    <div className="text-right text-xs text-gray-500">
                      <span>{formatCurrency(item.revenue)}</span>
                      <span className="mx-2">·</span>
                      <span>{item.orders} orders</span>
                    </div>
                  </div>

                  <div
                    className="h-3 overflow-hidden rounded-full bg-[#f1ede6]"
                    role="img"
                    aria-label={`${monthLabel}: ${formatCurrency(item.revenue)} revenue`}
                  >
                    <div
                      className="h-full rounded-full bg-[#8b7355] transition-all duration-500"
                      style={{
                        width: `${
                          (item.revenue / maxRevenue) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Order status and top products */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Order status */}
        <section className="rounded-2xl border border-[#e6dfd2] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#211f1b]">
            Order Status
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Distribution of all orders by status
          </p>

          {totalStatusOrders === 0 ? (
            <div className="flex min-h-40 items-center justify-center text-sm text-gray-500">
              No orders available yet.
            </div>
          ) : (
            <div className="mt-7 space-y-5">
              {Object.entries(statusCounts).map(([status, count]) => {
                const percentage = (
                  (count / totalStatusOrders) *
                  100
                ).toFixed(1);

                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              statusColors[status] || "#8b7355",
                          }}
                        />

                        <span className="text-sm text-[#211f1b]">
                          {status}
                        </span>
                      </div>

                      <span className="text-sm text-gray-500">
                        {count} ({percentage}%)
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#f1ede6]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor:
                            statusColors[status] || "#8b7355",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Top selling products */}
        <section className="rounded-2xl border border-[#e6dfd2] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#211f1b]">
            Top Selling Products
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Best-performing products by quantity sold
          </p>

          {topProducts.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center text-sm text-gray-500">
              Product sales will appear after paid orders.
            </div>
          ) : (
            <div className="mt-7 space-y-5">
              {topProducts.map((product, index) => (
                <div key={product.productId}>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3eee5] text-sm font-semibold text-[#8b7355]">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#211f1b]">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {product.quantitySold} sold
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-[#211f1b]">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>

                  <div className="ml-12 h-2 overflow-hidden rounded-full bg-[#f1ede6]">
                    <div
                      className="h-full rounded-full bg-[#8b7355] transition-all duration-500"
                      style={{
                        width: `${
                          (product.quantitySold / maxQuantity) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <p className="pb-2 text-xs leading-5 text-gray-500">
        Analytics are calculated from your current order records. Revenue
        includes orders marked as paid; cancelled or refunded orders may
        need separate handling if your store supports refunds.
      </p>
    </div>
  );
}

export default AdminAnalytics;