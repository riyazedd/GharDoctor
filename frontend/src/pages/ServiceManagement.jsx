import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { serviceAPI } from '../API';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { AdminLayoutProvider, useAdminLayout } from '../context/AdminLayoutContext';

function ServiceManagementContent() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentService, setCurrentService] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: '',
    price: '',
    image: '',
    isAvailable: true,
    rating: 4.5,
    duration: '2-3 hours',
  });

  useEffect(() => {
    fetchServices();
    
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getAllServices();
      setServices(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      service.serviceName?.toLowerCase().includes(searchLower) ||
      service.description?.toLowerCase().includes(searchLower) ||
      service.category?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (service) => {
    setCurrentService(service);
    setFormData({
      serviceName: service.serviceName || '',
      description: service.description || '',
      category: service.category || '',
      price: service.price || '',
      image: service.image || '',
      isAvailable: service.isAvailable ?? true,
      rating: service.rating || 4.5,
      duration: service.duration || '2-3 hours',
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAdd = () => {
    setCurrentService(null);
    setFormData({
      serviceName: '',
      description: '',
      category: '',
      price: '',
      image: '',
      isAvailable: true,
      rating: 4.5,
      duration: '2-3 hours',
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.serviceName || !formData.description || !formData.category || !formData.price || !formData.image) {
        setError('Please fill in all required fields');
        return;
      }

      if (modalMode === 'edit') {
        await serviceAPI.updateService(currentService._id, formData);
        setServices(
          services.map((service) =>
            service._id === currentService._id ? { ...service, ...formData } : service
          )
        );
      } else {
        const response = await serviceAPI.createService(formData);
        setServices([...services, response.data]);
      }

      setShowModal(false);
      setError(null);
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.response?.data?.message || 'Failed to save service');
    }
  };

  const handleDelete = async (serviceId, serviceName) => {
    if (window.confirm(`Are you sure you want to delete ${serviceName}?`)) {
      try {
        await serviceAPI.deleteService(serviceId);
        setServices(services.filter((service) => service._id !== serviceId));
        setError(null);
      } catch (err) {
        console.error('Error deleting service:', err);
        setError('Failed to delete service');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentService(null);
    setFormData({
      serviceName: '',
      description: '',
      category: '',
      price: '',
      image: '',
      isAvailable: true,
      rating: 4.5,
      duration: '2-3 hours',
    });
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Service Management" subtitle="Manage all available services" user={user} />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-4 sm:mb-6 relative">
              <Search className="absolute left-3 top-2.5 sm:top-3 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by service name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Add Service Button */}
            <div className="mb-4 sm:mb-6 flex justify-end">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-cyan-700 transition"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Service</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Services Table */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm sm:text-base">Loading services...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm sm:text-base">No services found</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-slate-800/50 border border-slate-700/50 rounded-lg shadow">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-slate-300">Service Name</th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left font-semibold text-slate-300">Category</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left font-semibold text-slate-300">Price</th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left font-semibold text-slate-300">Duration</th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left font-semibold text-slate-300">Rating</th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left font-semibold text-slate-300">Available</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((service) => (
                      <tr key={service._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-100">
                          <div className="font-semibold text-slate-100 truncate">
                            {service.serviceName}
                          </div>
                          <div className="text-xs text-slate-400 sm:hidden">{service.category}</div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 text-slate-100">{service.category}</td>
                        <td className="hidden md:table-cell px-6 py-4 text-slate-100">Rs. {service.price}</td>
                        <td className="hidden lg:table-cell px-6 py-4 text-slate-100">{service.duration}</td>
                        <td className="hidden lg:table-cell px-6 py-4 text-slate-100">
                          <div className="flex items-center gap-1">
                            <span>★</span>
                            <span>{service.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                              service.isAvailable
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-slate-700/50 text-slate-300'
                            }`}
                          >
                            {service.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center">
                          <div className="flex items-center justify-center gap-2 sm:gap-3">
                            <button
                              onClick={() => handleEdit(service)}
                              className="p-1.5 sm:p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(service._id, service.serviceName)}
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                {modalMode === 'edit' ? 'Edit Service' : 'Add New Service'}
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
                  Service Name *
                </label>
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Cleaning, Plumbing, Electrical"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2-3 hours"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Rating
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-end">
                  <div className="flex items-center gap-3 w-full">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-cyan-600 border-slate-600/50 rounded focus:ring-2 focus:ring-cyan-500 bg-slate-700/50"
                    />
                    <label htmlFor="isAvailable" className="text-sm font-medium text-slate-300">
                      Available
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
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
                <span className="hidden sm:inline">Save Service</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServiceManagement() {
  return (
    <AdminLayoutProvider>
      <ServiceManagementContent />
    </AdminLayoutProvider>
  );
}
