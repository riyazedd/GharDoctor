import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { categoryAPI } from '../API';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { AdminLayoutProvider, useAdminLayout } from '../context/AdminLayoutContext';

function CategoryManagementContent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    icon: '',
    description: '',
    color: '',
  });

  useEffect(() => {
    fetchCategories();
    
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAllCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      category.categoryName?.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower) ||
      category.icon?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      categoryName: category.categoryName || '',
      icon: category.icon || '',
      description: category.description || '',
      color: category.color || '',
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAdd = () => {
    setCurrentCategory(null);
    setFormData({
      categoryName: '',
      icon: '',
      description: '',
      color: '',
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.categoryName || !formData.icon || !formData.description || !formData.color) {
        setError('Please fill in all required fields');
        return;
      }

      if (modalMode === 'edit') {
        await categoryAPI.updateCategory(currentCategory._id, formData);
        setCategories(
          categories.map((category) =>
            category._id === currentCategory._id ? { ...category, ...formData } : category
          )
        );
      } else {
        const response = await categoryAPI.createCategory(formData);
        setCategories([...categories, response.data]);
      }

      setShowModal(false);
      setError(null);
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete ${categoryName}?`)) {
      try {
        await categoryAPI.deleteCategory(categoryId);
        setCategories(categories.filter((category) => category._id !== categoryId));
        setError(null);
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
    setFormData({
      categoryName: '',
      icon: '',
      description: '',
      color: '',
    });
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Category Management" subtitle="Manage service categories" user={user} />

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
                placeholder="Search by category name, icon, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Add Category Button */}
            <div className="mb-4 sm:mb-6 flex justify-end">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-cyan-700 transition"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Category</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Categories Table */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm sm:text-base">Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm sm:text-base">No categories found</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-slate-800/50 border border-slate-700/50 rounded-lg shadow">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-semibold text-slate-300">Category Name</th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left font-semibold text-slate-300">Icon</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left font-semibold text-slate-300">Description</th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left font-semibold text-slate-300">Color</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-100">
                          <div className="font-semibold text-slate-100 truncate">
                            {category.categoryName}
                          </div>
                          <div className="text-xs text-slate-400 sm:hidden">{category.icon}</div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 text-slate-100">{category.icon}</td>
                        <td className="hidden md:table-cell px-6 py-4 text-slate-100 truncate">{category.description}</td>
                        <td className="hidden lg:table-cell px-6 py-4 text-slate-100 text-xs">{category.color}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center">
                          <div className="flex items-center justify-center gap-2 sm:gap-3">
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-1.5 sm:p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category._id, category.categoryName)}
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
                {modalMode === 'edit' ? 'Edit Category' : 'Add New Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  placeholder="e.g., Cleaning, Plumbing"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Icon (Lucide React icon name) *
                </label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="e.g., Sparkles, Droplet, Zap, Paintbrush"
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
                  placeholder="Brief description of this category"
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Gradient Color (Tailwind classes) *
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., from-cyan-500 to-blue-600"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Format: from-[color1]-[number] to-[color2]-[number]
                </p>
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
                <span className="hidden sm:inline">Save Category</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoryManagement() {
  return (
    <AdminLayoutProvider>
      <CategoryManagementContent />
    </AdminLayoutProvider>
  );
}
