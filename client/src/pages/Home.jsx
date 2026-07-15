import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import API from "../services/api";
import { setProducts } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";

function Home() {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);

  const [banners, setBanners] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);

  const defaultBanners = [
    {
      title: "New Season Collection",
      subtitle: "Fresh styles for every day",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Men's Fashion",
      subtitle: "Upgrade your wardrobe",
      image:
        "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Women's Collection",
      subtitle: "Trendy outfits made simple",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  const categories = [
    {
      name: "Men",
      path: "/category/men",
      image:
        "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Women",
      path: "/category/women",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Kids",
      path: "/category/kids",
      image:
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Footwear",
      path: "/category/footwear",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Accessories",
      path: "/category/accessories",
      image:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=500&q=80",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");
        dispatch(setProducts(data));
      } catch (error) {
        console.log(error);
      }
    };

    const fetchBanners = async () => {
      try {
        const { data } = await API.get("/banners");
        setBanners(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
    fetchBanners();
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % displayBanners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [displayBanners.length]);

  const nextBanner = () => {
    setBannerIndex((prev) => (prev + 1) % displayBanners.length);
  };

  const prevBanner = () => {
    setBannerIndex((prev) =>
      prev === 0 ? displayBanners.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <section
        className="h-[600px] bg-cover bg-center relative flex items-center"
        style={{
          backgroundImage: `url(${displayBanners[bannerIndex]?.image})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative max-w-7xl mx-auto px-20 text-white w-full">
          <h1 className="text-5xl font-bold mb-4">
            {displayBanners[bannerIndex]?.title}
          </h1>

          <p className="text-xl font-bold mb-6">
            {displayBanners[bannerIndex]?.subtitle}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-36 object-cover"
              />

              <div className="p-4 text-center font-semibold">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Featured Products
        </h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;