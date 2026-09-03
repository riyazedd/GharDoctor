import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, ChevronRight } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { serviceAPI, categoryAPI } from '../API';

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

  // Apply category and search filters passed in the URL, then scroll to top.
  useEffect(() => {
    const categoryFromURL = searchParams.get('category');
    const searchFromURL = searchParams.get('search');

    setSelectedCategory(categoryFromURL || 'All');
    setSearchQuery(searchFromURL || '');
    window.scrollTo(0, 0);
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        setCategories(response.data);
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
        const response = await serviceAPI.getAllServices();
        let data = response.data;

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
    if (!localStorage.getItem('user')) {
      navigate('/login');
      return;
    }

    navigate('/booking', { state: { service } });
  };

  return (
    <div className="min-h-screen bg-[#f7f1ea] pt-8">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a5a3c]">
                <span>Discover services</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-[#b86845]">{selectedCategory}</span>
              </div>

              <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.06em] text-[#201a17] sm:text-5xl">
                Browse local professionals
              </h1>
            </div>

            <div className="w-full max-w-md">
              <label htmlFor="services-search-input" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d6a62]">
                Search by service
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#7d665f]">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  id="services-search-input"
                  type="text"
                  placeholder="Plumbing, cleaning, electrical..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-[#eadcc7] bg-[#fffdfb] py-3 pl-11 pr-4 text-sm text-[#2b241f] placeholder-[#7b665f] transition-all focus:border-[#d38b66] focus:outline-none focus:ring-2 focus:ring-[#f0d4b5]"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:w-72">
            <div className="space-y-6 rounded-[26px] border border-[#eadcc7] bg-[#fffdfb]/80 p-5 shadow-[0_14px_30px_rgba(68,40,24,0.03)]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d6a62]">
                  <Filter className="h-3.5 w-3.5" />
                  Categories
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`w-full rounded-full border px-4 py-2.5 text-left text-xs font-semibold transition-all ${
                      selectedCategory === 'All'
                        ? 'border-[#e9c29d] bg-[#f9efe6] text-[#8e4d2f]'
                        : 'border-transparent bg-[#f5efe9] text-[#5d4d49] hover:border-[#e8d1b7] hover:text-[#201a17]'
                    }`}
                  >
                    All Services
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id || cat.categoryName}
                      onClick={() => setSelectedCategory(cat.categoryName)}
                      className={`w-full rounded-full border px-4 py-2.5 text-left text-xs font-semibold transition-all ${
                        selectedCategory === cat.categoryName
                          ? 'border-[#e9c29d] bg-[#f9efe6] text-[#8e4d2f]'
                          : 'border-transparent bg-[#f5efe9] text-[#5d4d49] hover:border-[#e8d1b7] hover:text-[#201a17]'
                      }`}
                    >
                      {cat.categoryName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#eee1d5] pt-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d6a62]">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Sort by
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: 'Featured / Default', value: 'none' },
                      { label: 'Price: Low to High', value: 'low-high' },
                      { label: 'Price: High to Low', value: 'high-low' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPriceSort(opt.value)}
                        className={`block w-full rounded-full border px-4 py-2.5 text-left text-xs font-semibold transition-all ${
                          priceSort === opt.value
                            ? 'border-[#e9c29d] bg-[#f9efe6] text-[#8e4d2f]'
                            : 'border-transparent bg-[#f5efe9] text-[#5d4d49] hover:border-[#e8d1b7] hover:text-[#201a17]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="w-full">
            {loading ? (
              <div className="rounded-[28px] border border-[#eadcc7] bg-[#fffdfb]/80 p-12 text-center shadow-[0_14px_30px_rgba(68,40,24,0.03)]">
                <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#d58c63] border-t-transparent" />
                <p className="mt-4 text-sm text-[#655d5a]">Loading services...</p>
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-dashed border-[#e2c8b2] bg-[#fffdfb]/80 p-12 text-center">
                <p className="text-base font-semibold text-[#a24939]">Error loading services</p>
                <p className="mt-2 text-xs text-[#6d615c]">{error}</p>
              </div>
            ) : services.length > 0 ? (
              <div className="space-y-5">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} onBookNow={handleBookNow} />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#e2c8b2] bg-[#fffdfb]/80 p-12 text-center">
                <p className="text-base font-semibold text-[#201a17]">No services found matching your query</p>
                <p className="mt-2 text-xs text-[#6d615c]">Try selecting “All Services” or changing the search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
