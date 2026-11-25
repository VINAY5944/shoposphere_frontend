
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import productService from "../products/services/productService";
import categoryService from "../../../shared/services/categoryService";
import { logout } from "../../../auth/authSlice";

import ProductCard from "../products/components/ProductCard";

import SearchFilter from "../../../shared/components/filters/SearchFilter";
import SelectFilter from "../../../shared/components/filters/SelectFilter";
import FilterBar from "../../../shared/components/filters/FilterBar";
import Pagination from "../../../shared/components/table/Pagination";
import Loader from "../../../shared/components/common/Loader";
import Button from "../../../shared/components/ui/Button";

import useCursorPagination from "../../../shared/hooks/useCursorPagination";
import useDebounce from "../../../shared/hooks/useDebounce";

function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const debouncedSearch = useDebounce(search);

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  const {
    currentCursor,
    hasPreviousPage,
    goToNext,
    goToPrevious,
    resetPagination,
  } = useCursorPagination();

  // Fetch categories
  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({
          limit: 100,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setCategories(response.data || []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Category fetching failed:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCategoryLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, []);

  // Fetch products whenever filters or cursor change
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await productService.getProducts({
          limit: 10,
          cursor: currentCursor,
          search: debouncedSearch,
          categoryId,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setProducts(response.data || []);

        setPagination({
          hasNextPage: response.pagination?.hasNextPage || false,
          nextCursor: response.pagination?.nextCursor || null,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        setProducts([]);
        setError(
          error.response?.data?.message ||
            "Unable to load products. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [currentCursor, debouncedSearch, categoryId]);

  const handleSearch = (value) => {
    resetPagination();
    setSearch(value);
  };

  const handleCategoryChange = (value) => {
    resetPagination();
    setCategoryId(value);
  };

  const handleNext = () => {
    if (pagination.nextCursor) {
      goToNext(pagination.nextCursor);
    }
  };

  const handlePrevious = () => {
    goToPrevious();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleClearFilters = () => {
    resetPagination();
    setSearch("");
    setCategoryId("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink
            to="/customer"
            className="flex items-center gap-3"
            aria-label="ShopSphere home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-lg font-black text-white shadow-lg shadow-indigo-200">
              S
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Shop<span className="text-indigo-600">Sphere</span>
            </span>
          </NavLink>

          <nav
            aria-label="Customer navigation"
            className="order-3 flex w-full items-center justify-between border-t border-slate-100 pt-2 sm:order-none sm:w-auto sm:justify-start sm:gap-1 sm:border-0 sm:pt-0"
          >
            <NavLink
              to="/customer"
              end
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/customer/cart"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              Cart
            </NavLink>
            <NavLink
              to="/customer/orders"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              My orders
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            <div className="hidden text-right md:block">
              <p className="text-xs font-medium text-slate-500">Welcome back</p>
              <p className="max-w-36 truncate text-sm font-semibold text-slate-800">
                {user?.name || "Shopper"}
              </p>
            </div>
            <Button
              type="button"
              variant="custom"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 shadow-xl shadow-indigo-950/10">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-32 h-96 w-96 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-48 right-1/4 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl"
          />

          <div className="relative grid gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-14">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                The ShopSphere edit
              </p>
              <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find something
                <span className="block text-violet-300">wonderful.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-indigo-100/85 sm:text-lg">
                Good finds for everyday life. Explore the collection and make
                your next favorite yours.
              </p>
              <a
                href="#products"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                Explore the collection
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="relative hidden min-h-64 items-center justify-center lg:flex">
              <div className="absolute h-64 w-64 rounded-full border border-white/15" />
              <div className="absolute h-48 w-48 rounded-full bg-violet-400/20 blur-2xl" />
              <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl">
                    ✦
                  </span>
                  <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                    Made for you
                  </span>
                </div>
                <p className="mt-8 text-sm font-medium text-indigo-100">
                  A little inspiration
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  Your next great find is waiting.
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <span className="h-1.5 flex-1 rounded-full bg-violet-300" />
                  <span className="h-1.5 flex-1 rounded-full bg-white/25" />
                  <span className="h-1.5 flex-1 rounded-full bg-white/25" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="search-heading"
          className="relative z-10 mx-0 mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 sm:mx-6 sm:-mt-6 sm:p-6 lg:mx-10"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Find your next favorite
              </p>
              <h2
                id="search-heading"
                className="mt-1 text-xl font-bold tracking-tight text-slate-900"
              >
                Search the collection
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              {categoryLoading
                ? "Loading categories..."
                : `${categories.length} categories to explore`}
            </p>
          </div>

          <FilterBar>
            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
              <SearchFilter
                value={search}
                onChange={handleSearch}
                placeholder="Search products..."
              />
              <SelectFilter
                value={categoryId}
                onChange={handleCategoryChange}
                placeholder="All categories"
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
              />
            </div>
          </FilterBar>
        </section>

        <section id="products" className="mt-12 scroll-mt-28">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Handpicked for you
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Shop the collection
              </h2>
            </div>
            <span className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
              {products.length} {products.length === 1 ? "product" : "products"}
            </span>
          </div>

          {loading && (
            <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16">
              <Loader text="Finding great products..." />
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-rose-700"
            >
              <p className="font-semibold">We couldn’t load the collection.</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600"
              >
                ⌕
              </span>
              <p className="mt-5 text-lg font-bold text-slate-900">
                No products found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Try another search or choose a different category.
              </p>
              {(search || categoryId) && (
                <Button
                  type="button"
                  variant="custom"
                  onClick={handleClearFilters}
                  className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={hasPreviousPage}
                loading={loading}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default HomePage;
