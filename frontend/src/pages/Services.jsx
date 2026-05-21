import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, ChevronRight } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';

export default function Services() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceSort, setPriceSort] = useState('none');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set category from URL parameter on mount and scroll to top
  useEffect(() => {
    const categoryFromURL = searchParams.get('category');
    if (categoryFromURL) {
      setSelectedCategory(categoryFromURL);
    }
    window.scrollTo(0, 0);
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/services');
        if (response.ok) {
          let data = await response.json();

          // Filter by category
          if (selectedCategory !== 'All') {
            data = data.filter(service => service.category === selectedCategory);
          }

          // Filter by search query
          if (searchQuery.trim()) {
            data = data.filter(service =>
              service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              service.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }

          // Sort by price
          if (priceSort === 'low-high') {
            data = [...data].sort((a, b) => a.price - b.price);
          } else if (priceSort === 'high-low') {
            data = [...data].sort((a, b) => b.price - a.price);
          }

          setServices(data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchQuery, priceSort]);

  const handleBookNow = (service) => {
    navigate('/booking', { state: { service } });
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* 1. Header & Search section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest pl-0.5">
            <span>Discover Services</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-cyan-400 font-bold">{selectedCategory}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight mt-2.5">Find the Right Expert</h1>
        </div>

        {/* Global search */}
        <div className="w-full md:max-w-sm relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="services-search-input"
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-slate-200 placeholder-slate-500 transition-all"
          />
        </div>
      </div>

      {/* 2. Filter Controls Panels */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          {/* Category Filter Widget */}
          <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-900/60 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              Categories
            </h3>
            <div className="flex flex-row lg:flex-col flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'All'
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                }`}
              >
                All Services
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id || cat.categoryName}
                  onClick={() => setSelectedCategory(cat.categoryName)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat.categoryName
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                  }`}
                >
                  {cat.categoryName}
                </button>
              ))}
            </div>
          </div>

          {/* Price Sorting Widget */}
          <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-900/60 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort Options
            </h3>
            <div className="flex flex-row lg:flex-col gap-1.5">
              {[
                { label: 'Featured / Default', value: 'none' },
                { label: 'Price: Low to High', value: 'low-high' },
                { label: 'Price: High to Low', value: 'high-low' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriceSort(opt.value)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    priceSort === opt.value
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Services Grid */}
        <div className="grow w-full">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 mt-4">Loading services...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed space-y-3">
              <p className="text-red-400 text-base font-semibold">Error loading services</p>
              <p className="text-slate-500 text-xs">{error}</p>
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6.5">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} onBookNow={handleBookNow} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed space-y-3">
              <p className="text-slate-400 text-base font-semibold">No services found matching your query</p>
              <p className="text-slate-500 text-xs">Try selecting 'All Services' or altering your search filter terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
