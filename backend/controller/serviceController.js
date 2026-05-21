import asyncHandler from '../middleware/asyncHandler.js';
import Service from '../models/serviceModel.js';

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
  const { serviceName, category, description, price, duration, image, rating, isAvailable } = req.body;

  const service = await Service.create({
    serviceName,
    category,
    description,
    price,
    duration,
    image,
    rating: rating || 4.5,
    isAvailable: isAvailable !== undefined ? isAvailable : true
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
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (service) {
    res.json(service);
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
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
