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
import upload from '../middleware/uploadMiddleware.js';

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin routes
router.post('/', protect, admin, upload.single('image'), createService);
router.put('/:id', protect, admin, upload.single('image'), updateService);
router.delete('/:id', protect, admin, deleteService);

export default router;
