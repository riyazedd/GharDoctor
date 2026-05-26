import { useState, useEffect } from 'react';
import { Users, UserCheck, Briefcase, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, providerAPI, serviceAPI } from '../API';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { AdminLayoutProvider, useAdminLayout } from '../context/AdminLayoutContext';

function AdminDashboardContent() {
  const navigate = useNavigate();
  const { isMobile, sidebarOpen } = useAdminLayout();
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
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Admin Dashboard" subtitle={`Welcome back, ${user?.firstName}!`} user={user} />

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

export default function AdminDashboard() {
  return (
    <AdminLayoutProvider>
      <AdminDashboardContent />
    </AdminLayoutProvider>
  );
}
