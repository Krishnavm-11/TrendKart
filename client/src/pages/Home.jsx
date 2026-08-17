import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import API from "../services/api";
import { setProducts } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";

function Home() {
  const dispatch = useDispatch();

  const { products } = useSelector(
    (state) => state.products
  );

  const [banners, setBanners] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);

  // =====================================
  // DEFAULT BANNERS
  // =====================================

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

  // If database banners are available, use them.
  // Otherwise use default banners.
  const displayBanners =
    banners.length > 0
      ? banners
      : defaultBanners;

  // =====================================
  // CATEGORIES
  // =====================================

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

  // =====================================
  // FETCH PRODUCTS AND BANNERS
  // =====================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get(
          "/products"
        );

        console.log(
          "PRODUCT API RESPONSE:",
          data
        );

        // Backend directly returns an array
        if (Array.isArray(data)) {
          dispatch(setProducts(data));
        }

        // Backend returns:
        // { products: [...] }
        else if (
          data &&
          Array.isArray(data.products)
        ) {
          dispatch(
            setProducts(data.products)
          );
        }

        // Unexpected response
        else {
          console.log(
            "Products response is not an array"
          );

          dispatch(setProducts([]));
        }
      } catch (error) {
        console.log(
          "Product fetch error:",
          error.response?.data ||
            error.message
        );

        dispatch(setProducts([]));
      }
    };

    const fetchBanners = async () => {
      try {
        const { data } = await API.get(
          "/banners"
        );

        console.log(
          "BANNER API RESPONSE:",
          data
        );

        if (Array.isArray(data)) {
          setBanners(data);
        } else if (
          data &&
          Array.isArray(data.banners)
        ) {
          setBanners(data.banners);
        } else {
          setBanners([]);
        }
      } catch (error) {
        console.log(
          "Banner fetch error:",
          error.response?.data ||
            error.message
        );

        setBanners([]);
      }
    };

    fetchProducts();
    fetchBanners();
  }, [dispatch]);

  // =====================================
  // BANNER AUTO SLIDE
  // =====================================

  useEffect(() => {
    if (displayBanners.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setBannerIndex(
        (previousIndex) =>
          (previousIndex + 1) %
          displayBanners.length
      );
    }, 6000);

    return () =>
      clearInterval(interval);
  }, [displayBanners.length]);

  // =====================================
  // NEXT BANNER
  // =====================================

  const nextBanner = () => {
    if (displayBanners.length === 0) {
      return;
    }

    setBannerIndex(
      (previousIndex) =>
        (previousIndex + 1) %
        displayBanners.length
    );
  };

  // =====================================
  // PREVIOUS BANNER
  // =====================================

  const prevBanner = () => {
    if (displayBanners.length === 0) {
      return;
    }

    setBannerIndex((previousIndex) =>
      previousIndex === 0
        ? displayBanners.length - 1
        : previousIndex - 1
    );
  };

  // =====================================
  // SAFE PRODUCT ARRAY
  // =====================================

  const productList =
    Array.isArray(products)
      ? products
      : [];

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ============================== */}
      {/* HERO BANNER */}
      {/* ============================== */}

      <section
        className="relative flex h-[500px] items-center bg-cover bg-center md:h-[600px]"
        style={{
          backgroundImage: `url(${displayBanners[bannerIndex]?.image})`,
        }}
      >
        {/* Dark Overlay */}

        <div className="absolute inset-0 bg-black/40" />

        {/* Banner Content */}

        <div className="relative mx-auto w-full max-w-7xl px-6 text-white md:px-12 lg:px-20">
          <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">
            {
              displayBanners[
                bannerIndex
              ]?.title
            }
          </h1>

          <p className="mt-4 text-lg font-medium md:text-xl">
            {
              displayBanners[
                bannerIndex
              ]?.subtitle
            }
          </p>
        </div>

        {/* Previous Button */}

        <button
          type="button"
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-4 py-3 text-xl text-white transition hover:bg-black/70"
        >
          ‹
        </button>

        {/* Next Button */}

        <button
          type="button"
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-4 py-3 text-xl text-white transition hover:bg-black/70"
        >
          ›
        </button>
      </section>

      {/* ============================== */}
      {/* CATEGORY SECTION */}
      {/* ============================== */}

      <section className="mx-auto max-w-7xl px-6 py-12">

        <h2 className="mb-8 text-center text-3xl font-bold">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-6">

          {categories.map(
            (category) => (
              <Link
                key={category.name}
                to={category.path}
                className="overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-32 w-full object-cover sm:h-36"
                />

                <div className="p-4 text-center font-semibold">
                  {category.name}
                </div>
              </Link>
            )
          )}

        </div>
      </section>

      {/* ============================== */}
      {/* FEATURED PRODUCTS */}
      {/* ============================== */}

      <section className="mx-auto max-w-7xl px-6 pb-12">

        <h2 className="mb-8 text-center text-3xl font-bold">
          Featured Products
        </h2>

        {productList.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center">
            <p className="text-gray-500">
              No products found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">

            {productList
              .slice(0, 8)
              .map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default Home;