import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, ShieldCheck, ShieldOff, Eye, Maximize2 } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import ImageWithFallback from '../components/ImageWithFallback';
import { AdminLayoutProvider, useAdminLayout } from '../context/AdminLayoutContext';
import { useToast } from '../context/ToastContext';
import { providerAPI, userAPI } from '../API';

const ServiceProviderManagementContent = () => {
  const toast = useToast();
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [detailsProvider, setDetailsProvider] = useState(null);
  const [showCitizenshipFullscreen, setShowCitizenshipFullscreen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentProvider, setCurrentProvider] = useState(null);
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    citizenshipNumber: '',
    skill: '',
    experience: 0,
    availability: true,
    citizenshipImage: '',
    avatar: '',
  });

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, toast]);

  // Fetch admin user info
  useEffect(() => {
     const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch providers
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await providerAPI.getAdminProviders();
      setProviders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const filteredProviders = providers.filter((provider) =>
    `${provider.firstName} ${provider.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.phone.includes(searchTerm) ||
    provider.skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setCurrentProvider(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      citizenshipNumber: '',
      skill: '',
      experience: 0,
      availability: true,
      citizenshipImage: '',
      avatar: '',
    });
    setShowModal(true);
    setError(null);
  };

  const handleEdit = (provider) => {
    setModalMode('edit');
    setCurrentProvider(provider);
    setFormData({
      firstName: provider.firstName,
      lastName: provider.lastName,
      email: provider.email,
      password: '',
      phone: provider.phone,
      citizenshipNumber: provider.citizenshipNumber || '',
      skill: provider.skill,
      experience: provider.experience,
      availability: provider.availability,
      citizenshipImage: provider.citizenshipImage,
      avatar: provider.avatar,
    });
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProvider(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      citizenshipNumber: '',
      skill: '',
      experience: 0,
      availability: true,
      citizenshipImage: '',
      avatar: '',
    });
    setError(null);
  };

  const handleSave = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.citizenshipNumber || !formData.skill || !formData.citizenshipImage) {
        setError('Please fill in all required fields');
        return;
      }

      if (modalMode === 'add' && !formData.password) {
        setError('Password is required for new providers');
        return;
      }

      if (modalMode === 'edit') {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await providerAPI.updateProvider(currentProvider._id, updateData);
        setProviders(
          providers.map((provider) =>
            provider._id === currentProvider._id ? { ...provider, ...updateData } : provider
          )
        );
      } else {
        const response = await providerAPI.createProvider(formData);
        setProviders([...providers, response.data.provider || response.data]);
      }

      setShowModal(false);
      setError(null);
      toast.success(`Provider ${modalMode === 'edit' ? 'updated' : 'created'} successfully`);
    } catch (err) {
      console.error('Error saving provider:', err);
      setError(err.response?.data?.message || 'Failed to save provider');
    }
  };

  const handleDelete = async (providerId, providerName) => {
    if (window.confirm(`Are you sure you want to delete ${providerName}?`)) {
      try {
        await providerAPI.deleteProvider(providerId);
        setProviders(providers.filter((provider) => provider._id !== providerId));
        setError(null);
        toast.success('Provider deleted successfully');
      } catch (err) {
        console.error('Error deleting provider:', err);
        setError('Failed to delete provider');
      }
    }
  };

  const handleToggleVerify = async (providerId) => {
    try {
      const response = await providerAPI.toggleVerification(providerId);
      const updated = response.data.provider;
      setProviders(providers.map((p) =>
        p._id === providerId ? { ...p, isVerified: updated.isVerified } : p
      ));
      setDetailsProvider((provider) =>
        provider?._id === providerId ? { ...provider, isVerified: updated.isVerified } : provider
      );
      toast.success(updated.isVerified ? 'Provider verified successfully' : 'Provider verification revoked');
    } catch (err) {
      console.error('Error toggling verification:', err);
      setError('Failed to update verification status');
    }
  };

  const handleRejectProvider = async (providerId) => {
    if (!window.confirm('Reject this provider? Their account will be marked unverified and unavailable, and they will receive a notification.')) return;
    try {
      const response = await providerAPI.rejectProvider(providerId);
      const updated = response.data.provider;
      setProviders((previous) => previous.map((provider) => provider._id === providerId ? { ...provider, ...updated } : provider));
      setDetailsProvider((provider) => provider?._id === providerId ? { ...provider, ...updated } : provider);
      toast.success(response.data.message);
    } catch (err) {
      console.error('Error rejecting provider:', err);
      setError(err.response?.data?.message || 'Failed to reject provider');
    }
  };

  const handleViewDetails = (provider) => {
    setDetailsProvider(provider);
    setShowCitizenshipFullscreen(false);
  };

  const handleCloseDetails = () => {
    setDetailsProvider(null);
    setShowCitizenshipFullscreen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-hidden">
        <AdminHeader title="Service Provider Management" subtitle="Manage all service providers" user={user} />

        <div className="p-3 sm:p-4 md:p-8">
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6 relative">
            <Search className="absolute left-3 top-2.5 sm:top-3 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Add Provider Button */}
          <div className="mb-4 sm:mb-6 flex justify-end">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-cyan-700 transition"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Provider</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Providers Table */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm sm:text-base">Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm sm:text-base">No providers found</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/50 shadow">
              <table className="min-w-full table-fixed text-xs sm:text-sm">
                <thead className="bg-slate-900/50 border-b border-slate-700/50">
                  <tr>
                    <th className="hidden xl:table-cell px-6 py-3 text-left font-semibold text-slate-300">Avatar</th>
                    <th className="hidden xl:table-cell px-6 py-3 text-left font-semibold text-slate-300">Citizenship</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-slate-300">Name</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left font-semibold text-slate-300">Email</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left font-semibold text-slate-300">Phone</th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left font-semibold text-slate-300">Skill</th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left font-semibold text-slate-300">Experience</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left font-semibold text-slate-300">Availability</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left font-semibold text-slate-300">ID Verified</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => (
                    <tr key={provider._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                      <td className="hidden xl:table-cell px-6 py-4">
                        <ImageWithFallback
                          src={provider.avatar}
                          alt={`${provider.firstName} ${provider.lastName} avatar`}
                          fallback={provider.firstName?.[0] || 'P'}
                          className="w-10 h-10 rounded-full"
                        />
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4">
                        <ImageWithFallback
                          src={provider.citizenshipImage}
                          alt={`${provider.firstName} ${provider.lastName} citizenship`}
                          fallback="ID"
                          className="w-14 h-10 rounded-lg"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-100">
                        <div className="max-w-45 truncate font-semibold text-slate-100">
                          {provider.firstName} {provider.lastName}
                        </div>
                        <div className="text-xs text-slate-400 sm:hidden">{provider.skill}</div>
                      </td>
                      <td className="hidden sm:table-cell max-w-55 truncate px-6 py-4 text-slate-100">{provider.email}</td>
                      <td className="hidden md:table-cell whitespace-nowrap px-6 py-4 text-slate-100">{provider.phone}</td>
                      <td className="hidden lg:table-cell max-w-35 truncate px-6 py-4 text-slate-100">{provider.skill}</td>
                      <td className="hidden lg:table-cell whitespace-nowrap px-6 py-4 text-slate-100">{provider.experience} years</td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                            provider.availability
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-700/50 text-slate-300'
                          }`}
                        >
                          {provider.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                            provider.isVerified
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {provider.isVerified
                            ? <><ShieldCheck className="w-3 h-3" /> Verified</>
                            : <><ShieldOff className="w-3 h-3" /> Pending</>}
                        </span>
                      </td>
                      <td className="w-56 px-3 sm:px-6 py-2 sm:py-4 text-center">
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                          <button
                            onClick={() => handleViewDetails(provider)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/10"
                            title="View provider details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(provider)}
                            className="p-1.5 sm:p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(provider._id, `${provider.firstName} ${provider.lastName}`)}
                            className="p-1.5 sm:p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="admin-management-modal bg-white rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                {modalMode === 'edit' ? 'Edit Provider' : 'Add New Provider'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-slate-700/50 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={modalMode === 'edit'}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-600/30 disabled:opacity-50"
                />
              </div>

              {modalMode === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}

              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Change Password (leave empty to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Citizenship Number *
                </label>
                <input
                  type="text"
                  name="citizenshipNumber"
                  value={formData.citizenshipNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Skill *
                </label>
                <input
                  type="text"
                  name="skill"
                  value={formData.skill}
                  onChange={handleInputChange}
                  placeholder="e.g., Plumbing, Electrical, Carpentry"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Experience (years) *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Citizenship Image *
                </label>
                {typeof formData.citizenshipImage === 'string' && formData.citizenshipImage && (
                  <div className="mb-2">
                    <ImageWithFallback
                      src={formData.citizenshipImage}
                      alt={`${formData.firstName || 'Provider'} citizenship preview`}
                      fallback="ID"
                      className="w-full h-36 rounded-lg"
                    />
                  </div>
                )}
                <input
                  type="file"
                  name="citizenshipImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-white"
                />
                <p className="mt-1 text-xs text-slate-400">
                  {typeof formData.citizenshipImage === 'string' && formData.citizenshipImage
                    ? 'Current image will stay unless you choose a new file.'
                    : formData.citizenshipImage?.name || 'Choose an image file to upload.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Avatar Image
                </label>
                {typeof formData.avatar === 'string' && formData.avatar && (
                  <div className="mb-2">
                    <ImageWithFallback
                      src={formData.avatar}
                      alt={`${formData.firstName || 'Provider'} avatar preview`}
                      fallback={formData.firstName?.[0] || 'P'}
                      className="w-24 h-24 rounded-full"
                    />
                  </div>
                )}
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-white"
                />
                <p className="mt-1 text-xs text-slate-400">
                  {typeof formData.avatar === 'string' && formData.avatar
                    ? 'Current avatar will stay unless you choose a new file.'
                    : formData.avatar?.name || 'Choose an optional avatar image file.'}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="availability"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-cyan-600 border-slate-600/50 rounded focus:ring-2 focus:ring-cyan-500 bg-slate-700/50"
                />
                <label htmlFor="availability" className="text-sm font-medium text-slate-300">
                  Available for bookings
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-slate-700/50 bg-slate-700/20">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-3 sm:px-4 py-2 border border-slate-600/50 text-slate-300 rounded-lg text-sm sm:text-base hover:bg-slate-700/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-cyan-700 transition"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save Provider</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Details Modal */}
      {detailsProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="admin-management-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-slate-700/50 bg-white shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="provider-details-title"
          >
            <div className="flex items-center justify-between border-b border-slate-700/50 p-4 sm:p-6">
              <div>
                <h2 id="provider-details-title" className="text-xl font-bold text-slate-100">Provider Details</h2>
                <p className="mt-1 text-sm text-slate-400">Review the provider profile and citizenship document.</p>
              </div>
              <button onClick={handleCloseDetails} className="rounded-lg p-1 hover:bg-slate-700/50" aria-label="Close provider details">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <ImageWithFallback
                  src={detailsProvider.avatar}
                  alt={`${detailsProvider.firstName} ${detailsProvider.lastName} avatar`}
                  fallback={detailsProvider.firstName?.[0] || 'P'}
                  className="h-16 w-16 shrink-0 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{detailsProvider.firstName} {detailsProvider.lastName}</h3>
                  <p className="text-sm text-slate-400">{detailsProvider.email}</p>
                </div>
                <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${detailsProvider.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {detailsProvider.isVerified ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                  {detailsProvider.isVerified ? 'Verified' : 'Pending review'}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</p><p className="mt-1 text-slate-100">{detailsProvider.phone || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Skill</p><p className="mt-1 text-slate-100">{detailsProvider.skill || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experience</p><p className="mt-1 text-slate-100">{detailsProvider.experience ?? 0} years</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Availability</p><p className="mt-1 text-slate-100">{detailsProvider.availability ? 'Available for bookings' : 'Unavailable'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rating</p><p className="mt-1 text-slate-100">{detailsProvider.rating ?? 0} ({detailsProvider.reviews ?? 0} reviews)</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Completed jobs</p><p className="mt-1 text-slate-100">{detailsProvider.completedJobs ?? 0}</p></div>
              </div>

              <div className="rounded-lg border border-slate-700/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Citizenship number</p>
                <p className="mt-1 font-medium text-slate-100">{detailsProvider.citizenshipNumber || 'Not provided'}</p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-100">Citizenship image</p>
                  {detailsProvider.citizenshipImage && (
                    <button onClick={() => setShowCitizenshipFullscreen(true)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10">
                      <Maximize2 className="h-4 w-4" /> View fullscreen
                    </button>
                  )}
                </div>
                {detailsProvider.citizenshipImage ? (
                  <button onClick={() => setShowCitizenshipFullscreen(true)} className="block w-full overflow-hidden rounded-lg border border-slate-700/50" aria-label="View citizenship image fullscreen">
                    <img src={detailsProvider.citizenshipImage} alt={`${detailsProvider.firstName} ${detailsProvider.lastName} citizenship`} className="h-56 w-full object-contain bg-slate-100" />
                  </button>
                ) : <p className="rounded-lg border border-dashed border-slate-700/50 p-6 text-center text-sm text-slate-400">No citizenship image available.</p>}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-700/50 p-4 sm:flex-row sm:p-6">
              <button onClick={handleCloseDetails} className="flex-1 rounded-lg border border-slate-600/50 px-4 py-2 text-slate-300 hover:bg-slate-700/50">Close</button>
              <button onClick={() => handleRejectProvider(detailsProvider._id)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-700">
                <ShieldOff className="h-4 w-4" /> Reject
              </button>
              <button onClick={() => handleToggleVerify(detailsProvider._id)} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white ${detailsProvider.isVerified ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {detailsProvider.isVerified ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                {detailsProvider.isVerified ? 'Revoke Verification' : 'Verify Provider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Citizenship Image Fullscreen Viewer */}
      {detailsProvider && showCitizenshipFullscreen && detailsProvider.citizenshipImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Citizenship image fullscreen viewer">
          <button onClick={() => setShowCitizenshipFullscreen(false)} className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25" aria-label="Close fullscreen image"><X className="h-6 w-6" /></button>
          <img src={detailsProvider.citizenshipImage} alt={`${detailsProvider.firstName} ${detailsProvider.lastName} citizenship`} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
};

export default function ServiceProviderManagement() {
  return (
    <AdminLayoutProvider>
      <ServiceProviderManagementContent />
    </AdminLayoutProvider>
  );
}
