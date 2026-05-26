import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { AdminLayoutProvider, useAdminLayout } from '../context/AdminLayoutContext';
import { providerAPI, userAPI } from '../API';

const ServiceProviderManagementContent = () => {
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
    skill: '',
    experience: 0,
    availability: true,
    citizenshipImage: '',
  });

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
      const response = await providerAPI.getAllProviders();
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

  const handleAdd = () => {
    setModalMode('add');
    setCurrentProvider(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      skill: '',
      experience: 0,
      availability: true,
      citizenshipImage: '',
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
      skill: provider.skill,
      experience: provider.experience,
      availability: provider.availability,
      citizenshipImage: provider.citizenshipImage,
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
      skill: '',
      experience: 0,
      availability: true,
      citizenshipImage: '',
    });
    setError(null);
  };

  const handleSave = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.skill || !formData.citizenshipImage) {
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
        setProviders([...providers, response.data]);
      }

      setShowModal(false);
      setError(null);
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
      } catch (err) {
        console.error('Error deleting provider:', err);
        setError('Failed to delete provider');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Service Provider Management" subtitle="Manage all service providers" user={user} />

        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Add Provider Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Provider
            </button>
          </div>

          {/* Providers Table */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No providers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-slate-800/50 border border-slate-700/50 rounded-lg shadow">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Skill</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Experience</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Availability</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => (
                    <tr key={provider._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 text-sm text-slate-100">
                        {provider.firstName} {provider.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-100">{provider.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-100">{provider.phone}</td>
                      <td className="px-6 py-4 text-sm text-slate-100">{provider.skill}</td>
                      <td className="px-6 py-4 text-sm text-slate-100">{provider.experience} years</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            provider.availability
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-700/50 text-slate-300'
                          }`}
                        >
                          {provider.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEdit(provider)}
                            className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(provider._id, `${provider.firstName} ${provider.lastName}`)}
                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-700/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-slate-100">
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
            <div className="p-6 space-y-4">
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
                  Citizenship Image URL *
                </label>
                <input
                  type="url"
                  name="citizenshipImage"
                  value={formData.citizenshipImage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
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
            <div className="flex gap-3 p-6 border-t border-slate-700/50 bg-slate-700/20">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-700/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
              >
                <Save className="w-4 h-4" />
                Save Provider
              </button>
            </div>
          </div>
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
