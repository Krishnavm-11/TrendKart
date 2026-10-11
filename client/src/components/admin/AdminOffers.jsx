import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const getDateValue = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().split("T")[0];
};

const calculateDiscountPrice = (price, percent) => {
  const originalPrice = Number(price) || 0;
  const discount = Number(percent) || 0;

  return originalPrice - (originalPrice * discount) / 100;
};

const getOfferStatus = (product) => {
  if (!product.offerActive || Number(product.offerPercent) <= 0) {
    return {
      label: "Inactive",
      style: "bg-stone-100 text-stone-600",
    };
  }

  const now = new Date();

  if (
    product.offerStartDate &&
    new Date(product.offerStartDate) > now
  ) {
    return {
      label: "Scheduled",
      style: "bg-blue-50 text-blue-700",
    };
  }

  if (
    product.offerEndDate &&
    new Date(product.offerEndDate) < now
  ) {
    return {
      label: "Expired",
      style: "bg-red-50 text-red-700",
    };
  }

  return {
    label: "Active",
    style: "bg-emerald-50 text-emerald-700",
  };
};

export default function AdminOffers() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch products from the existing products API.
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      const productList = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];

      setProducts(productList);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load products. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open the offer editor for a product.
  const openEditor = (product) => {
    setEditingProduct({
      _id: product._id,
      name: product.name || "",
      brand: product.brand || "",
      price: product.price || 0,
      image: product.image || "",
      category: product.category || "",
      offerPercent: Number(product.offerPercent) || 0,
      offerActive: Boolean(product.offerActive),
      offerStartDate: getDateValue(product.offerStartDate),
      offerEndDate: getDateValue(product.offerEndDate),
    });

    setError("");
    setMessage("");
  };

  // Update the form fields.
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setEditingProduct((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Validate the offer before showing confirmation.
  const handleSaveClick = (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const percent = Number(editingProduct.offerPercent);

    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      setError("Discount must be between 0 and 100.");
      return;
    }

    if (
      editingProduct.offerStartDate &&
      editingProduct.offerEndDate &&
      editingProduct.offerStartDate >
        editingProduct.offerEndDate
    ) {
      setError("End date must be on or after the start date.");
      return;
    }

    if (editingProduct.offerActive && percent <= 0) {
      setError(
        "Enter a discount greater than 0 to activate an offer."
      );
      return;
    }

    setShowConfirm(true);
  };

  // Save offer settings to the existing product endpoint.
  const handleSaveOffer = async () => {
    if (!editingProduct) return;

    try {
      setSavingId(editingProduct._id);
      setError("");
      setMessage("");

      const payload = {
        offerPercent: Number(editingProduct.offerPercent),
        offerActive: Boolean(editingProduct.offerActive),
        offerStartDate: editingProduct.offerStartDate
          ? new Date(
              `${editingProduct.offerStartDate}T00:00:00`
            ).toISOString()
          : null,
        offerEndDate: editingProduct.offerEndDate
          ? new Date(
              `${editingProduct.offerEndDate}T23:59:59.999`
            ).toISOString()
          : null,
      };

      const response = await api.put(
        `/products/${editingProduct._id}`,
        payload
      );

      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product._id === editingProduct._id
            ? { ...product, ...response.data }
            : product
        )
      );

      setShowConfirm(false);
      setEditingProduct(null);
      setMessage("Offer settings saved successfully.");
    } catch (error) {
      setShowConfirm(false);

      setError(
        error.response?.data?.message ||
          "Unable to save offer settings."
      );
    } finally {
      setSavingId("");
    }
  };

  // Search and filter products.
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchableText =
        `${product.name || ""} ${product.brand || ""} ${product.category || ""}`.toLowerCase();

      const matchesSearch = searchableText.includes(
        search.trim().toLowerCase()
      );

      const status = getOfferStatus(product).label;

      const matchesFilter =
        filter === "All" || status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const activeCount = products.filter(
    (product) => getOfferStatus(product).label === "Active"
  ).length;

  const scheduledCount = products.filter(
    (product) => getOfferStatus(product).label === "Scheduled"
  ).length;

  const inactiveCount = products.filter(
    (product) => getOfferStatus(product).label === "Inactive"
  ).length;

  const discountedCount = products.filter(
    (product) =>
      Number(product.offerPercent) > 0 &&
      product.offerActive
  ).length;

  return (
    <div className="min-h-screen bg-[#f8f6f2] p-4 text-[#24211e] sm:p-6 lg:p-8">
      {/* Heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#9a7954]">
            Store management
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Offers & Discounts
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Create and manage promotional pricing for your products.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProducts}
          disabled={loading}
          className="rounded-xl bg-[#25221f] px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh products"}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            className="ml-3 font-semibold"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-3 font-semibold"
          >
            ×
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#e9e3d9] bg-white p-5">
          <p className="text-sm text-stone-500">Total products</p>
          <h2 className="mt-3 text-3xl font-semibold">
            {products.length}
          </h2>
          <p className="mt-2 text-xs text-stone-400">
            Products in your catalogue
          </p>
        </div>

        <div className="rounded-2xl border border-[#e9e3d9] bg-white p-5">
          <p className="text-sm text-stone-500">Active offers</p>
          <h2 className="mt-3 text-3xl font-semibold text-emerald-700">
            {activeCount}
          </h2>
          <p className="mt-2 text-xs text-stone-400">
            Currently within offer dates
          </p>
        </div>

        <div className="rounded-2xl border border-[#e9e3d9] bg-white p-5">
          <p className="text-sm text-stone-500">Scheduled offers</p>
          <h2 className="mt-3 text-3xl font-semibold text-blue-700">
            {scheduledCount}
          </h2>
          <p className="mt-2 text-xs text-stone-400">
            Waiting for the start date
          </p>
        </div>

        <div className="rounded-2xl border border-[#e9e3d9] bg-white p-5">
          <p className="text-sm text-stone-500">Inactive products</p>
          <h2 className="mt-3 text-3xl font-semibold">
            {inactiveCount}
          </h2>
          <p className="mt-2 text-xs text-stone-400">
            Offers switched off or not configured
          </p>
        </div>
      </div>

      {/* Product offer list */}
      <div className="overflow-hidden rounded-2xl border border-[#e9e3d9] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#eee9e1] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Product offers
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-xl border border-[#e5dfd5] bg-[#fdfcf9] px-4 py-3 text-sm outline-none focus:border-[#9a7954] sm:w-56"
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-[#e5dfd5] bg-[#fdfcf9] px-4 py-3 text-sm outline-none focus:border-[#9a7954]"
            >
              <option value="All">All offers</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-stone-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f0e8] text-2xl">
              %
            </div>

            <h3 className="font-semibold">No products found</h3>

            <p className="mt-2 text-sm text-stone-500">
              Try a different search or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-[#faf8f4] text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Discount</th>
                  <th className="px-5 py-4 font-medium">Offer price</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#f0ece5]">
                {filteredProducts.map((product) => {
                  const status = getOfferStatus(product);

                  const hasDiscount =
                    Number(product.offerPercent) > 0;

                  const discountedPrice = calculateDiscountPrice(
                    product.price,
                    product.offerPercent
                  );

                  return (
                    <tr
                      key={product._id}
                      className="transition hover:bg-[#fdfbf7]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-14 w-14 rounded-xl border border-stone-100 bg-stone-50 object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-400">
                              No image
                            </div>
                          )}

                          <div>
                            <p className="font-medium">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-stone-500">
                              {product.brand || product.category || "Product"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-stone-600">
                        {formatPrice(product.price)}
                      </td>

                      <td className="px-5 py-4">
                        {hasDiscount ? (
                          <span className="rounded-full bg-[#f5eee4] px-3 py-1.5 text-sm font-semibold text-[#876744]">
                            {product.offerPercent}% OFF
                          </span>
                        ) : (
                          <span className="text-sm text-stone-400">
                            No discount
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {hasDiscount
                            ? formatPrice(discountedPrice)
                            : "—"}
                        </p>

                        {hasDiscount && (
                          <p className="mt-1 text-xs text-stone-400">
                            Before offer activation
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status.style}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openEditor(product)}
                          className="rounded-lg border border-[#e5dfd5] px-4 py-2 text-sm font-semibold text-[#765b3c] transition hover:border-[#25221f] hover:bg-[#25221f] hover:text-white"
                        >
                          Manage offer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Offer editor modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-stone-200 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#9a7954]">
                  Promotion settings
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Manage offer
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  {editingProduct.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setShowConfirm(false);
                  setError("");
                }}
                className="rounded-full px-3 py-1 text-2xl text-stone-500 hover:bg-stone-100 hover:text-black"
                aria-label="Close offer editor"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveClick}>
              <div className="space-y-5 p-5 sm:p-6">
                {/* Product price */}
                <div className="rounded-xl bg-[#faf8f4] p-4">
                  <p className="text-sm text-stone-500">
                    Original price
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    {formatPrice(editingProduct.price)}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Product price is not changed by this form.
                  </p>
                </div>

                {/* Discount percentage */}
                <div>
                  <label
                    htmlFor="offerPercent"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Discount percentage (%)
                  </label>

                  <input
                    id="offerPercent"
                    name="offerPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    value={editingProduct.offerPercent}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-[#9a7954]"
                  />

                  <p className="mt-2 text-sm text-stone-500">
                    Customer price preview:{" "}
                    <span className="font-semibold text-[#25221f]">
                      {formatPrice(
                        calculateDiscountPrice(
                          editingProduct.price,
                          editingProduct.offerPercent
                        )
                      )}
                    </span>
                  </p>
                </div>

                {/* Activate offer */}
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200 p-4">
                  <div>
                    <p className="font-semibold">Activate offer</p>

                    <p className="mt-1 text-sm text-stone-500">
                      Enable or disable this product's offer.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="offerActive"
                    checked={editingProduct.offerActive}
                    onChange={handleChange}
                    className="h-5 w-5 accent-[#25221f]"
                  />
                </label>

                {/* Start date */}
                <div>
                  <label
                    htmlFor="offerStartDate"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Offer start date (optional)
                  </label>

                  <input
                    id="offerStartDate"
                    name="offerStartDate"
                    type="date"
                    value={editingProduct.offerStartDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-[#9a7954]"
                  />

                  <p className="mt-1 text-xs text-stone-400">
                    Leave empty to start immediately when activated.
                  </p>
                </div>

                {/* End date */}
                <div>
                  <label
                    htmlFor="offerEndDate"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Offer end date (optional)
                  </label>

                  <input
                    id="offerEndDate"
                    name="offerEndDate"
                    type="date"
                    min={editingProduct.offerStartDate || undefined}
                    value={editingProduct.offerEndDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-[#9a7954]"
                  />

                  <p className="mt-1 text-xs text-stone-400">
                    Leave empty for no scheduled end date.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-stone-200 p-5 sm:flex-row sm:p-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowConfirm(false);
                    setError("");
                  }}
                  className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#25221f] px-5 py-3 text-sm font-medium text-white hover:bg-black"
                >
                  Save offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom save confirmation modal */}
      {showConfirm && editingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">
              Save offer changes?
            </h2>

            <p className="mt-3 text-sm leading-6 text-stone-500">
              Save the {editingProduct.offerPercent}% discount settings
              for {editingProduct.name}?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(savingId)}
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-stone-200 px-4 py-3 text-sm font-medium hover:bg-stone-50 disabled:opacity-50"
              >
                Go back
              </button>

              <button
                type="button"
                disabled={Boolean(savingId)}
                onClick={handleSaveOffer}
                className="rounded-xl bg-[#25221f] px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
              >
                {savingId ? "Saving..." : "Confirm save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}