import { useState, useEffect } from 'react';
import { Users, UserCheck, Briefcase, TrendingUp, Activity, Settings, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, providerAPI, serviceAPI } from '../API';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768); // Open on desktop, closed on mobile
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalServices: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch statistics
    fetchStats();

    // Handle window resize for responsive design
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Close sidebar on mobile
      } else {
        setSidebarOpen(true); // Always open sidebar on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStats = async () => {
    try {
      let totalUsers = 0;
      let totalProviders = 0;
      let totalServices = 0;
      let totalBookings = 0;

      // Fetch users count
      try {
        const usersRes = await userAPI.getAllUsers();
        const usersData = usersRes.data;
        totalUsers = Array.isArray(usersData) ? usersData.length : 0;
      } catch (err) {
        console.warn('Error fetching users:', err);
      }

      // Fetch service providers count
      try {
        const providersRes = await providerAPI.getAllProviders();
        const providersData = providersRes.data;
        totalProviders = Array.isArray(providersData) ? providersData.length : 0;

        // Calculate total bookings from providers' completedJobs
        totalBookings = providersData.reduce((sum, provider) => {
          return sum + (provider.completedJobs || 0);
        }, 0);
      } catch (err) {
        console.warn('Error fetching providers:', err);
      }

      // Fetch services count
      try {
        const servicesRes = await serviceAPI.getAllServices();
        const servicesData = servicesRes.data;
        totalServices = Array.isArray(servicesData) ? servicesData.length : 0;
      } catch (err) {
        console.warn('Error fetching services:', err);
      }

      setStats({
        totalUsers,
        totalProviders,
        totalServices,
        totalBookings,
      });
    } catch (error) {
      console.error('Error in fetchStats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const StatCard = ({ icon: Icon, title, value, bgColor, iconColor }) => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 md:p-6 hover:border-slate-600/50 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs md:text-sm font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-100 mt-1 md:mt-2 truncate">{value}</p>
        </div>
        <div className={`${bgColor} p-2 md:p-4 rounded-xl shrink-0`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  const ChartBar = ({ label, value, maxValue = 100, color }) => (
    <div className="mb-4 md:mb-6">
      <div className="flex items-center justify-between mb-1.5 md:mb-2 gap-2">
        <span className="text-xs md:text-sm font-medium text-slate-400 truncate">{label}</span>
        <span className="text-xs md:text-sm font-semibold text-slate-100 shrink-0">{value}%</span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isMobile ? 'fixed w-64' : 'relative w-64'
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 top-0 left-0 h-screen z-40`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-lg md:text-xl font-bold text-cyan-400">GharDoctor</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-200 transition-colors md:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 md:p-2 lg:p-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
          </div>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
            <Users className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm">Users</span>}
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
            <UserCheck className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm">Providers</span>}
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
            <Briefcase className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm">Services</span>}
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
            <Settings className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm">Settings</span>}
          </button>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-900/50 border-b border-slate-800 p-3 md:p-4 lg:p-6 flex items-center justify-between sticky top-0 z-20">
          {/* Menu toggle for mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-slate-400 hover:text-slate-200 transition-colors mr-3"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Admin Dashboard</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5 md:mt-1">Welcome back, {user?.firstName}!</p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-2">
            {/* User info - hidden on mobile */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-slate-100">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
              {user?.firstName?.charAt(0)}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-3 md:p-4 lg:p-6 space-y-6 md:space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.totalUsers}
                bgColor="bg-blue-500/10"
                iconColor="text-blue-400"
              />
              <StatCard
                icon={UserCheck}
                title="Service Providers"
                value={stats.totalProviders}
                bgColor="bg-emerald-500/10"
                iconColor="text-emerald-400"
              />
              <StatCard
                icon={Briefcase}
                title="Total Services"
                value={stats.totalServices}
                bgColor="bg-purple-500/10"
                iconColor="text-purple-400"
              />
              <StatCard
                icon={TrendingUp}
                title="Total Bookings"
                value={stats.totalBookings}
                bgColor="bg-orange-500/10"
                iconColor="text-orange-400"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Analytics Chart */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-slate-100 mb-4 md:mb-6">Service Performance</h3>
                <ChartBar label="Plumbing" value={85} color="bg-blue-500" />
                <ChartBar label="Electrical" value={92} color="bg-emerald-500" />
                <ChartBar label="Cleaning" value={78} color="bg-purple-500" />
                <ChartBar label="Painting" value={65} color="bg-orange-500" />
                <ChartBar label="Gardening" value={71} color="bg-pink-500" />
              </div>

              {/* Activity Overview */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-slate-100 mb-4 md:mb-6">Monthly Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 md:p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-xs md:text-sm text-slate-300">New Users This Month</span>
                    <span className="text-base md:text-lg font-semibold text-cyan-400">+24</span>
                  </div>
                  <div className="flex items-center justify-between p-2 md:p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-xs md:text-sm text-slate-300">Active Providers</span>
                    <span className="text-base md:text-lg font-semibold text-emerald-400">+18</span>
                  </div>
                  <div className="flex items-center justify-between p-2 md:p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-xs md:text-sm text-slate-300">Completed Bookings</span>
                    <span className="text-base md:text-lg font-semibold text-orange-400">+156</span>
                  </div>
                  <div className="flex items-center justify-between p-2 md:p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-xs md:text-sm text-slate-300">Customer Satisfaction</span>
                    <span className="text-base md:text-lg font-semibold text-purple-400">4.7/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-slate-100 mb-4 md:mb-6">Recent Activities</h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-slate-700/20 rounded-lg">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-slate-300 truncate">New user registration: Ram Kumar</p>
                    <p className="text-xs text-slate-500 mt-0.5">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-slate-700/20 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-slate-300 truncate">Service provider activated: Suresh Thapa</p>
                    <p className="text-xs text-slate-500 mt-0.5">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-slate-700/20 rounded-lg">
                  <div className="w-2 h-2 bg-orange-400 rounded-full shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-slate-300 truncate">Booking completed: Plumbing Service</p>
                    <p className="text-xs text-slate-500 mt-0.5">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-slate-700/20 rounded-lg">
                  <div className="w-2 h-2 bg-purple-400 rounded-full shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-slate-300 truncate">New review received: 5 stars</p>
                    <p className="text-xs text-slate-500 mt-0.5">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
