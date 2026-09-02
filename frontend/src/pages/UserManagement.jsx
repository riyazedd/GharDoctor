import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X, Save, Search } from 'lucide-react';
import { userAPI } from '../API';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import ImageWithFallback from '../components/ImageWithFallback';
import { AdminLayoutProvider, useAdminLayout } from '../context/AdminLayoutContext';
import { useToast } from '../context/ToastContext';

function UserManagementContent() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    profileImg: '',
    isAdmin: false,
  });

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, toast]);

  useEffect(() => {
    fetchUsers();
    
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      address: user.address || '',
      profileImg: user.profileImg || '',
      isAdmin: user.isAdmin || false,
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAdd = () => {
    setCurrentUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      profileImg: '',
      isAdmin: false,
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
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

  const handleSave = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please fill in all required fields');
        return;
      }

      if (modalMode === 'add' && !formData.password) {
        setError('Password is required for new users');
        return;
      }

      if (modalMode === 'edit') {
        // Don't send password if it's empty for edits
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userAPI.updateUser(currentUser._id, updateData);
        setUsers(
          users.map((user) =>
            user._id === currentUser._id ? { ...user, ...updateData } : user
          )
        );
      } else {
        const response = await userAPI.createUser(formData);
        setUsers([...users, response.data]);
      }

      setShowModal(false);
      setError(null);
      toast.success(`User ${modalMode === 'edit' ? 'updated' : 'created'} successfully`);
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await userAPI.deleteUser(userId);
        setUsers(users.filter((user) => user._id !== userId));
        setError(null);
        toast.success('User deleted successfully');
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      profileImg: '',
      isAdmin: false,
    });
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="User Management" subtitle="Manage system users and permissions" user={user} />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="mb-4 sm:mb-6 relative">
              <Search className="absolute left-3 top-2.5 sm:top-3 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Add User Button */}
            <div className="mb-4 sm:mb-6 flex justify-end">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-cyan-700 transition"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm sm:text-base">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm sm:text-base">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-slate-800/50 border border-slate-700/50 rounded-lg shadow">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="hidden sm:table-cell px-6 py-3 text-left font-semibold text-slate-300">Profile</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-slate-300">Name</th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left font-semibold text-slate-300">Email</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left font-semibold text-slate-300">Phone</th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left font-semibold text-slate-300">Address</th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left font-semibold text-slate-300">Admin</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                        <td className="hidden sm:table-cell px-6 py-4">
                          <ImageWithFallback
                            src={user.profileImg}
                            alt={`${user.firstName} ${user.lastName} profile`}
                            fallback={user.firstName?.[0] || 'U'}
                            className="w-10 h-10 rounded-full"
                          />
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-100">
                          <div className="font-semibold text-slate-100 truncate">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-slate-400 sm:hidden">{user.email}</div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 text-slate-100 truncate">{user.email}</td>
                        <td className="hidden md:table-cell px-6 py-4 text-slate-100">{user.phone || '-'}</td>
                        <td className="hidden lg:table-cell px-6 py-4 text-slate-100 truncate">{user.address || '-'}</td>
                        <td className="hidden sm:table-cell px-6 py-4">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isAdmin
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-slate-700/50 text-slate-300'
                            }`}
                          >
                            {user.isAdmin ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center">
                          <div className="flex items-center justify-center gap-2 sm:gap-3">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1.5 sm:p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)}
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
          <div className="admin-management-modal bg-white rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                {modalMode === 'edit' ? 'Edit User' : 'Add New User'}
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
                  Phone
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
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Profile Image
                </label>
                {typeof formData.profileImg === 'string' && formData.profileImg && (
                  <div className="mb-2">
                    <ImageWithFallback
                      src={formData.profileImg}
                      alt={`${formData.firstName || 'User'} profile preview`}
                      fallback={formData.firstName?.[0] || 'U'}
                      className="w-20 h-20 rounded-full"
                    />
                  </div>
                )}
                <input
                  type="file"
                  name="profileImg"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-white"
                />
                <p className="mt-1 text-xs text-slate-400">
                  {typeof formData.profileImg === 'string' && formData.profileImg
                    ? 'Current image will stay unless you choose a new file.'
                    : formData.profileImg?.name || 'Choose an image file to upload.'}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-cyan-600 border-slate-600/50 rounded focus:ring-2 focus:ring-cyan-500 bg-slate-700/50"
                />
                <label htmlFor="isAdmin" className="text-sm font-medium text-slate-300">
                  Make this user an admin
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
                <span className="hidden sm:inline">Save User</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserManagement() {
  return (
    <AdminLayoutProvider>
      <UserManagementContent />
    </AdminLayoutProvider>
  );
}
