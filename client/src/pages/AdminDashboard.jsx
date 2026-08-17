import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [orders, setOrders] = useState([]);

  const [editingProductId, setEditingProductId] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null,
  });

  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image: null,
  });

  // Get admin token
  const token = localStorage.getItem("adminToken");

  // Admin authorization configuration
  const getAdminConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");

      setProducts(data);
    } catch (error) {
      console.error(
        "Products fetch failed:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // FETCH BANNERS
  // =========================

  const fetchBanners = async () => {
    try {
      const { data } = await API.get("/banners");

      setBanners(data);
    } catch (error) {
      console.error(
        "Banners fetch failed:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // FETCH ORDERS
  // =========================

  const fetchOrders = async () => {
    try {
      const { data } = await API.get(
        "/orders",
        getAdminConfig()
      );

      setOrders(data);
    } catch (error) {
      console.error(
        "Orders fetch failed:",
        error.response?.data || error.message
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/admin/login");
      }
    }
  };

  // =========================
  // LOAD DASHBOARD
  // =========================

  useEffect(() => {
    const loadDashboard = async () => {
      const savedToken =
        localStorage.getItem("adminToken");

      if (!savedToken) {
        navigate("/admin/login");
        return;
      }

      await Promise.all([
        fetchProducts(),
        fetchBanners(),
        fetchOrders(),
      ]);
    };

    loadDashboard();
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    // Go to main user login
    navigate("/login");
  };

  // =========================
  // RESET PRODUCT FORM
  // =========================

  const resetProductForm = () => {
    setEditingProductId(null);

    setProductForm({
      name: "",
      brand: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: null,
    });
  };

  // =========================
  // ADD / UPDATE PRODUCT
  // =========================

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (
      !productForm.name ||
      !productForm.brand ||
      !productForm.description ||
      !productForm.price ||
      !productForm.category ||
      !productForm.stock
    ) {
      alert("Please fill all product fields");
      return;
    }

    const formData = new FormData();

    formData.append(
      "name",
      productForm.name
    );

    formData.append(
      "brand",
      productForm.brand
    );

    formData.append(
      "description",
      productForm.description
    );

    formData.append(
      "price",
      productForm.price
    );

    formData.append(
      "category",
      productForm.category
    );

    formData.append(
      "stock",
      productForm.stock
    );

    if (productForm.image) {
      formData.append(
        "image",
        productForm.image
      );
    }

    try {
      if (editingProductId) {
        await API.put(
          `/products/${editingProductId}`,
          formData,
          getAdminConfig()
        );

        alert("Product updated successfully");
      } else {
        await API.post(
          "/products",
          formData,
          getAdminConfig()
        );

        alert("Product added successfully");
      }

      resetProductForm();

      fetchProducts();
    } catch (error) {
      console.log(
        "FULL ERROR:",
        error
      );

      console.log(
        "SERVER RESPONSE:",
        error.response?.data
      );

      console.log(
        "STATUS:",
        error.response?.status
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Product save failed"
      );
    }
  };

  // =========================
  // EDIT PRODUCT
  // =========================

  const editProduct = (product) => {
    setEditingProductId(product._id);

    setProductForm({
      name: product.name || "",
      brand: product.brand || "",
      description:
        product.description || "",
      price: product.price || "",
      category:
        product.category || "",
      stock: product.stock || "",
      image: null,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const deleteProduct = async (id) => {
    if (
      !window.confirm(
        "Delete this product?"
      )
    ) {
      return;
    }

    try {
      await API.delete(
        `/products/${id}`,
        getAdminConfig()
      );

      alert(
        "Product deleted successfully"
      );

      fetchProducts();
    } catch (error) {
      console.error(
        "Delete product error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Product delete failed"
      );
    }
  };

  // =========================
  // ADD BANNER
  // =========================

  const handleBannerSubmit = async (e) => {
    e.preventDefault();

    if (
      !bannerForm.title ||
      !bannerForm.subtitle
    ) {
      alert(
        "Please enter banner title and subtitle"
      );

      return;
    }

    const formData = new FormData();

    formData.append(
      "title",
      bannerForm.title
    );

    formData.append(
      "subtitle",
      bannerForm.subtitle
    );

    if (bannerForm.image) {
      formData.append(
        "image",
        bannerForm.image
      );
    }

    try {
      await API.post(
        "/banners",
        formData,
        getAdminConfig()
      );

      alert(
        "Banner added successfully"
      );

      setBannerForm({
        title: "",
        subtitle: "",
        image: null,
      });

      fetchBanners();
    } catch (error) {
      console.error(
        "Banner save error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Banner save failed"
      );
    }
  };

  // =========================
  // DELETE BANNER
  // =========================

  const deleteBanner = async (id) => {
    if (
      !window.confirm(
        "Delete this banner?"
      )
    ) {
      return;
    }

    try {
      await API.delete(
        `/banners/${id}`,
        getAdminConfig()
      );

      alert(
        "Banner deleted successfully"
      );

      fetchBanners();
    } catch (error) {
      console.error(
        "Delete banner error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Banner delete failed"
      );
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================

  const updateOrderStatus = async (
    id,
    status
  ) => {
    try {
      await API.put(
        `/orders/${id}/status`,
        {
          status,
        },
        getAdminConfig()
      );

      fetchOrders();
    } catch (error) {
      console.error(
        "Order update error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Order status update failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}

      <div className="flex items-center justify-between bg-black px-6 py-4 text-white">
        <h1 className="text-2xl font-bold">
          Admin Dashboard
        </h1>

        <button
          onClick={logout}
          className="rounded-lg bg-white px-4 py-2 font-medium text-black transition hover:bg-gray-200"
        >
          Logout
        </button>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {/* TABS */}

        <div className="mb-8 flex flex-wrap gap-4">
          {[
            "products",
            "banners",
            "orders",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab)
              }
              className={`rounded-lg px-5 py-2 capitalize transition ${
                activeTab === tab
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ================================= */}
        {/* PRODUCTS */}
        {/* ================================= */}

        {activeTab === "products" && (
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold">
              {editingProductId
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <form
              onSubmit={
                handleProductSubmit
              }
              className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              {/* NAME */}

              <input
                type="text"
                placeholder="Product Name"
                className="rounded border p-3 outline-none focus:border-black"
                value={
                  productForm.name
                }
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    name: e.target.value,
                  })
                }
              />

              {/* BRAND */}

              <input
                type="text"
                placeholder="Brand"
                className="rounded border p-3 outline-none focus:border-black"
                value={
                  productForm.brand
                }
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    brand:
                      e.target.value,
                  })
                }
              />

              {/* PRICE */}

              <input
                type="number"
                placeholder="Price"
                className="rounded border p-3 outline-none focus:border-black"
                value={
                  productForm.price
                }
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    price:
                      e.target.value,
                  })
                }
              />

              {/* CATEGORY */}

              <select
                className="rounded border p-3 outline-none focus:border-black"
                value={
                  productForm.category
                }
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    category:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Category
                </option>

                <option value="men">
                  Men
                </option>

                <option value="women">
                  Women
                </option>

                <option value="kids">
                  Kids
                </option>

                <option value="footwear">
                  Footwear
                </option>

                <option value="accessories">
                  Accessories
                </option>
              </select>

              {/* STOCK */}

              <input
                type="number"
                placeholder="Stock"
                className="rounded border p-3 outline-none focus:border-black"
                value={
                  productForm.stock
                }
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    stock:
                      e.target.value,
                  })
                }
              />

              {/* IMAGE */}

              <input
                type="file"
                accept="image/*"
                className="rounded border p-3"
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    image:
                      e.target
                        .files[0],
                  })
                }
              />

              {/* DESCRIPTION */}

              <textarea
                placeholder="Description"
                className="rounded border p-3 outline-none focus:border-black md:col-span-2"
                value={
                  productForm.description
                }
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description:
                      e.target.value,
                  })
                }
              />

              {/* SUBMIT */}

              <button
                type="submit"
                className="rounded-lg bg-black py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                {editingProductId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingProductId && (
                <button
                  type="button"
                  onClick={
                    resetProductForm
                  }
                  className="rounded-lg bg-gray-200 py-3 font-medium hover:bg-gray-300"
                >
                  Cancel Edit
                </button>
              )}
            </form>

            {/* PRODUCT LIST */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {products.map(
                (product) => (
                  <div
                    key={
                      product._id
                    }
                    className="rounded-lg border p-4"
                  >
                    <img
                      src={
                        product.image
                      }
                      alt={
                        product.name
                      }
                      className="mb-3 h-44 w-full rounded object-cover"
                    />

                    <h3 className="font-bold">
                      {product.name}
                    </h3>

                    <div className="mt-1 flex justify-between text-sm text-gray-500">
                      <span>
                        {
                          product.category
                        }
                      </span>

                      <span>
                        {
                          product.brand
                        }
                      </span>
                    </div>

                    <p className="mt-2 font-semibold">
                      ₹
                      {
                        product.price
                      }
                    </p>

                    <p className="text-sm text-gray-500">
                      Stock:{" "}
                      {
                        product.stock
                      }
                    </p>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          editProduct(
                            product
                          )
                        }
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteProduct(
                            product._id
                          )
                        }
                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* BANNERS */}
        {/* ================================= */}

        {activeTab === "banners" && (
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold">
              Manage Banners
            </h2>

            <form
              onSubmit={
                handleBannerSubmit
              }
              className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              <input
                type="text"
                placeholder="Banner Title"
                className="rounded border p-3"
                value={
                  bannerForm.title
                }
                onChange={(e) =>
                  setBannerForm({
                    ...bannerForm,
                    title:
                      e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Subtitle"
                className="rounded border p-3"
                value={
                  bannerForm.subtitle
                }
                onChange={(e) =>
                  setBannerForm({
                    ...bannerForm,
                    subtitle:
                      e.target.value,
                  })
                }
              />

              <input
                type="file"
                accept="image/*"
                className="rounded border p-3"
                onChange={(e) =>
                  setBannerForm({
                    ...bannerForm,
                    image:
                      e.target
                        .files[0],
                  })
                }
              />

              <button
                type="submit"
                className="rounded-lg bg-black py-3 font-semibold text-white hover:bg-gray-800 md:col-span-3"
              >
                Add Banner
              </button>
            </form>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {banners.map(
                (banner) => (
                  <div
                    key={
                      banner._id
                    }
                    className="rounded-lg border p-4"
                  >
                    <img
                      src={
                        banner.image
                      }
                      alt={
                        banner.title
                      }
                      className="mb-3 h-56 w-full rounded object-cover"
                    />

                    <h3 className="font-bold">
                      {
                        banner.title
                      }
                    </h3>

                    <p className="text-gray-500">
                      {
                        banner.subtitle
                      }
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        deleteBanner(
                          banner._id
                        )
                      }
                      className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* ORDERS */}
        {/* ================================= */}

        {activeTab === "orders" && (
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold">
              Order Details
            </h2>

            {orders.length === 0 ? (
              <p className="text-gray-500">
                No orders found.
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map(
                  (order) => (
                    <div
                      key={
                        order._id
                      }
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-wrap justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold">
                            Order #
                            {
                              order._id
                            }
                          </h3>

                          <p>
                            Customer:{" "}
                            {order
                              .shippingAddress
                              ?.fullName ||
                              order
                                .user
                                ?.name ||
                              "Customer"}
                          </p>

                          <p>
                            Email:{" "}
                            {order.email ||
                              order
                                .user
                                ?.email ||
                              "Email not provided"}
                          </p>

                          <p>
                            Phone:{" "}
                            {order
                              .shippingAddress
                              ?.phone ||
                              "Phone not provided"}
                          </p>

                          <p>
                            Address:{" "}
                            {order
                              .shippingAddress
                              ?.address ||
                              "Address not provided"}
                          </p>

                          <p>
                            {order
                              .shippingAddress
                              ?.city ||
                              ""}

                            {order
                              .shippingAddress
                              ?.city &&
                            order
                              .shippingAddress
                              ?.state
                              ? ", "
                              : ""}

                            {order
                              .shippingAddress
                              ?.state ||
                              ""}
                          </p>

                          <p>
                            PIN:{" "}
                            {order
                              .shippingAddress
                              ?.pincode ||
                              "Not provided"}
                          </p>

                          <p>
                            Payment:{" "}
                            {
                              order.paymentMethod
                            }
                          </p>

                          <p>
                            Payment
                            Status:{" "}
                            {order.isPaid
                              ? "Paid"
                              : "Not Paid"}
                          </p>

                          <p>
                            Total: ₹
                            {
                              order.totalAmount
                            }
                          </p>

                          <p>
                            Status:{" "}
                            {
                              order.status
                            }
                          </p>
                        </div>

                        <select
                          value={
                            order.status
                          }
                          onChange={(e) =>
                            updateOrderStatus(
                              order._id,
                              e.target
                                .value
                            )
                          }
                          className="h-fit rounded-lg border p-3"
                        >
                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Confirmed">
                            Confirmed
                          </option>

                          <option value="Shipped">
                            Shipped
                          </option>

                          <option value="Delivered">
                            Delivered
                          </option>

                          <option value="Cancelled">
                            Cancelled
                          </option>

                          <option value="Declined">
                            Declined
                          </option>
                        </select>
                      </div>

                      {/* ORDER ITEMS */}

                      <div className="mt-5 border-t pt-4">
                        <p className="mb-3 font-semibold">
                          Items:
                        </p>

                        {order
                          .orderItems
                          ?.length >
                        0 ? (
                          <div className="space-y-3">
                            {order.orderItems.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={`${order._id}-${index}`}
                                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                >
                                  <div className="flex items-center gap-3">
                                    {item.image && (
                                      <img
                                        src={
                                          item.image
                                        }
                                        alt={
                                          item.name
                                        }
                                        className="h-14 w-14 rounded object-cover"
                                      />
                                    )}

                                    <div>
                                      <p className="font-medium">
                                        {
                                          item.name
                                        }
                                      </p>

                                      <p className="text-sm text-gray-500">
                                        Quantity:{" "}
                                        {item.quantity ||
                                          1}
                                      </p>
                                    </div>
                                  </div>

                                  <p className="font-semibold">
                                    ₹
                                    {item.price *
                                      (item.quantity ||
                                        1)}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No
                            items
                            available.
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;