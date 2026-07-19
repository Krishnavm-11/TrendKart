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

    const token = localStorage.getItem("adminToken");

    const getAdminConfig = () => ({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

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

    const logout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/");
    };

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

    const handleProductSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", productForm.name);
        formData.append("brand", productForm.brand);
        formData.append("description", productForm.description);
        formData.append("price", productForm.price);
        formData.append("category", productForm.category);
        formData.append("stock", productForm.stock);

        if (productForm.image) {
            formData.append("image", productForm.image);
        }

        try {
            if (editingProductId) {
                await API.put(`/products/${editingProductId}`, formData, authConfig);
            } else {
                await API.post("/products", formData, authConfig);
            }

            resetProductForm();
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || "Product save failed");
        }
    };

    const editProduct = (product) => {
        setEditingProductId(product._id);
        setProductForm({
            name: product.name,
            brand: product.brand,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            image: null,
        });
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Delete this product?")) return;

        await API.delete(`/products/${id}`, authConfig);
        fetchProducts();
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", bannerForm.title);
        formData.append("subtitle", bannerForm.subtitle);

        if (bannerForm.image) {
            formData.append("image", bannerForm.image);
        }

        try {
            await API.post("/banners", formData, authConfig);

            setBannerForm({
                title: "",
                subtitle: "",
                image: null,
            });

            fetchBanners();
        } catch (error) {
            alert(error.response?.data?.message || "Banner save failed");
        }
    };

    const deleteBanner = async (id) => {
        if (!window.confirm("Delete this banner?")) return;

        await API.delete(`/banners/${id}`, authConfig);
        fetchBanners();
    };

    const updateOrderStatus = async (id, status) => {
        await API.put(
            `/orders/${id}/status`,
            { status },
            authConfig
        );

        fetchOrders();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>

                <button
                    onClick={logout}
                    className="bg-white text-black px-4 py-2 rounded-lg"
                >
                    Logout
                </button>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="flex gap-4 mb-8 flex-wrap">
                    {["products", "banners", "orders"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg capitalize ${activeTab === tab
                                ? "bg-black text-white"
                                : "bg-white text-black"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === "products" && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingProductId ? "Edit Product" : "Add Product"}
                        </h2>

                        <form
                            onSubmit={handleProductSubmit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                        >
                            <input
                                placeholder="Product Name"
                                className="border p-3 rounded"
                                value={productForm.name}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, name: e.target.value })
                                }
                            />

                            <input
                                placeholder="Brand"
                                className="border p-3 rounded"
                                value={productForm.brand}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, brand: e.target.value })
                                }
                            />

                            <input
                                placeholder="Price"
                                type="number"
                                className="border p-3 rounded"
                                value={productForm.price}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, price: e.target.value })
                                }
                            />

                            <select
                                className="border p-3 rounded"
                                value={productForm.category}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, category: e.target.value })
                                }
                            >
                                <option value="">Select Category</option>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="kids">Kids</option>
                                <option value="footwear">Footwear</option>
                                <option value="accessories">Accessories</option>
                            </select>

                            <input
                                placeholder="Stock"
                                type="number"
                                className="border p-3 rounded"
                                value={productForm.stock}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, stock: e.target.value })
                                }
                            />

                            <input
                                type="file"
                                className="border p-3 rounded"
                                onChange={(e) =>
                                    setProductForm({ ...productForm, image: e.target.files[0] })
                                }
                            />

                            <textarea
                                placeholder="Description"
                                className="border p-3 rounded md:col-span-2"
                                value={productForm.description}
                                onChange={(e) =>
                                    setProductForm({
                                        ...productForm,
                                        description: e.target.value,
                                    })
                                }
                            />

                            <button className="bg-black text-white py-3 rounded-lg">
                                {editingProductId ? "Update Product" : "Add Product"}
                            </button>

                            {editingProductId && (
                                <button
                                    type="button"
                                    onClick={resetProductForm}
                                    className="bg-gray-200 py-3 rounded-lg"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {products.map((product) => (
                                <div key={product._id} className="border rounded-lg p-4">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-44 object-cover rounded mb-3"
                                    />

                                    <h3 className="font-bold">{product.name}</h3>
                                    <p>₹{product.price}</p>
                                    <p className="text-gray-500">{product.category}</p>

                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => editProduct(product)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => deleteProduct(product._id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "banners" && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-2xl font-bold mb-4">Manage Banners</h2>

                        <form
                            onSubmit={handleBannerSubmit}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                        >
                            <input
                                placeholder="Banner Title"
                                className="border p-3 rounded"
                                value={bannerForm.title}
                                onChange={(e) =>
                                    setBannerForm({ ...bannerForm, title: e.target.value })
                                }
                            />

                            <input
                                placeholder="Subtitle"
                                className="border p-3 rounded"
                                value={bannerForm.subtitle}
                                onChange={(e) =>
                                    setBannerForm({ ...bannerForm, subtitle: e.target.value })
                                }
                            />

                            <input
                                type="file"
                                className="border p-3 rounded"
                                onChange={(e) =>
                                    setBannerForm({ ...bannerForm, image: e.target.files[0] })
                                }
                            />

                            <button className="bg-black text-white py-3 rounded-lg md:col-span-3">
                                Add Banner
                            </button>
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {banners.map((banner) => (
                                <div key={banner._id} className="border rounded-lg p-4">
                                    <img
                                        src={banner.image}
                                        alt={banner.title}
                                        className="w-full h-56 object-cover rounded mb-3"
                                    />

                                    <h3 className="font-bold">{banner.title}</h3>
                                    <p className="text-gray-500">{banner.subtitle}</p>

                                    <button
                                        onClick={() => deleteBanner(banner._id)}
                                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                                {orders.map((order) => (
                                    <div
                                        key={order._id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex flex-wrap justify-between gap-4">
                                            <div className="space-y-1">
                                                <h3 className="font-bold">
                                                    Order #{order._id}
                                                </h3>

                                                <p>
                                                    Customer:{" "}
                                                    {order.shippingAddress?.fullName ||
                                                        order.user?.name ||
                                                        "Customer"}
                                                </p>

                                                <p>
                                                    Email:{" "}
                                                    {order.email ||
                                                        order.user?.email ||
                                                        "Email not provided"}
                                                </p>

                                                <p>
                                                    Phone:{" "}
                                                    {order.shippingAddress?.phone ||
                                                        "Phone not provided"}
                                                </p>

                                                <p>
                                                    Address:{" "}
                                                    {order.shippingAddress?.address ||
                                                        "Address not provided"}
                                                </p>

                                                <p>
                                                    {order.shippingAddress?.city ||
                                                        ""}
                                                    {order.shippingAddress?.city &&
                                                        order.shippingAddress?.state
                                                        ? ", "
                                                        : ""}
                                                    {order.shippingAddress?.state ||
                                                        ""}
                                                </p>

                                                <p>
                                                    PIN:{" "}
                                                    {order.shippingAddress?.pincode ||
                                                        "Not provided"}
                                                </p>

                                                <p>
                                                    Payment:{" "}
                                                    {order.paymentMethod}
                                                </p>

                                                <p>
                                                    Payment Status:{" "}
                                                    {order.isPaid
                                                        ? "Paid"
                                                        : "Not Paid"}
                                                </p>

                                                <p>Total: ₹{order.totalAmount}</p>

                                                <p>Status: {order.status}</p>
                                            </div>

                                            <select
                                                value={order.status}
                                                onChange={(e) =>
                                                    updateOrderStatus(
                                                        order._id,
                                                        e.target.value
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

                                        <div className="mt-5 border-t pt-4">
                                            <p className="mb-3 font-semibold">
                                                Items:
                                            </p>

                                            {order.orderItems?.length > 0 ? (
                                                <div className="space-y-3">
                                                    {order.orderItems.map(
                                                        (item, index) => (
                                                            <div
                                                                key={`${order._id}-${index}`}
                                                                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {item.image && (
                                                                        <img
                                                                            src={item.image}
                                                                            alt={item.name}
                                                                            className="h-14 w-14 rounded object-cover"
                                                                        />
                                                                    )}

                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {item.name}
                                                                        </p>

                                                                        <p className="text-sm text-gray-500">
                                                                            Quantity:{" "}
                                                                            {item.quantity || 1}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <p className="font-semibold">
                                                                    ₹
                                                                    {item.price *
                                                                        (item.quantity || 1)}
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">
                                                    No items available.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;