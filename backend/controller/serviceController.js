import asyncHandler from '../middleware/asyncHandler.js';
import Service from '../models/serviceModel.js';
import { parseBooleanField, parseNumberField, resolveUploadedImage } from '../utils/uploadUtils.js';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (service) {
    res.json(service);
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
});

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
const createService = asyncHandler(async (req, res) => {
  const { serviceName, category, description, price, duration, rating, isAvailable } = req.body;
  const image = resolveUploadedImage(req, 'image');

  if (!image) {
    return res.status(400).json({ message: 'Service image is required' });
  }
  if (!serviceName?.trim() || !category?.trim() || !description?.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ message: 'Provide a name, category, description, and non-negative price' });
  }

  const service = await Service.create({
    serviceName,
    category,
    description,
    price: parseNumberField(price),
    duration,
    image,
    rating: parseNumberField(rating, 4.5),
    isAvailable: parseBooleanField(isAvailable, true)
  });

  if (service) {
    res.status(201).json(service);
  } else {
    res.status(400).json({ message: 'Invalid service data' });
  }
});

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  service.serviceName = req.body.serviceName || service.serviceName;
  service.category = req.body.category || service.category;
  service.description = req.body.description || service.description;
  service.price = req.body.price !== undefined ? parseNumberField(req.body.price, service.price) : service.price;
  service.duration = req.body.duration || service.duration;
  service.image = resolveUploadedImage(req, 'image', service.image);
  service.rating = req.body.rating !== undefined ? parseNumberField(req.body.rating, service.rating) : service.rating;
  service.isAvailable = req.body.isAvailable !== undefined ? parseBooleanField(req.body.isAvailable, service.isAvailable) : service.isAvailable;

  const updatedService = await service.save();

  res.json(updatedService);
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);

  if (service) {
    res.json({ message: 'Service deleted successfully' });
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
});

export { getServices, getServiceById, createService, updateService, deleteService };
