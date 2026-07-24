import express from 'express';
import {
  getServiceProviders,
  getServiceProviderById,
  getProvidersByCategory,
  createServiceProvider,
  updateServiceProvider,
  updateCurrentServiceProvider,
  deleteServiceProvider,
  toggleProviderAvailability,
  registerServiceProvider,
  loginServiceProvider,
} from '../controller/serviceProviderController.js';
import { protect, admin, protectProvider } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes - register must come before :id route to avoid route collision
router.post('/register', upload.fields([
  { name: 'citizenshipImage', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
]), registerServiceProvider);
router.post('/login', loginServiceProvider);
router.get('/', getServiceProviders);
router.get('/category/:category', getProvidersByCategory);
router.route('/profile').put(protectProvider, upload.fields([
  { name: 'citizenshipImage', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
]), updateCurrentServiceProvider);
router.get('/:id', getServiceProviderById);

// Admin routes
router.post('/', protect, admin, upload.fields([
  { name: 'citizenshipImage', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
]), createServiceProvider);
router.put('/:id', protect, admin, upload.fields([
  { name: 'citizenshipImage', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
]), updateServiceProvider);
router.delete('/:id', protect, admin, deleteServiceProvider);
router.patch('/:id/availability', protect, admin, toggleProviderAvailability);

export default router;
