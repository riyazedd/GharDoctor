import express from 'express';
const router = express.Router();
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controller/serviceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin routes
router.post('/', protect, admin, createService);
router.put('/:id', protect, admin, updateService);
router.delete('/:id', protect, admin, deleteService);

export default router;
