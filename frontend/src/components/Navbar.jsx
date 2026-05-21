import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ShieldCheck, Calendar, Home, Wrench } from 'lucide-react';

export default function Navbar({ currentView }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Services', href: '/services', icon: Wrench },
  ];

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
          <a href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="p-2.5 bg-linear-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 animate-pulse">
              <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-linear-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                Ghar<span className="text-cyan-400">Doctor</span>
              </span>
              <p className="text-[10px] text-cyan-500 font-semibold tracking-wider uppercase -mt-1">Home Services</p>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-2">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}

            {isAuthenticated && (
              <a
                href="/bookings"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentView === 'bookings'
                    ? "bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <Calendar className="w-4 h-4" />
                My Bookings
              </a>
            )}

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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-linear-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 font-bold text-xs uppercase shadow-inner">
                    {user.firstName?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-200 pr-1">
                    {user.firstName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-400" />
                  Logout
                </button>
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
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} isMobile />
            ))}

            {isAuthenticated && (
              <a
                href="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  currentView === 'bookings'
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                }`}
              >
                <Calendar className="w-4 h-4" />
                My Bookings
              </a>
            )}

            {isAdmin && (
              <a
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  currentView === 'admin'
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Admin Panel
              </a>
            )}

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
