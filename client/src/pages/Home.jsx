import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  Headphones,
  ShoppingBag,
  Sparkles,
  Users,
  Heart,
  Baby,
  Footprints,
  Watch,
} from "lucide-react";

import API from "../services/api";
import { setProducts } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";

function Home() {
  const dispatch = useDispatch();

  const products = useSelector(
    (state) => state.products?.products ?? []
  );

  const [banners, setBanners] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  // Default banners are displayed when the backend has no saved banners.
  const defaultBanners = [
    {
      title: "New Season,\nNew Perspective.",
      subtitle:
        "Discover thoughtfully selected styles for every moment.",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2000&q=85",
      label: "THE NEW COLLECTION",
      buttonText: "Explore Collection",
      path: "/category/women",
    },
    {
      title: "Redefine Your\nEveryday Style.",
      subtitle:
        "Modern essentials. Effortless confidence. Timeless appeal.",
      image:
        "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=2000&q=85",
      label: "THE MENS EDIT",
      buttonText: "Shop Men's Style",
      path: "/category/men",
    },
    {
      title: "Find Your\nSignature Look.",
      subtitle:
        "Standout pieces that make every outfit feel your own.",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=85",
      label: "STYLE, REIMAGINED",
      buttonText: "Discover More",
      path: "/category/women",
    },
  ];

  const displayBanners =
    banners.length > 0 ? banners : defaultBanners;

  const activeIndex =
    displayBanners.length > 0
      ? bannerIndex % displayBanners.length
      : 0;

  const activeBanner = displayBanners[activeIndex];

  // Category data with premium outline icons instead of images.
  const categories = [
    {
      name: "Men",
      subtitle: "Modern essentials",
      path: "/category/men",
      Icon: Users,
    },
    {
      name: "Women",
      subtitle: "Effortless elegance",
      path: "/category/women",
      Icon: Heart,
    },
    {
      name: "Kids",
      subtitle: "Little style icons",
      path: "/category/kids",
      Icon: Baby,
    },
    {
      name: "Footwear",
      subtitle: "Step into style",
      path: "/category/footwear",
      Icon: Footprints,
    },
    {
      name: "Accessories",
      subtitle: "The finishing touch",
      path: "/category/accessories",
      Icon: Watch,
    },
  ];

  // Fetch products and saved homepage banners from the backend.
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductError("");

      try {
        const response = await API.get("/products");
        const data = response.data;

        let productData = [];

        if (Array.isArray(data)) {
          productData = data;
        } else if (Array.isArray(data?.products)) {
          productData = data.products;
        } else if (Array.isArray(data?.data)) {
          productData = data.data;
        }

        if (!cancelled) {
          dispatch(setProducts(productData));

          if (productData.length === 0) {
            setProductError(
              "The server responded, but no products were found in the expected response format."
            );
          }
        }
      } catch (error) {
        console.error(
          "Product fetch error:",
          error.response?.data || error.message
        );

        if (!cancelled) {
          dispatch(setProducts([]));
          setProductError(
            "Unable to load products. Please check your backend connection."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    const fetchBanners = async () => {
      try {
        const response = await API.get("/banners");
        const data = response.data;

        let bannerList = [];

        if (Array.isArray(data)) {
          bannerList = data;
        } else if (Array.isArray(data?.banners)) {
          bannerList = data.banners;
        }

        bannerList = bannerList.filter(
          (banner) => banner && banner.image
        );

        if (!cancelled) {
          setBanners(bannerList);
          setBannerIndex(0);
        }
      } catch (error) {
        console.error(
          "Banner fetch error:",
          error.response?.data || error.message
        );

        if (!cancelled) {
          setBanners([]);
        }
      }
    };

    fetchProducts();
    fetchBanners();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // Automatically change the hero banner every 6 seconds.
  useEffect(() => {
    if (displayBanners.length < 2) {
      return;
    }

    const interval = setInterval(() => {
      setBannerIndex(
        (previousIndex) =>
          (previousIndex + 1) % displayBanners.length
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [displayBanners.length]);

  const nextBanner = () => {
    setBannerIndex(
      (previousIndex) =>
        (previousIndex + 1) % displayBanners.length
    );
  };

  const prevBanner = () => {
    setBannerIndex(
      (previousIndex) =>
        (previousIndex - 1 + displayBanners.length) %
        displayBanners.length
    );
  };

  const productList = Array.isArray(products) ? products : [];

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdf9] text-[#201d18]">
      {/* HERO BANNER */}
      <section className="relative isolate min-h-[510px] overflow-hidden bg-[#24211d] sm:min-h-[570px] lg:min-h-[650px]">
        <div
          key={activeBanner.image}
          className="absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url("${activeBanner.image}")`,
          }}
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <div className="mx-auto flex min-h-[510px] max-w-[1500px] items-center px-6 py-16 sm:min-h-[570px] sm:px-10 lg:min-h-[650px] lg:px-20">
          <div className="max-w-2xl text-white">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-9 bg-[#d8bd95]" />
              <p className="text-[10px] font-semibold tracking-[4px] text-[#e4c9a0] sm:text-xs">
                {activeBanner.label || "THE TRENDKART EDIT"}
              </p>
            </div>

            <h1 className="whitespace-pre-line font-serif text-5xl font-medium leading-[1.08] tracking-[-1.5px] sm:text-6xl lg:text-7xl xl:text-[82px]">
              {activeBanner.title}
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
              {activeBanner.subtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                to={activeBanner.path || "/category/women"}
                className="group inline-flex min-h-12 items-center gap-4 bg-[#f5eee3] px-6 py-3 text-xs font-semibold tracking-[1.5px] text-[#201d18] transition hover:bg-[#d8bd95]"
              >
                {activeBanner.buttonText || "SHOP NOW"}
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/"
                onClick={() => {
                  document
                    .getElementById("featured-products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-medium tracking-wide text-white/90 underline decoration-white/40 underline-offset-8 transition hover:decoration-white"
              >
                View featured products
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-3">
              <span className="mr-2 text-xs tracking-widest text-white/70">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>

              {displayBanners.map((banner, index) => (
                <button
                  key={`${banner.title}-${index}`}
                  type="button"
                  aria-label={`Show banner ${index + 1}`}
                  onClick={() => setBannerIndex(index)}
                  className={`h-[3px] transition-all duration-300 ${
                    index === activeIndex
                      ? "w-12 bg-[#e1c29a]"
                      : "w-6 bg-white/45 hover:bg-white/80"
                  }`}
                />
              ))}

              <span className="ml-2 text-xs tracking-widest text-white/70">
                {String(displayBanners.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {displayBanners.length > 1 && (
          <div className="absolute bottom-8 right-6 hidden items-center gap-2 sm:flex lg:right-12">
            <button
              type="button"
              aria-label="Previous banner"
              onClick={prevBanner}
              className="flex h-11 w-11 items-center justify-center border border-white/35 text-white transition hover:bg-white hover:text-[#201d18]"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              aria-label="Next banner"
              onClick={nextBanner}
              className="flex h-11 w-11 items-center justify-center border border-white/35 text-white transition hover:bg-white hover:text-[#201d18]"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </section>

      {/* SERVICE BENEFITS */}
      <section className="border-b border-[#eae3d9] bg-[#f8f4ed]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 divide-y divide-[#e4dbcf] px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-10">
          <div className="flex items-center justify-center gap-4 py-5 sm:py-7">
            <Truck size={23} strokeWidth={1.5} className="text-[#9b7c53]" />
            <div>
              <p className="text-xs font-semibold tracking-wide">
                Shopping made simple
              </p>
              <p className="mt-1 text-[11px] text-[#82786b]">
                A smooth shopping experience
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-5 sm:py-7">
            <ShieldCheck size={23} strokeWidth={1.5} className="text-[#9b7c53]" />
            <div>
              <p className="text-xs font-semibold tracking-wide">
                Secure shopping
              </p>
              <p className="mt-1 text-[11px] text-[#82786b]">
                Shop with confidence
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-5 sm:py-7">
            <Headphones size={23} strokeWidth={1.5} className="text-[#9b7c53]" />
            <div>
              <p className="text-xs font-semibold tracking-wide">
                Here to help
              </p>
              <p className="mt-1 text-[11px] text-[#82786b]">
                Support when you need it
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mb-9 flex items-end justify-between gap-4 sm:mb-12">
          <div>
            <p className="mb-3 text-[10px] font-semibold tracking-[3px] text-[#a1845d]">
              FIND YOUR STYLE
            </p>

            <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
              Shop by category
            </h2>

            <p className="mt-3 text-sm text-[#82786b]">
              Explore styles for every part of your life.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {categories.map((category) => {
            const CategoryIcon = category.Icon;

            return (
              <Link
                key={category.name}
                to={category.path}
                className="group"
              >
                <div className="flex aspect-[3/4] flex-col items-center justify-center border border-[#e8dfd2] bg-[#f8f4ed] px-3 text-center transition-all duration-300 hover:border-[#b9a385] hover:bg-[#f1e9dd] sm:px-5">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#dfd2bf] bg-[#fffdf9] text-[#786144] transition-all duration-300 group-hover:border-[#29251f] group-hover:bg-[#29251f] group-hover:text-[#f8f4ed] sm:h-24 sm:w-24">
                    <CategoryIcon
                      size={34}
                      strokeWidth={1.35}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <h3 className="font-serif text-xl font-medium text-[#29251f] sm:text-2xl">
                    {category.name}
                  </h3>

                  <p className="mt-2 text-[10px] text-[#82786b] sm:text-xs">
                    {category.subtitle}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold tracking-[1.5px] text-[#786144] transition-colors group-hover:text-[#29251f]">
                    EXPLORE
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section
        id="featured-products"
        className="bg-[#f7f3ed] py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <div className="mb-9 flex items-end justify-between gap-4 sm:mb-12">
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[3px] text-[#a1845d]">
                <Sparkles size={14} />
                THE TRENDKART SELECTION
              </p>

              <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
                Featured products
              </h2>

              <p className="mt-3 text-sm text-[#82786b]">
                Discover pieces worth adding to your wardrobe.
              </p>
            </div>

            <Link
              to="/search"
              className="group hidden items-center gap-2 pb-1 text-xs font-semibold tracking-wide text-[#51473a] transition hover:text-[#a1845d] sm:flex"
            >
              VIEW ALL
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="py-16 text-center text-sm text-[#82786b]">
              Loading products...
            </div>
          ) : productList.length === 0 ? (
            <div className="border border-[#e8e0d5] bg-[#fffdf9] px-5 py-16 text-center">
              <ShoppingBag
                size={32}
                strokeWidth={1.3}
                className="mx-auto mb-4 text-[#a1845d]"
              />

              <h3 className="font-serif text-2xl">
                Products are temporarily unavailable.
              </h3>

              <p className="mt-3 text-sm text-[#82786b]">
                {productError || "Please try again shortly."}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 bg-[#201d18] px-6 py-3 text-xs font-semibold tracking-widest text-white transition hover:bg-[#8d704b]"
              >
                TRY AGAIN
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-7">
              {productList.slice(0, 8).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}

          <div className="mt-9 text-center sm:hidden">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 border border-[#cfc2b0] px-6 py-3 text-xs font-semibold tracking-widest transition hover:bg-[#201d18] hover:text-white"
            >
              VIEW ALL PRODUCTS
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL SHOPPING BANNER */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto flex max-w-[1350px] flex-col items-start justify-between gap-7 border border-[#e5dbcd] bg-[#f4eee5] p-7 sm:p-10 md:flex-row md:items-center lg:p-14">
          <div>
            <p className="mb-3 text-[10px] font-semibold tracking-[3px] text-[#a1845d]">
              YOUR STYLE JOURNEY STARTS HERE
            </p>

            <h2 className="max-w-xl font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Good style. Great choices. All yours.
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#82786b]">
              Explore the collections and find pieces that feel like you.
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex shrink-0 items-center gap-4 bg-[#201d18] px-7 py-4 text-xs font-semibold tracking-[1.5px] text-white transition hover:bg-[#8d704b]"
          >
            START SHOPPING
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;