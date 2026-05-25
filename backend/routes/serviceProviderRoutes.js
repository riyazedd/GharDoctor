import express from 'express';
import {
  getServiceProviders,
  getServiceProviderById,
  getProvidersByCategory,
  createServiceProvider,
  updateServiceProvider,
  deleteServiceProvider,
  toggleProviderAvailability,
  registerServiceProvider,
  loginServiceProvider,
} from '../controller/serviceProviderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes - register must come before :id route to avoid route collision
router.post('/register', registerServiceProvider);
router.post('/login', loginServiceProvider);
router.get('/', getServiceProviders);
router.get('/category/:category', getProvidersByCategory);
router.get('/:id', getServiceProviderById);

// Admin routes
router.post('/', protect, admin, createServiceProvider);
router.put('/:id', protect, admin, updateServiceProvider);
router.delete('/:id', protect, admin, deleteServiceProvider);
router.patch('/:id/availability', protect, admin, toggleProviderAvailability);

export default router;
