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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

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
            color: ['bg-[#d77a4a]', 'bg-[#8a9d6f]', 'bg-[#c89a5d]', 'bg-[#af7d8d]', 'bg-[#4a7d7a]'][index % 5],
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
      setRecentActivities(
        activityItems
          .filter((item) => item.date)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 4)
      );
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
    localStorage.removeItem('user');
    navigate('/login');
  };

  const StatCard = ({ icon: Icon, title, value, bgColor, iconColor }) => (
    <div className="rounded-[26px] border border-[#eadcc7] bg-[#fffdfb] p-4 shadow-[0_14px_32px_rgba(70,42,28,0.03)] transition-all duration-200 hover:border-[#e7ba9a] md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d6a62] md:text-sm">{title}</p>
          <p className="mt-2 truncate text-2xl font-black tracking-[-0.05em] text-[#201a17] md:text-3xl">{value}</p>
        </div>
        <div className={`${bgColor} shrink-0 rounded-2xl p-2 md:p-4`}>
          <Icon className={`h-5 w-5 md:h-6 md:w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  const ChartBar = ({ label, value, count, color }) => (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-[#695d59] md:text-sm">{label}</span>
        <span className="shrink-0 text-xs font-semibold text-[#201a17] md:text-sm">{count} booking{count === 1 ? '' : 's'}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-[#f2e6dc]">
        <div className={`${color} h-2.5 rounded-full transition-all duration-300`} style={{ width: `${value}%` }}></div>
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

  const activityColors = { user: 'bg-[#d77a4a]', provider: 'bg-[#6f8d60]', completed: 'bg-[#c89a5d]', booking: 'bg-[#8a6ca7]' };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1ea]">
        <div className="text-[#655d5a]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f1ea]">
      <AdminSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader title="Admin Dashboard" subtitle={`Welcome back, ${user?.firstName}!`} user={user} />

        <div className="flex-1 overflow-auto">
          <div className="space-y-6 p-3 md:space-y-8 md:p-4 lg:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4 lg:gap-6">
              <StatCard icon={Users} title="Total Users" value={stats.totalUsers} bgColor="bg-[#edf6ff]" iconColor="text-[#3d77a6]" />
              <StatCard icon={UserCheck} title="Service Providers" value={stats.totalProviders} bgColor="bg-[#edf6ee]" iconColor="text-[#456d4c]" />
              <StatCard icon={Briefcase} title="Total Services" value={stats.totalServices} bgColor="bg-[#f6eee9]" iconColor="text-[#8a4d2b]" />
              <StatCard icon={TrendingUp} title="Total Bookings" value={stats.totalBookings} bgColor="bg-[#fff0d8]" iconColor="text-[#b5721d]" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
              <div className="rounded-[26px] border border-[#eadcc7] bg-[#fffdfb] p-4 shadow-[0_14px_32px_rgba(70,42,28,0.03)] md:p-6">
                <h3 className="mb-4 text-base font-black tracking-[-0.04em] text-[#201a17] md:mb-6 md:text-lg">Service Performance</h3>
                {servicePerformance.length ? servicePerformance.map((service) => (
                  <ChartBar key={service.label} {...service} />
                )) : (
                  <p className="text-sm text-[#655d5a]">No booking data available yet.</p>
                )}
              </div>

              <div className="rounded-[26px] border border-[#eadcc7] bg-[#fffdfb] p-4 shadow-[0_14px_32px_rgba(70,42,28,0.03)] md:p-6">
                <h3 className="mb-4 text-base font-black tracking-[-0.04em] text-[#201a17] md:mb-6 md:text-lg">Monthly Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-[#f8f1ea] p-2 md:p-3">
                    <span className="text-xs text-[#5c514d] md:text-sm">New Users This Month</span>
                    <span className="text-base font-bold text-[#b86845] md:text-lg">{monthlyOverview.newUsers}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#f3f6ee] p-2 md:p-3">
                    <span className="text-xs text-[#5c514d] md:text-sm">Active Providers</span>
                    <span className="text-base font-bold text-[#4f6d4c] md:text-lg">{monthlyOverview.activeProviders}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#fff1e2] p-2 md:p-3">
                    <span className="text-xs text-[#5c514d] md:text-sm">Completed Bookings</span>
                    <span className="text-base font-bold text-[#b5721d] md:text-lg">{monthlyOverview.completedBookings}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#f5efe8] p-2 md:p-3">
                    <span className="text-xs text-[#5c514d] md:text-sm">Customer Satisfaction</span>
                    <span className="text-base font-bold text-[#7b5f89] md:text-lg">{monthlyOverview.satisfaction.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-[#eadcc7] bg-[#fffdfb] p-4 shadow-[0_14px_32px_rgba(70,42,28,0.03)] md:p-6">
              <h3 className="mb-4 text-base font-black tracking-[-0.04em] text-[#201a17] md:mb-6 md:text-lg">Recent Activities</h3>
              <div className="space-y-2 md:space-y-3">
                {recentActivities.length ? recentActivities.map((activity, index) => (
                  <div key={`${activity.type}-${activity.date}-${index}`} className="flex items-center gap-3 rounded-2xl bg-[#f8f3ee] p-2 md:gap-4 md:p-3">
                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${activityColors[activity.type]}`}></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-[#3e3835] md:text-sm">{activity.text}</p>
                      <p className="mt-0.5 text-[11px] text-[#7d6a62]">{formatRelativeTime(activity.date)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-[#655d5a]">No recent activity yet.</p>
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

