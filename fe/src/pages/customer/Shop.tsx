import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown, SlidersHorizontal, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { SareeCard } from '../../components/common/SareeCard';
import { Product, Category } from '../../types';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters from query params or local state
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc' | 'rating'>('latest');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/storefront/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {
          maxPrice: priceRange,
          sortBy,
        };
        if (currentCategory) params.category = currentCategory;
        if (currentSearch) params.search = currentSearch;
        if (selectedColor) params.color = selectedColor;
        if (selectedFabric) params.fabric = selectedFabric;

        const res = await api.get('/products', { params });
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Error fetching sarees:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategory, currentSearch, selectedColor, selectedFabric, priceRange, sortBy]);

  const handleCategoryClick = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === currentCategory) {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSelectedColor('');
    setSelectedFabric('');
    setPriceRange(30000);
    setSortBy('latest');
    setSearchParams(new URLSearchParams());
  };

  const colors = ['Maroon', 'Red', 'Blue', 'Green', 'Yellow', 'White'];
  const fabrics = ['Pure Mulberry Silk', 'Sico (Combed Cotton Body with Pure Silk Borders)', 'Silk Handloom'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER */}
      <div className="mb-8 border-b border-ivory-300 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] text-gold-600 uppercase block mb-1">
            Handloom Marketplace
          </span>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">
            {currentCategory 
              ? categories.find(c => c.slug === currentCategory)?.name || 'Authentic Sarees' 
              : currentSearch 
                ? `Search results for "${currentSearch}"` 
                : 'All Authentic Gadwal Sarees'}
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Showing {products.length} genuine pit-loom handlooms with authenticated GI certification.
          </p>
        </div>

        {/* SORTING CONTROLS */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-ivory-400 rounded text-xs font-semibold text-charcoal-800"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-charcoal-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white border border-ivory-400 rounded text-xs font-medium text-charcoal-800 focus:outline-none"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-300">
            <h3 className="font-serif font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
              <Filter size={15} className="text-gold-600" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs text-brand-700 hover:underline font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* CATEGORIES */}
          <div>
            <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider mb-2.5">
              Categories
            </h4>
            <div className="space-y-1.5">
              <button
                onClick={() => handleCategoryClick('')}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded transition-colors ${
                  !currentCategory ? 'bg-brand-50 text-brand-800 font-bold' : 'text-charcoal-600 hover:bg-ivory-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryClick(c.slug)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded transition-colors ${
                    currentCategory === c.slug ? 'bg-brand-50 text-brand-800 font-bold' : 'text-charcoal-600 hover:bg-ivory-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* PRICE RANGE SLIDER */}
          <div>
            <div className="flex justify-between items-center mb-2 text-xs">
              <h4 className="font-bold text-charcoal-900 uppercase tracking-wider">Max Price</h4>
              <span className="font-mono font-semibold text-brand-900">₹{priceRange.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={30000}
              step={1000}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-brand-700"
            />
            <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
              <span>₹10,000</span>
              <span>₹30,000</span>
            </div>
          </div>

          {/* COLOR FILTER */}
          <div>
            <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider mb-2.5">
              Primary Color
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {colors.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(selectedColor === col ? '' : col)}
                  className={`px-3 py-1 rounded text-xs border transition-colors ${
                    selectedColor === col 
                      ? 'bg-brand-700 text-white border-brand-700 font-semibold' 
                      : 'bg-white text-charcoal-700 border-ivory-400 hover:border-brand-400'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* FABRIC FILTER */}
          <div>
            <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider mb-2.5">
              Fabric / Weave
            </h4>
            <div className="space-y-1.5">
              {fabrics.map((fab) => (
                <label key={fab} className="flex items-center space-x-2 text-xs text-charcoal-700 cursor-pointer">
                  <input
                    type="radio"
                    name="fabric"
                    checked={selectedFabric === fab}
                    onChange={() => setSelectedFabric(selectedFabric === fab ? '' : fab)}
                    className="accent-brand-700"
                  />
                  <span className="line-clamp-1">{fab}</span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* PRODUCT GRID */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-ivory-200 aspect-[3/4] rounded-lg"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-ivory-300 space-y-3">
              <Sparkles size={28} className="mx-auto text-gold-500" />
              <h3 className="font-serif font-bold text-lg text-charcoal-800">No Sarees Found</h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                No products match your selected filters. Try broadening your criteria or reset filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-brand-700 text-white rounded text-xs font-semibold hover:bg-brand-800"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <SareeCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MOBILE FILTER MODAL */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-ivory-300 pb-3">
              <h3 className="font-serif font-bold text-base text-charcoal-900">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)}><X size={20} /></button>
            </div>
            
            {/* CATEGORIES */}
            <div>
              <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider mb-2">Categories</h4>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { handleCategoryClick(c.slug); setMobileFilterOpen(false); }}
                    className="w-full text-left text-xs py-1 text-charcoal-700"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { handleClearFilters(); setMobileFilterOpen(false); }}
              className="w-full py-2 bg-brand-700 text-white text-xs rounded font-semibold"
            >
              Apply & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
