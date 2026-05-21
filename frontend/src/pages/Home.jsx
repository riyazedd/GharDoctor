import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { services } from '../services/mockData';
import { 
  Search, ArrowRight, ShieldCheck, Star, Clock, 
  Sparkles, Droplet, Zap, Paintbrush, Flower, Wrench, Hammer, ShieldAlert,
  ThumbsUp, UserCheck, ShieldAlert as ShieldIcon
} from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import FeaturedServiceCard from '../components/FeaturedServiceCard';
import QualityCard from '../components/QualityCard';
import TestimonialCard from '../components/TestimonialCard';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const featuredServices = services.slice(0, 3);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/services');
    }
  };

  const handleCategorySelect = (categoryName) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  const handleBookNow = (service) => {
    navigate('/booking');
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-slate-950 pt-20 pb-24 md:pt-28 md:pb-36 px-4">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium Home Maintenance Made Simple</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-100 leading-tight tracking-tight max-w-4xl mx-auto">
            Your Trusted Professionals For{' '}
            <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Home Maintenance
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            From emergency pipe leaks to appliance repairs and deep home cleaning, connect with background-verified expert professionals in Kathmandu.
          </p>

          {/* Search bar form */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What service do you need today? (e.g. Plumbing, Cleaning)"
              className="w-full pl-12 pr-32 py-4 bg-slate-900/90 border border-slate-800 group-hover:border-slate-700 focus:border-cyan-500/60 rounded-full text-base focus:outline-none focus:ring-1 focus:ring-cyan-500/60 shadow-xl shadow-slate-950/50 text-slate-200 placeholder-slate-500 transition-all duration-300"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-full transition-all duration-200 cursor-pointer shadow-md text-sm"
            >
              Search
            </button>
          </form>

          {/* Tag suggestion row */}
          <div className="flex justify-center flex-wrap gap-2 text-xs text-slate-500">
            <span>Popular:</span>
            {['Plumbing', 'House Cleaning', 'AC Maintenance'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  navigate('/services');
                }}
                className="hover:text-cyan-400 underline transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Browse Services by Category</h2>
            <p className="text-slate-400 text-sm mt-2">Pick a category to find specialized professionals matching your job</p>
          </div>
          <a 
            href="/services"
            className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer self-center md:self-auto"
          >
            See All Services
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading ? (
            <div className="col-span-full text-center text-slate-400">Loading categories...</div>
          ) : categories.length > 0 ? (
            categories.slice(0, 8).map((cat) => (
              <CategoryCard 
                key={cat.categoryName}
                category={cat}
                onSelect={handleCategorySelect}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-slate-400">No categories available</div>
          )}
        </div>
      </section>

      {/* 3. FEATURED SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Our Most Popular Services</h2>
          <p className="text-slate-400 text-sm mt-2">Book top-rated, fully guaranteed services in one click</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredServices.map((service) => (
            <FeaturedServiceCard
              key={service.id}
              service={service}
              onBookNow={handleBookNow}
            />
          ))}
        </div>
      </section>

      {/* 4. VALUE PROPOSITION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-slate-900/30 border border-slate-900 rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
                Designed to make home maintenance hassle-free.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Finding local professionals in Kathmandu shouldn't require complex logistics or risky negotiations. GharDoctor provides a structured, safe platform that connects you to premium local service experts instantly.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-1">
                  <span className="text-3xl font-black text-cyan-400 block">100%</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Satisfaction Guaranteed</span>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-black text-cyan-400 block">500+</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Jobs Completed</span>
                </div>
              </div>
            </div>

            {/* Quality Cards Grid */}
            <div className="space-y-4">
              {[
                { icon: UserCheck, title: "Background-Verified Pros", desc: "Every single professional on GharDoctor has undergone citizenship, phone, and reference check-ups.", color: "text-emerald-400 bg-emerald-500/10" },
                { icon: ThumbsUp, title: "Transparent Pricing", desc: "No surprise charges or random bargaining. Know the pricing structure beforehand and schedule accordingly.", color: "text-amber-400 bg-amber-500/10" },
                { icon: ShieldIcon, title: "Insurance & Support", desc: "Our administrative team handles disputes, updates schedules, and guarantees a 24-hour service warranty support.", color: "text-rose-400 bg-rose-500/10" }
              ].map((item, idx) => (
                <QualityCard key={idx} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">What Our Clients Say</h2>
          <p className="text-slate-400 text-sm mt-2">Read testimonials from homeowners across the Kathmandu valley</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Anil Gurung", role: "Homeowner, Lalitpur", text: "I booked Ramesh BK for a bathroom plumbing emergency. He arrived within 45 minutes, found the pipe blockage immediately, and resolved it in an hour. Extremely professional and convenient!", rating: 5 },
            { name: "Sita Sharma", role: "Resident, Baluwatar", text: "The House Cleaning service was exceptional. The professional team sanitised the kitchen, dusted all ceilings, and vacuumed thoroughly. The transparent pricing structure is a lifesaver.", rating: 5 },
            { name: "Prakash Adhikari", role: "Homeowner, Kapan", text: "I scheduled Suresh Thapa to repair a short-circuit switchboard. Excellent safety gear and precise diagnostic tools. GharDoctor has completely removed the headache of finding technicians.", rating: 4 }
          ].map((test, index) => (
            <TestimonialCard key={index} testimonial={test} />
          ))}
        </div>
      </section>
    </div>
  );
}
