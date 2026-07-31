import { useState, useEffect } from 'react';
import { Users, UserCheck, Briefcase, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI, bookingAPI, providerAPI, serviceAPI, userAPI } from '../API';
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
  const [servicePerformance, setServicePerformance] = useState([]);
  const [monthlyOverview, setMonthlyOverview] = useState({
    newUsers: 0,
    activeProviders: 0,
    completedBookings: 0,
    satisfaction: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
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
      const [usersResult, providersResult, servicesResult, bookingsResult] = await Promise.allSettled([
        userAPI.getAllUsers(),
        providerAPI.getAllProviders(),
        serviceAPI.getAllServices(),
        bookingAPI.getAllBookings(),
      ]);

      const getData = (result, label) => {
        if (result.status === 'rejected') {
          console.warn(`Error fetching ${label}:`, result.reason);
          return [];
        }
        return Array.isArray(result.value.data) ? result.value.data : [];
      };

      const users = getData(usersResult, 'users');
      const providers = getData(providersResult, 'providers');
      const services = getData(servicesResult, 'services');
      const bookings = getData(bookingsResult, 'bookings');

      setStats({
        totalUsers: users.length,
        totalProviders: providers.length,
        totalServices: services.length,
        totalBookings: bookings.length,
      });

      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);
      const createdThisMonth = (item) => item.createdAt && new Date(item.createdAt) >= currentMonthStart;
      const ratedProviders = providers.filter((provider) => Number(provider.reviews) > 0);
      const averageRating = ratedProviders.length
        ? ratedProviders.reduce((sum, provider) => sum + Number(provider.rating || 0), 0) / ratedProviders.length
        : 0;

      setMonthlyOverview({
        newUsers: users.filter(createdThisMonth).length,
        activeProviders: providers.filter((provider) => provider.availability).length,
        completedBookings: bookings.filter(
          (booking) => booking.status === 'Completed' && createdThisMonth(booking)
        ).length,
        satisfaction: averageRating,
      });

      const bookingCounts = bookings.reduce((counts, booking) => {
        const key = booking.serviceId || booking.serviceName;
        if (key) counts[key] = (counts[key] || 0) + 1;
        return counts;
      }, {});
      const highestBookingCount = Math.max(...Object.values(bookingCounts), 1);
      setServicePerformance(
        services
          .map((service) => {
            const count = bookingCounts[service._id] || bookingCounts[service.serviceName] || 0;
            return {
              label: service.serviceName,
              count,
            };
          })
          .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
          .map((service, index) => ({
            ...service,
            value: Math.round((service.count / highestBookingCount) * 100),
            color: ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'][index % 5],
          }))
      );

      const activityItems = [
        ...users.map((item) => ({ type: 'user', date: item.createdAt, text: `New user registration: ${item.firstName} ${item.lastName}` })),
        ...providers.map((item) => ({ type: 'provider', date: item.createdAt, text: `Service provider registered: ${item.firstName} ${item.lastName}` })),
        ...bookings.map((item) => ({
          type: item.status === 'Completed' ? 'completed' : 'booking',
          date: item.updatedAt || item.createdAt,
          text: item.status === 'Completed'
            ? `Booking completed: ${item.serviceName}`
            : `New booking: ${item.serviceName}`,
        })),
      ];
      setRecentActivities(activityItems
        .filter((item) => item.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4));
    } catch (error) {
      console.error('Error in fetchStats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error clearing session cookie:', error);
    }
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

  const ChartBar = ({ label, value, count, color }) => (
    <div className="mb-4 md:mb-6">
      <div className="flex items-center justify-between mb-1.5 md:mb-2 gap-2">
        <span className="text-xs md:text-sm font-medium text-slate-400 truncate">{label}</span>
        <span className="text-xs md:text-sm font-semibold text-slate-100 shrink-0">{count} booking{count === 1 ? '' : 's'}</span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  const formatRelativeTime = (date) => {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) === 1 ? '' : 's'} ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) === 1 ? '' : 's'} ago`;
    return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) === 1 ? '' : 's'} ago`;
  };

  const activityColors = { user: 'bg-cyan-400', provider: 'bg-emerald-400', completed: 'bg-orange-400', booking: 'bg-purple-400' };

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
                {servicePerformance.length ? servicePerformance.map((service) => (
                  <ChartBar key={service.label} {...service} />
                )) : (
                  <p className="text-sm text-slate-400">No booking data available yet.</p>
                )}
              </div>

              {/* Activity Overview */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-slate-100 mb-4 md:mb-6">Monthly Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 md:p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-xs md:text-sm text-slate-300">New Users This Month</span>
                    <span className="text-base md:text-lg font-semibold text-cyan-400">{monthlyOverview.newUsers}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 md:p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-xs md:text-sm text-slate-300">Active Providers</span>
                    <span className="text-base md:text-lg font-semibold text-emerald-400">{monthlyOverview.activeProviders}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 md:p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-xs md:text-sm text-slate-300">Completed Bookings</span>
                    <span className="text-base md:text-lg font-semibold text-orange-400">{monthlyOverview.completedBookings}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 md:p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-xs md:text-sm text-slate-300">Customer Satisfaction</span>
                    <span className="text-base md:text-lg font-semibold text-purple-400">{monthlyOverview.satisfaction.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-slate-100 mb-4 md:mb-6">Recent Activities</h3>
              <div className="space-y-2 md:space-y-3">
                {recentActivities.length ? recentActivities.map((activity, index) => (
                  <div key={`${activity.type}-${activity.date}-${index}`} className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-slate-700/20 rounded-lg">
                    <div className={`w-2 h-2 ${activityColors[activity.type]} rounded-full shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-slate-300 truncate">{activity.text}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatRelativeTime(activity.date)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400">No recent activity yet.</p>
                )}
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
