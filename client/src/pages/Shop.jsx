import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read filters from search parameters
  const page = parseInt(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Local filter states for input elements
  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Sync inputs with URL params
  useEffect(() => {
    setLocalSearch(search);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [search, minPrice, maxPrice]);

  // Fetch products when searchParams changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', page);
        queryParams.set('limit', 12);
        
        if (category !== 'All') queryParams.set('category', category);
        if (search) queryParams.set('search', search);
        if (sort !== 'newest') queryParams.set('sort', sort);
        if (minPrice) queryParams.set('minPrice', minPrice);
        if (maxPrice) queryParams.set('maxPrice', maxPrice);

        const { data } = await api.get(`/products?${queryParams.toString()}`);
        setProducts(data.products);
        setTotalPages(data.pages);
        setTotalProducts(data.total);
      } catch (error) {
        console.error('Error fetching products:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', 1); // Reset page on filter change
    setSearchParams(newParams);
  };

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    
    if (localSearch) newParams.set('search', localSearch);
    else newParams.delete('search');

    if (localMinPrice) newParams.set('minPrice', localMinPrice);
    else newParams.delete('minPrice');

    if (localMaxPrice) newParams.set('maxPrice', localMaxPrice);
    else newParams.delete('maxPrice');
    
    newParams.set('page', 1);
    setSearchParams(newParams);
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['All', 'Analog', 'Digital', 'Smart', 'Luxury', 'Sports', 'Casual'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="border-b border-neutral-100 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Shop Collection</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Showing {totalProducts} timepieces
        </p>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-x-8">
        
        {/* ===================== FILTERS SIDEBAR (DESKTOP) ===================== */}
        <aside className="hidden lg:block space-y-6">
          {/* Search bar */}
          <form onSubmit={handleApplyFilters} className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Search</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search watches..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full border border-neutral-200 px-4 py-2 pr-10 text-sm focus:border-black focus:outline-none"
              />
              <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-black">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Categories */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-900">Categories</h3>
            <div className="flex flex-col space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParam('category', cat)}
                  className={`text-left text-sm py-1 transition-all duration-200 ${
                    category === cat 
                      ? 'font-bold text-primary-800 border-l-2 border-gold-500 pl-2' 
                      : 'text-neutral-555 hover:text-gold-500 pl-2 hover:translate-x-0.5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <form onSubmit={handleApplyFilters} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Price Range</h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
              />
              <span className="text-neutral-400 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-1.5 text-xs focus:border-black focus:outline-none"
              />
            </div>
            <div className="flex space-x-2 pt-1">
              <button
                type="submit"
                className="w-full rounded bg-primary-800 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-gold-100 border border-gold-500/20 hover:bg-primary-900 hover:text-white transition-colors"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full rounded border border-neutral-200 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-neutral-600 hover:border-primary-850 hover:text-primary-850 transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </aside>

        {/* ===================== PRODUCT CATALOG SECTION ===================== */}
        <main className="lg:col-span-3 space-y-8">
          
          {/* Controls Bar (Mobile toggle + Desktop sort) */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center space-x-2 rounded border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:border-black hover:text-black"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>

            <div className="hidden lg:block text-xs text-neutral-400 font-medium">
              We found <span className="font-bold text-neutral-700">{totalProducts}</span> watches matching your criteria.
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-neutral-400" />
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="border border-neutral-200 px-3 py-1.5 text-sm bg-white focus:border-black focus:outline-none rounded cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loading ? (
              Array(6)
                .fill(null)
                .map((_, i) => <ProductSkeleton key={i} />)
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-sm text-neutral-500 bg-neutral-50 border border-dashed border-neutral-200 rounded">
                No watches found matching the selected filters.
                <button
                  onClick={handleClearFilters}
                  className="mt-4 block mx-auto text-xs font-bold uppercase tracking-wider text-black underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6 border-t border-neutral-100">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 border border-neutral-200 rounded text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-black"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => handlePageChange(pNum)}
                  className={`px-4 py-2 border rounded text-sm transition-all ${
                    page === pNum
                      ? 'bg-primary-800 border-primary-800 text-gold-100 font-bold shadow-sm'
                      : 'border-neutral-200 text-neutral-650 hover:border-gold-500 hover:text-gold-600'
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 border border-neutral-200 rounded text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-black"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ===================== MOBILE FILTERS SLIDEOVER ===================== */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white py-4 pb-12 shadow-xl">
            <div className="flex items-center justify-between px-4 pb-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold uppercase tracking-wider text-black">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-neutral-500 hover:text-black text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-6 space-y-6">
              {/* Search */}
              <form onSubmit={handleApplyFilters} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Search</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search watches..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full border border-neutral-200 px-4 py-2 pr-10 text-sm focus:border-black focus:outline-none"
                  />
                </div>
              </form>

              {/* Categories */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary-900">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateParam('category', cat)}
                      className={`text-center text-xs py-2 border rounded transition-all duration-250 ${
                        category === cat 
                          ? 'bg-primary-800 border-primary-800 text-gold-100 font-bold' 
                          : 'border-neutral-200 text-neutral-600 hover:border-primary-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <form onSubmit={handleApplyFilters} className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Price Range</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                  <span className="text-neutral-400 text-xs">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    className="w-full rounded bg-primary-800 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-gold-100 border border-gold-500/20 hover:bg-primary-900"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="w-full rounded border border-neutral-200 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-neutral-600 hover:border-primary-800 hover:text-primary-800"
                  >
                    Clear All
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
