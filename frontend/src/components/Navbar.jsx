import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ShieldCheck, Calendar, Home, Wrench, ChevronDown, LayoutDashboard, BookOpen } from 'lucide-react';
import { authAPI, bookingAPI } from '../API';
import ImageWithFallback from './ImageWithFallback';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAuthenticated(true);
      setIsAdmin(parsedUser.isAdmin || false);

      const fetchBookingsCount = async () => {
        try {
          const response = await bookingAPI.getUserBookings(parsedUser._id);
          setBookingsCount(response.data.length);
        } catch (err) {
          console.error('Error fetching bookings count:', err);
        }
      };

      fetchBookingsCount();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Services', href: '/services', icon: Wrench },
  ];

  const authenticatedNav = isAuthenticated && user
    ? [...navigation,
        user.isProvider || user.skill
          ? { name: 'Provider Dashboard', href: '/provider-dashboard', icon: BookOpen }
          : { name: 'My Bookings', href: '/my-bookings', icon: BookOpen }
      ]
    : navigation;

  const accountImage = user?.avatar || user?.profileImg;

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error clearing session cookie:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setIsAdmin(false);
    navigate('/');
    setMobileMenuOpen(false);
  };

  const NavLink = ({ item, isMobile = false }) => {
    const Icon = item.icon;
    const isActive = item.href === '/'
      ? location.pathname === '/'
      : location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
    const baseClasses = isMobile
      ? 'flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition-all duration-200'
      : 'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300';

    const activeClasses = isActive
      ? 'border border-[#e7ba9a] bg-[#f9efe6] text-[#7d3d22] shadow-[0_10px_22px_rgba(201,109,66,0.08)]'
      : 'border border-transparent text-[#5a4b45] hover:bg-[#f4e7dc] hover:text-[#1f1a17]';

    return (
      <a
        href={item.href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        aria-current={isActive ? 'page' : undefined}
        className={`${baseClasses} ${activeClasses}`}
      >
        <Icon className={`h-4 w-4 ${isActive ? 'text-[#7d3d22]' : 'text-[#7b655f]'}`} />
        {item.name}
      </a>
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e5d4c0] bg-[#fffaf5]/80 shadow-[0_8px_16px_rgba(70,42,28,0.04)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <a href="/" className="flex cursor-pointer items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#edd1b3] bg-gradient-to-br from-[#d77a4a] via-[#e4b56f] to-[#c8c98e] shadow-[0_12px_22px_rgba(199,108,68,0.18)]">
              <img src="logo.png" alt="GharDoctor logo" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-[-0.05em] text-[#201a17]">
                Ghar<span className="text-[#c96d42]">Doctor</span>
              </span>
              <p className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7f6d66]">Home Services</p>
            </div>
          </a>

          <div className="hidden items-center gap-2 md:flex">
            {authenticatedNav.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}

            {isAdmin && (
              <a
                href="/admin"
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  currentView === 'admin'
                    ? 'border border-[#e7ba9a] bg-[#f9efe6] text-[#7d3d22] shadow-[0_10px_22px_rgba(201,109,66,0.08)]'
                    : 'border border-transparent text-[#5a4b45] hover:bg-[#f4e7dc] hover:text-[#1f1a17]'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-[#7d3d22]" />
                Admin Panel
              </a>
            )}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-full border border-[#eadcc7] bg-[#fffdfb] px-3 py-1.5 transition-all duration-200 hover:border-[#d5b496]"
                >
                  <ImageWithFallback
                    src={accountImage}
                    alt={`${user.firstName || 'User'} account`}
                    fallback={user.firstName?.[0] || 'U'}
                    className="h-7 w-7 rounded-full border border-[#eadcc7] bg-[#f7efe8]"
                  />
                  <span className="text-sm font-semibold text-[#201a17]">{user.firstName}</span>
                  <ChevronDown className={`h-4 w-4 text-[#7d6a62] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-[#eadcc7] bg-[#fffdfb] shadow-xl">
                    <a
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-3 border-b border-[#f0e5d9] px-4 py-3 text-sm font-medium text-[#3e3835] transition-colors hover:bg-[#f9efe6]"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[#b86845]" />
                      Dashboard
                    </a>

                    {isAdmin && (
                      <a
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-3 border-b border-[#f0e5d9] px-4 py-3 text-sm font-medium text-[#3e3835] transition-colors hover:bg-[#f9efe6]"
                      >
                        <ShieldCheck className="h-4 w-4 text-[#7d3d22]" />
                        Admin Panel
                      </a>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-[#8a4d2b] transition-colors hover:bg-[#f9ece9]"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href="/login"
                  className="cursor-pointer rounded-full px-5 py-2 text-sm font-semibold text-[#4b3d38] transition-all duration-200 hover:bg-[#f0e0d4] hover:text-[#201a17]"
                >
                  Sign In
                </a>
                <a
                  href="/booking"
                  className="cursor-pointer rounded-full bg-gradient-to-r from-[#d77a4a] to-[#d9b46f] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#d77a4a]/20 transition-all duration-200 hover:brightness-105 active:scale-95"
                >
                  Book Now
                </a>
              </div>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-[#eadcc7] bg-[#fffdfb] p-2 text-[#5e4d48] transition-all hover:text-[#201a17]"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-[#e5d4c0] bg-[#fffaf5] md:hidden">
          <div className="space-y-1.5 px-2 pb-4 pt-2 sm:px-3">
            {authenticatedNav.map((item) => {
              return <NavLink key={item.name} item={item} isMobile />;
            })}

            <div className="mt-2 border-t border-[#eadcc7] px-4 pt-4">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-1">
                    <ImageWithFallback
                      src={accountImage}
                      alt={`${user.firstName || 'User'} account`}
                      fallback={user.firstName?.[0] || 'U'}
                      className="h-8 w-8 rounded-full border border-[#eadcc7] bg-[#f7efe8]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#201a17]">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-[#7d6a62]">{user.email}</p>
                    </div>
                  </div>
                  <a
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#eadcc7] bg-[#fffdfb] py-2.5 font-semibold text-[#3e3835] transition-all duration-200 hover:border-[#d5b496] hover:text-[#201a17]"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </a>
                  {isAdmin && (
                    <a
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#eadcc7] bg-[#f9efe6] py-2.5 font-semibold text-[#7d3d22] transition-all duration-200 hover:border-[#e7ba9a]"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin Panel
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#eadcc7] bg-[#fffaf5] py-2.5 font-semibold text-[#8a4d2b] transition-all duration-200 hover:border-[#d5b496]"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="cursor-pointer rounded-xl border border-[#eadcc7] bg-[#fffaf5] py-2.5 text-center text-sm font-semibold text-[#4b3d38] transition-all duration-200 hover:border-[#d5b496] hover:text-[#201a17]"
                  >
                    Sign In
                  </a>
                  <a
                    href="/booking"
                    onClick={() => setMobileMenuOpen(false)}
                    className="cursor-pointer rounded-xl bg-gradient-to-r from-[#d77a4a] to-[#d9b46f] py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-[#d77a4a]/20 transition-all duration-200 hover:brightness-105"
                  >
                    Book Now
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
