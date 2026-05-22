import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ShieldCheck, Calendar, Home, Wrench, ChevronDown, LayoutDashboard, BookOpen } from 'lucide-react';

export default function Navbar({ currentView }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAuthenticated(true);
      setIsAdmin(parsedUser.isAdmin || false);
    }

    // Load bookings count
    const bookings = JSON.parse(localStorage.getItem('ghardoctor_bookings') || '[]');
    setBookingsCount(bookings.length);
  }, []);

  // Close dropdown when clicking outside
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

  const handleLogout = () => {
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
    const isActive = currentView === item.href || (currentView === 'home' && item.href === '/');
    const baseClasses = isMobile
      ? "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200"
      : "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300";
    
    const activeClasses = isActive
      ? "bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5"
      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent";

    return (
      <a
        href={item.href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`${baseClasses} ${activeClasses}`}
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
        {item.name}
      </a>
    );
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <a href="/" className="flex items-center gap-1 cursor-pointer">
            <img src="logo.png" alt="" className='w-15'/>
            <div>
              <span className="text-xl font-extrabold bg-linear-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                Ghar<span className="text-cyan-400">Doctor</span>
              </span>
              <p className="text-[10px] text-cyan-500 font-semibold tracking-wider uppercase -mt-1">Home Services</p>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-2">
            {authenticatedNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.href || (currentView === 'home' && item.href === '/');
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                    isActive
                      ? "bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  {item.name}
                </a>
              );
            })}



            {isAdmin && (
              <a
                href="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentView === 'admin'
                    ? "bg-linear-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/5"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Admin Panel
              </a>
            )}
          </div>

          {/* User Section & Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-full bg-linear-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 font-bold text-xs uppercase shadow-inner">
                    {user.firstName?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-200">
                    {user.firstName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl z-50 overflow-hidden animate-fade-in">
                    {/* My Bookings Option - REMOVED */}

                {/* Dashboard Option */}
                    <a
                      href="/dashboard"
                      onClick={() => {
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-colors duration-150 border-b border-slate-800/50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                      Dashboard
                    </a>

                    {/* Admin Panel Option */}
                    {isAdmin && (
                      <a
                        href="/admin"
                        onClick={() => {
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-colors duration-150 border-b border-slate-800/50"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        Admin Panel
                      </a>
                    )}

                    {/* Logout Option */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href="/login"
                  className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-full transition-all duration-200 cursor-pointer"
                >
                  Sign In
                </a>
                <a
                  href="/booking"
                  className="px-5 py-2.5 text-sm font-semibold bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-full shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Book Now
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu toggle button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 border border-slate-800 focus:outline-none transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer panel */}
      {mobileMenuOpen && (
        <div className="md:hidden animate-fade-in bg-slate-950 border-b border-slate-800">
          <div className="px-2 pt-2 pb-4 space-y-1.5 sm:px-3">
              {authenticatedNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.href || (currentView === 'home' && item.href === '/');
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 relative ${
                      isActive
                        ? "bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    {item.name}
                  </a>
                );
              })}



            <div className="pt-4 mt-2 border-t border-slate-800/80 px-4">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 font-bold uppercase text-sm">
                      {user.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <a
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-slate-100 font-semibold transition-all duration-200 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </a>
                  {isAdmin && (
                    <a
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-purple-800 hover:border-purple-700 bg-purple-900/20 text-purple-300 hover:text-purple-200 font-semibold transition-all duration-200 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Panel
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 font-semibold transition-all duration-200 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl text-center border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-sm transition-all duration-200 cursor-pointer"
                  >
                    Sign In
                  </a>
                  <a
                    href="/booking"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl text-center bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all duration-200 cursor-pointer shadow-md shadow-cyan-500/10"
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
