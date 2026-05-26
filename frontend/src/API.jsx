import axios from "axios";

// Create axios instance with base configuration
const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // Send cookies with every request
});

// ==================== AUTH ENDPOINTS ====================
export const authAPI = {
  // User/Admin login
  loginUser: (email, password) =>
    API.post("/api/users/login", { email, password }),

  // Service provider login
  loginProvider: (email, password) =>
    API.post("/api/service-providers/login", { email, password }),

  // User registration
  registerUser: (userData) =>
    API.post("/api/users", userData),

  // Provider registration
  registerProvider: (providerData) =>
    API.post("/api/service-providers/register", providerData),
};

// ==================== USER ENDPOINTS ====================
export const userAPI = {
  // Get all users (admin only)
  getAllUsers: () =>
    API.get("/api/users"),

  // Get single user by ID
  getUserById: (id) =>
    API.get(`/api/users/${id}`),

  // Create new user (admin only)
  createUser: (userData) =>
    API.post("/api/users", userData),

  // Update user profile
  updateUser: (id, userData) =>
    API.put(`/api/users/${id}`, userData),

  // Delete user (admin only)
  deleteUser: (id) =>
    API.delete(`/api/users/${id}`),
};

// ==================== SERVICE PROVIDER ENDPOINTS ====================
export const providerAPI = {
  // Get all providers
  getAllProviders: () =>
    API.get("/api/service-providers"),

  // Get single provider by ID
  getProviderById: (id) =>
    API.get(`/api/service-providers/${id}`),

  // Create new provider (admin only)
  createProvider: (providerData) =>
    API.post("/api/service-providers", providerData),

  // Update provider profile
  updateProvider: (id, providerData) =>
    API.put(`/api/service-providers/${id}`, providerData),

  // Delete provider (admin only)
  deleteProvider: (id) =>
    API.delete(`/api/service-providers/${id}`),
};

// ==================== SERVICE ENDPOINTS ====================
export const serviceAPI = {
  // Get all services
  getAllServices: () =>
    API.get("/api/services"),

  // Get single service by ID
  getServiceById: (id) =>
    API.get(`/api/services/${id}`),

  // Create new service (admin only)
  createService: (serviceData) =>
    API.post("/api/services", serviceData),

  // Update service
  updateService: (id, serviceData) =>
    API.put(`/api/services/${id}`, serviceData),

  // Delete service (admin only)
  deleteService: (id) =>
    API.delete(`/api/services/${id}`),
};

// ==================== CATEGORY ENDPOINTS ====================
export const categoryAPI = {
  // Get all categories
  getAllCategories: () =>
    API.get("/api/categories"),

  // Get single category by ID
  getCategoryById: (id) =>
    API.get(`/api/categories/${id}`),

  // Create new category (admin only)
  createCategory: (categoryData) =>
    API.post("/api/categories", categoryData),

  // Update category
  updateCategory: (id, categoryData) =>
    API.put(`/api/categories/${id}`, categoryData),

  // Delete category (admin only)
  deleteCategory: (id) =>
    API.delete(`/api/categories/${id}`),
};

// ==================== BOOKING ENDPOINTS ====================
export const bookingAPI = {
  // Get all bookings (admin only)
  getAllBookings: () =>
    API.get("/api/bookings"),

  // Get bookings for a user
  getUserBookings: (userId) =>
    API.get(`/api/bookings/user/${userId}`),

  // Get bookings for a provider
  getProviderBookings: (providerId) =>
    API.get(`/api/bookings/provider/${providerId}`),

  // Create new booking
  createBooking: (bookingData) =>
    API.post("/api/bookings", bookingData),

  // Update booking status
  updateBooking: (id, bookingData) =>
    API.put(`/api/bookings/${id}`, bookingData),

  // Cancel booking
  cancelBooking: (id) =>
    API.delete(`/api/bookings/${id}`),
};

export default API;
