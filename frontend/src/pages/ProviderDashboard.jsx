import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Briefcase, Star, CheckCircle, AlertCircle, Trash2, LogOut,
  Calendar, Clock, MapPin, Phone, Mail, Activity, TrendingUp, Power
} from 'lucide-react';

export default function ProviderDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Check authentication and provider status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : null;

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    // Check if user is a provider
    if (!userData.isProvider && !userData.skill) {
      navigate('/');
      return;
    }

    setUser(userData);
    // Load service requests from localStorage (simulated)
    const savedRequests = JSON.parse(localStorage.getItem('ghardoctor_service_requests') || '[]');
    setServiceRequests(savedRequests);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const toggleAvailability = () => {
    try {
      const updatedUser = { ...user, availability: !user.availability };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess(`Availability turned ${!user.availability ? 'on' : 'off'}`);
      setTimeout(() => setSuccess(''), 3000);
      window.location.reload();
    } catch (err) {
      setError('Failed to update availability');
      setTimeout(() => setError(''), 3000);
    }
  };

  const acceptRequest = (requestId) => {
    try {
      const updatedRequests = serviceRequests.map(req =>
        req.id === requestId ? { ...req, status: 'Accepted' } : req
      );
      localStorage.setItem('ghardoctor_service_requests', JSON.stringify(updatedRequests));
      setServiceRequests(updatedRequests);
      setSuccess('Service request accepted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to accept request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const rejectRequest = (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) {
      return;
    }

    try {
      const updatedRequests = serviceRequests.map(req =>
        req.id === requestId ? { ...req, status: 'Rejected' } : req
      );
      localStorage.setItem('ghardoctor_service_requests', JSON.stringify(updatedRequests));
      setServiceRequests(updatedRequests);
      setSuccess('Service request rejected');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reject request');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Not Logged In</h2>
            <p className="text-slate-400 mb-6">Please sign in to view your provider dashboard.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingRequests = serviceRequests.filter(r => r.status === 'Pending');
  const acceptedRequests = serviceRequests.filter(r => r.status === 'Accepted');
  const completedJobs = user.completedJobs || 0;
  const avgRating = user.rating || 0;

  return (
    <div className="min-h-screen bg-slate-950 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-lg">
                {user.firstName?.[0] || 'P'}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-100">
                  Welcome, {user.firstName}!
                </h1>
                <p className="text-sm text-slate-400 mt-1">Service Provider Dashboard</p>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
              <button
                onClick={toggleAvailability}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all ${
                  user.availability
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 border border-slate-600'
                }`}
              >
                <Power className="w-4 h-4" />
                {user.availability ? 'Available' : 'Unavailable'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100 font-bold rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{success}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">Completed Jobs</p>
                <p className="text-3xl font-bold text-emerald-400">{completedJobs}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-cyan-400">{pendingRequests.length}</p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-3xl font-bold text-yellow-400">{avgRating.toFixed(1)}</p>
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                <Star className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-blue-400">{user.reviews || 0}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 pb-2 gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Service Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-4">Overview</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Recent Activity</h3>
                {acceptedRequests.length > 0 ? (
                  <div className="space-y-3">
                    {acceptedRequests.slice(0, 5).map(req => (
                      <div key={req.id} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <div className="flex-1">
                          <p className="text-slate-100 font-semibold">{req.serviceName}</p>
                          <p className="text-xs text-slate-400">{req.date} at {req.time}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                          Accepted
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No accepted requests yet</p>
                )}
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Your Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Category</p>
                    <p className="text-slate-200 font-semibold">{user.skill}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-slate-200 font-semibold">{user.experience || 0} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Status</p>
                    <p className={`font-semibold ${user.availability ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {user.availability ? '🟢 Available' : '🔴 Unavailable'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-4">Service Requests</h2>
            
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 mt-4">Loading service requests...</p>
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all"
                  >
                    {/* Request Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-100">{request.serviceName}</h3>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{request.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Offered Price</p>
                        <p className="text-xl font-bold text-emerald-400">Rs. {request.price}</p>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{request.date}</span>
                        <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{request.time}</span>
                      </div>

                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{request.address}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300 font-semibold">{request.customerName}</span>
                        <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{request.customerPhone}</span>
                      </div>

                      {request.instructions && (
                        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                          <p className="text-xs text-slate-400 font-semibold mb-1">Special Instructions</p>
                          <p className="text-sm text-slate-300">{request.instructions}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-800 flex gap-2">
                      <button
                        onClick={() => acceptRequest(request.id)}
                        className="flex-1 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 font-semibold transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectRequest(request.id)}
                        className="flex-1 px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 font-semibold transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No Pending Requests</h3>
                <p className="text-slate-400">You'll see new service requests here when customers request your services</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-4">Provider Profile</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">First Name</p>
                <p className="text-lg text-slate-200 font-semibold">{user.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Last Name</p>
                <p className="text-lg text-slate-200 font-semibold">{user.lastName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <p className="text-slate-300">{user.email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <p className="text-slate-300">{user.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Service Category</p>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <p className="text-slate-300">{user.skill || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Experience</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <p className="text-slate-300">{user.experience || 0} years</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
