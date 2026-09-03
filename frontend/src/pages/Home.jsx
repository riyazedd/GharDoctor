import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  UserCheck,
  ShieldAlert as ShieldIcon,
  House,
  Wrench,
  Hammer,
  Paintbrush,
  Droplet,
  Flame,
  Clock3,
  Star
} from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import QualityCard from '../components/QualityCard';
import TestimonialCard from '../components/TestimonialCard';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectAuthenticatedUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/session', {
          credentials: 'include',
        });

        if (!response.ok) return;

        const { role } = await response.json();
        const dashboardByRole = {
          admin: '/admin/dashboard',
          provider: '/provider-dashboard',
          user: '/',
        };

        if (dashboardByRole[role]) {
          navigate(dashboardByRole[role], { replace: true });
        }
      } catch (error) {
        console.error('Error checking active session:', error);
      }
    };

    redirectAuthenticatedUser();
  }, [navigate]);

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



  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/services?search=${encodeURIComponent(query)}`);
    }
  };

  const handleCategorySelect = (categoryName) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  const servicePills = ['Plumbing', 'House Cleaning', 'AC Maintenance', 'Electrical'];

  return (
    <div className="space-y-24 pb-20">
      <section className="relative overflow-hidden px-4 pb-20 pt-16 md:pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,_rgba(201,109,66,0.14),_transparent_22%),radial-gradient(circle_at_80%_20%,_rgba(126,141,104,0.12),_transparent_26%)]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8 lg:pr-6">

              <div className="space-y-6">
                <h1 className="max-w-2xl text-5xl font-black leading-[0.88] tracking-[-0.08em] text-[#201a17] sm:text-6xl md:text-[3.5rem] lg:text-[4.2rem]">
                  Find a trusted professional to fix something in your home.
                </h1>

                <p className="max-w-lg text-base leading-relaxed text-[#5a4d48] sm:text-lg md:text-base">
                  From plumbing emergencies to paint touch-ups and seasonal upkeep, GharDoctor connects you with vetted local experts who know how to keep a home running smoothly.
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
                <div className="absolute inset-y-0 left-0 flex items-center pl-5 text-[#7d665f]">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you need fixed today?"
                  className="w-full rounded-full border border-[#eadcc7] bg-[#fffdfb]/90 py-4 pl-12 pr-32 text-base text-[#2b241f] placeholder-[#7b665f] shadow-[0_18px_40px_rgba(90,62,44,0.08)] transition-all duration-200 focus:border-[#d38b66] focus:outline-none focus:ring-2 focus:ring-[#f0d4b5]"
                />
                <button
                  type="submit"
                  className="site-button-primary absolute right-2 top-2 px-6 py-2.5 text-sm font-bold"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#6f615b]">
                <span className="font-medium">Popular fixes:</span>
                {servicePills.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate('/services')}
                    className="rounded-full border border-[#eadcc7] bg-white/80 px-3 py-1.5 transition-colors hover:border-[#d7b395] hover:text-[#c96d42]"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative lg:justify-self-end">
              <div className="overflow-hidden rounded-[30px] border border-[#e8d9ca] bg-[#fffaf5] p-3 shadow-[0_20px_50px_rgba(101,77,61,0.08)]">
                <div className="overflow-hidden rounded-[26px] border border-[#ebdcc9] bg-[#f6eee6]">
                  <img
                    src="hero.jpg"
                    alt="Professional fixing home maintenance issue"
                    className="h-110 w-full object-cover"
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-[18px] border border-[#eadbc8] bg-[#fffdfb] p-3">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#f7efe7] text-[#b86845]">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d6b63]">Repair</p>
                    <p className="mt-2 text-xl font-black text-[#201a17]">24/7</p>
                  </div>
                  <div className="rounded-[18px] border border-[#eadbc8] bg-[#fffdfb] p-3">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#f4f0e4] text-[#7e8d68]">
                      <House className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d6b63]">Homes</p>
                    <p className="mt-2 text-xl font-black text-[#201a17]">12k+</p>
                  </div>
                  <div className="rounded-[18px] border border-[#eadbc8] bg-[#fffdfb] p-3">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#fbefe8] text-[#b86845]">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d6b63]">Verified</p>
                    <p className="mt-2 text-xl font-black text-[#201a17]">4.9</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Browse services</p>
            <h2 className="mt-2 text-3xl font-black tracking-tighter text-[#201a17]">Common home fixes</h2>
          </div>
          <a
            href="/services"
            className="inline-flex items-center gap-1 self-center text-sm font-semibold text-[#b86845] hover:text-[#8e4a2b] md:self-auto"
          >
            See all services
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {loading ? (
            <div className="col-span-full text-center text-[#665d59]">Loading categories...</div>
          ) : categories.length > 0 ? (
            categories.slice(0, 8).map((cat) => (
              <CategoryCard key={cat.categoryName} category={cat} onSelect={handleCategorySelect} />
            ))
          ) : (
            <div className="col-span-full text-center text-[#665d59]">No categories available</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-[#e8d9ca] bg-[#fffdfb]/80 p-8 shadow-[0_18px_36px_rgba(64,39,25,0.05)] sm:p-10 md:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="eyebrow">Why GharDoctor</p>
              <h2 className="max-w-xl text-3xl font-black leading-tight tracking-tighter text-[#201a17] sm:text-4xl">
                Professional help without the usual hassle.
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-[#645b57]">
                We keep the process clear, local, and trustworthy so you know who is showing up, what they are fixing, and how the job is being handled from start to finish.
              </p>

              <div className="grid max-w-lg grid-cols-2 gap-4">
                <div className="rounded-[20px] border border-[#eadbc8] bg-[#f8f1ea] p-4">
                  <span className="block text-3xl font-black text-[#b86845]">100%</span>
                  <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b6a63]">Satisfaction</span>
                </div>
                <div className="rounded-[20px] border border-[#eadbc8] bg-[#f8f1ea] p-4">
                  <span className="block text-3xl font-black text-[#b86845]">500+</span>
                  <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b6a63]">Jobs completed</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: UserCheck, title: 'Background-verified pros', desc: 'Every professional is checked for reputation, safety, and reliability before they are available for your home.', color: 'text-[#356b4b] bg-[#e9f1e9]' },
                { icon: ThumbsUp, title: 'Transparent pricing', desc: 'Know the estimate up front, avoid surprise quotes, and book with confidence.', color: 'text-[#8a5e24] bg-[#f8efe2]' },
                { icon: ShieldIcon, title: 'Support you can trust', desc: 'From scheduling to issue follow-up, our team sticks with the job from first call to final check.', color: 'text-[#9f4d45] bg-[#f9ece9]' }
              ].map((item, idx) => (
                <QualityCard key={idx} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center">
          <p className="eyebrow">Testimonials</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#201a17]">What homeowners say</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { name: 'Anil Gurung', role: 'Homeowner, Lalitpur', text: 'I booked Ramesh BK for a bathroom plumbing emergency. He arrived within 45 minutes, found the pipe blockage immediately, and resolved it in an hour. Extremely professional and convenient!', rating: 5 },
            { name: 'Sita Sharma', role: 'Resident, Baluwatar', text: 'The House Cleaning service was exceptional. The professional team sanitised the kitchen, dusted all ceilings, and vacuumed thoroughly. The transparent pricing structure is a lifesaver.', rating: 5 },
            { name: 'Prakash Adhikari', role: 'Homeowner, Kapan', text: 'I scheduled Suresh Thapa to repair a short-circuit switchboard. Excellent safety gear and precise diagnostic tools. GharDoctor has completely removed the headache of finding technicians.', rating: 4 }
          ].map((test, index) => (
            <TestimonialCard key={index} testimonial={test} />
          ))}
        </div>
      </section>
    </div>
  );
}
