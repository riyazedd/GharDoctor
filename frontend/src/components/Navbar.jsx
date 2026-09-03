import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ShieldCheck, Home, Wrench, ChevronDown, LayoutDashboard, BookOpen, Bell } from 'lucide-react';
import { authAPI, bookingAPI } from '../API';
import ImageWithFallback from './ImageWithFallback';
import useBookingChatNotifications from '../hooks/useBookingChatNotifications';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const isCustomer = Boolean(user && !user.isProvider && !user.skill && !user.isAdmin);
  const { unreadTotal, notifications, clearAllUnread } = useBookingChatNotifications({
    bookings,
    currentUser: isCustomer ? user : null,
    activeBookingId: null,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAuthenticated(true);
      setIsAdmin(parsedUser.isAdmin || false);

      const fetchBookingsCount = async () => {
        if (parsedUser.isProvider || parsedUser.skill || parsedUser.isAdmin) return;
        try {
          const response = await bookingAPI.getUserBookings(parsedUser._id);
          setBookings(response.data);
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
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationMenuOpen(false);
      }
    };

    if (dropdownOpen || notificationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen, notificationMenuOpen]);

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
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setIsAdmin(false);
    setBookings([]);
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationMenuOpen((previous) => {
      const isOpening = !previous;
      if (isOpening) clearAllUnread();
      return isOpening;
    });
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
          <a href="/" className="flex cursor-pointer items-center">
            <div className="flex h-11 w-11 items-center justify-center">
              <img src="logo-dark.png" alt="GharDoctor logo" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tighter text-[#201a17]">
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
                  location.pathname === '/admin'
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
              <>
                {isCustomer && (
                  <div className="relative" ref={notificationRef}>
                    <button
                      type="button"
                      onClick={toggleNotifications}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#eadcc7] bg-[#fffdfb] text-[#5b4d49] transition-colors hover:text-[#201a17]"
                      aria-label="Open notifications"
                      aria-expanded={notificationMenuOpen}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadTotal > 0 && (
                        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#d77a4a] px-1 text-[10px] font-bold text-white ring-2 ring-[#fffdfb]">
                          {unreadTotal > 99 ? '99+' : unreadTotal}
                        </span>
                      )}
                    </button>
                    {notificationMenuOpen && (
                      <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[#eadcc7] bg-[#fffdfb] shadow-xl">
                        <div className="border-b border-[#f0e5d9] px-4 py-3">
                          <p className="text-sm font-bold text-[#201a17]">Notifications</p>
                          <p className="text-xs text-[#655d5a]">Chat and booking updates</p>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length ? notifications.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setNotificationMenuOpen(false);
                                navigate('/my-bookings');
                              }}
                              className="w-full border-b border-[#f0e5d9] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#f9efe6]"
                            >
                              <p className="truncate text-sm font-semibold text-[#201a17]">{item.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-[#655d5a]">{item.message}</p>
                            </button>
                          )) : (
                            <p className="px-4 py-8 text-center text-sm text-[#655d5a]">No notifications yet.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
              </>
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
                  className="cursor-pointer rounded-full bg-linear-to-r from-[#d77a4a] to-[#d9b46f] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#d77a4a]/20 transition-all duration-200 hover:brightness-105 active:scale-95"
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
                    className="cursor-pointer rounded-xl bg-liniear-to-r from-[#d77a4a] to-[#d9b46f] py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-[#d77a4a]/20 transition-all duration-200 hover:brightness-105"
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
