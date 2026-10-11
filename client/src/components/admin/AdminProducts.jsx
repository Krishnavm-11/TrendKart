import { useEffect, useState } from "react";
import API from "../../services/api";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null,
  });

  // Get products from the backend
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await API.get("/products");

      const productList = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];

      setProducts(productList);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load products. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update form values
  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: name === "image" ? files[0] : value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: null,
    });

    setEditId(null);
    setShowForm(false);
  };

  // Open add product form
  const handleAdd = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Open edit product form
  const handleEdit = (product) => {
    setEditId(product._id);

    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "",
      stock: product.stock ?? "",
      image: null,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Add or update product
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append("brand", formData.brand.trim());
      data.append("description", formData.description.trim());
      data.append("price", formData.price);
      data.append("category", formData.category.trim());
      data.append("stock", formData.stock);

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (editId) {
        await API.put(`/products/${editId}`, data);
        setSuccess("Product updated successfully.");
      } else {
        if (!formData.image) {
          setError("Please select a product image.");
          setSaving(false);
          return;
        }

        await API.post("/products", data);
        setSuccess("Product added successfully.");
      }

      resetForm();
      await fetchProducts();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Open custom delete confirmation
  const handleDeleteClick = (product) => {
    setDeleteProduct(product);
    setError("");
    setSuccess("");
  };

  // Delete product after confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await API.delete(`/products/${deleteProduct._id}`);

      setProducts((previousProducts) =>
        previousProducts.filter(
          (product) => product._id !== deleteProduct._id
        )
      );

      setSuccess("Product deleted successfully.");
      setDeleteProduct(null);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete product. Please try again."
      );

      setDeleteProduct(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Page heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">All Products</h3>

          <p className="mt-1 text-sm text-gray-500">
            Manage your TrendKart product collection.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="rounded-lg bg-[#211f1b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#403b33]"
        >
          + Add Product
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>{success}</span>

          <button
            onClick={() => setSuccess("")}
            className="ml-4 text-lg"
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="ml-4 text-lg"
            aria-label="Dismiss error message"
          >
            ×
          </button>
        </div>
      )}

      {/* Add and edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[#e6dfd2] bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {editId ? "Edit Product" : "Add New Product"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Enter the product details below.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-xl text-gray-500 hover:bg-gray-100 hover:text-black"
              aria-label="Close product form"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Product Name
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                className="w-full rounded-lg border border-[#ddd5c8] p-3 outline-none focus:border-[#211f1b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Brand
              </label>

              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Enter brand"
                required
                className="w-full rounded-lg border border-[#ddd5c8] p-3 outline-none focus:border-[#211f1b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Price (₹)
              </label>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
                className="w-full rounded-lg border border-[#ddd5c8] p-3 outline-none focus:border-[#211f1b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category"
                required
                className="w-full rounded-lg border border-[#ddd5c8] p-3 outline-none focus:border-[#211f1b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Stock Quantity
              </label>

              <input
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Enter stock quantity"
                required
                className="w-full rounded-lg border border-[#ddd5c8] p-3 outline-none focus:border-[#211f1b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Product Image
              </label>

              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleChange}
                required={!editId}
                className="w-full rounded-lg border border-[#ddd5c8] p-3 text-sm"
              />

              {editId && (
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to keep the existing image.
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={4}
                required
                className="w-full rounded-lg border border-[#ddd5c8] p-3 outline-none focus:border-[#211f1b]"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#211f1b] px-6 py-3 text-sm font-medium text-white hover:bg-[#403b33] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editId
                  ? "Save Changes"
                  : "Add Product"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-[#ddd5c8] px-6 py-3 text-sm hover:bg-[#f7f5f0]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products table */}
      <div className="overflow-x-auto rounded-xl border border-[#e6dfd2] bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-3 text-4xl text-gray-300">□</div>

            <h3 className="font-semibold">No products found</h3>

            <p className="mt-2 text-sm text-gray-500">
              Add your first product to get started.
            </p>

            <button
              onClick={handleAdd}
              className="mt-5 rounded-lg bg-[#211f1b] px-5 py-3 text-sm text-white hover:bg-[#403b33]"
            >
              + Add Product
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#eee7db] text-gray-700">
              <tr>
                <th className="whitespace-nowrap p-4">Product</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-[#eee7db] transition hover:bg-[#fcfbf8]"
                >
                  <td className="p-4">
                    <div className="flex min-w-[200px] items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg border border-[#eee7db] object-cover"
                      />

                      <span className="font-medium">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">{product.brand}</td>

                  <td className="p-4">{product.category}</td>

                  <td className="whitespace-nowrap p-4 font-medium">
                    ₹
                    {Number(product.price).toLocaleString("en-IN")}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        Number(product.stock) > 0
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {product.stock} in stock
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Edit icon */}
                      <button
                        onClick={() => handleEdit(product)}
                        title="Edit product"
                        aria-label={`Edit ${product.name}`}
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-[#eee7db] hover:text-black"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                        </svg>
                      </button>

                      {/* Delete icon */}
                      <button
                        onClick={() => handleDeleteClick(product)}
                        title="Delete product"
                        aria-label={`Delete ${product.name}`}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v5" />
                          <path d="M14 11v5" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Custom delete confirmation modal */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
            </div>

            <h3
              id="delete-modal-title"
              className="text-xl font-semibold"
            >
              Delete Product?
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#211f1b]">
                {deleteProduct.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setDeleteProduct(null)}
                disabled={deleting}
                className="rounded-lg border border-[#ddd5c8] px-5 py-2.5 text-sm font-medium hover:bg-[#f7f5f0] disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;