import asyncHandler from "../middleware/asyncHandler.js";
import ServiceProvider from "../models/serviceProviderModel.js";
import generateToken from "../utils/generateToken.js";

// @desc    Get all service providers
// @route   GET /api/service-providers
// @access  Public
export const getServiceProviders = asyncHandler(async (req, res) => {
  const providers = await ServiceProvider.find({}).select('-password');
  // Debug log
  // console.log('All providers in DB:', providers.map(p => ({ name: `${p.firstName} ${p.lastName}`, skill: p.skill, availability: p.availability })));
  res.status(200).json(providers);
});

// @desc    Get service provider by ID
// @route   GET /api/service-providers/:id
// @access  Public
export const getServiceProviderById = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findById(req.params.id).select('-password');
  
  if (!provider) {
    return res.status(404).json({ message: 'Service provider not found' });
  }
  
  res.status(200).json(provider);
});

// @desc    Get service providers by skill/category
// @route   GET /api/service-providers/category/:category
// @access  Public
export const getProvidersByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  // Case-insensitive regex search for skill
  const providers = await ServiceProvider.find({
    skill: { $regex: new RegExp(`^${category}$`, 'i') },
    availability: true,
  }).select('-password');
  
  res.status(200).json(providers);
});

// @desc    Create a new service provider (admin only)
// @route   POST /api/service-providers
// @access  Private/Admin
export const createServiceProvider = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, skill, experience, citizenshipImage } = req.body;
  
  // Check if provider already exists
  const existingProvider = await ServiceProvider.findOne({ email });
  if (existingProvider) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  
  const provider = new ServiceProvider({
    firstName,
    lastName,
    email,
    password,
    phone,
    skill,
    experience: experience || 0,
    citizenshipImage,
    availability: true,
  });
  
  await provider.save();
  
  res.status(201).json({
    message: 'Service provider created successfully',
    provider: {
      _id: provider._id,
      firstName: provider.firstName,
      lastName: provider.lastName,
      email: provider.email,
      phone: provider.phone,
      skill: provider.skill,
      experience: provider.experience,
      availability: provider.availability,
    },
  });
});

// @desc    Update a service provider (admin only)
// @route   PUT /api/service-providers/:id
// @access  Private/Admin
export const updateServiceProvider = asyncHandler(async (req, res) => {
  let provider = await ServiceProvider.findById(req.params.id);
  
  if (!provider) {
    return res.status(404).json({ message: 'Service provider not found' });
  }
  
  const { firstName, lastName, phone, skill, experience, availability, citizenshipImage } = req.body;
  
  provider.firstName = firstName || provider.firstName;
  provider.lastName = lastName || provider.lastName;
  provider.phone = phone || provider.phone;
  provider.skill = skill || provider.skill;
  provider.experience = experience !== undefined ? experience : provider.experience;
  provider.availability = availability !== undefined ? availability : provider.availability;
  provider.citizenshipImage = citizenshipImage || provider.citizenshipImage;
  
  await provider.save();
  
  res.status(200).json({
    message: 'Service provider updated successfully',
    provider: {
      _id: provider._id,
      firstName: provider.firstName,
      lastName: provider.lastName,
      email: provider.email,
      phone: provider.phone,
      skill: provider.skill,
      experience: provider.experience,
      availability: provider.availability,
    },
  });
});

// @desc    Delete a service provider (admin only)
// @route   DELETE /api/service-providers/:id
// @access  Private/Admin
export const deleteServiceProvider = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findByIdAndDelete(req.params.id);
  
  if (!provider) {
    return res.status(404).json({ message: 'Service provider not found' });
  }
  
  res.status(200).json({ message: 'Service provider deleted successfully' });
});

// @desc    Register a new service provider
// @route   POST /api/service-providers/register
// @access  Public
export const registerServiceProvider = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, skill, experience, availability, citizenshipImage } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !skill || !citizenshipImage) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if provider already exists
    const existingProvider = await ServiceProvider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const provider = new ServiceProvider({
      firstName,
      lastName,
      email,
      password,
      phone,
      skill,
      experience: experience || 0,
      citizenshipImage,
      availability: availability !== undefined ? availability : true,
    });

    await provider.save();

    // Generate token
    const token = generateToken(res, provider._id);

    res.status(201).json({
      _id: provider._id,
      firstName: provider.firstName,
      lastName: provider.lastName,
      email: provider.email,
      phone: provider.phone,
      skill: provider.skill,
      experience: provider.experience,
      availability: provider.availability,
      rating: provider.rating,
      reviews: provider.reviews,
      completedJobs: provider.completedJobs,
      isProvider: true,
      token,
    });
  } catch (error) {
    console.error('Provider registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

// @desc    Login service provider & get token
// @route   POST /api/service-providers/login
// @access  Public
export const loginServiceProvider = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const provider = await ServiceProvider.findOne({ email });

  if (provider && (await provider.matchPassword(password))) {
    const token = generateToken(res, provider._id);

    res.json({
      _id: provider._id,
      firstName: provider.firstName,
      lastName: provider.lastName,
      email: provider.email,
      phone: provider.phone,
      skill: provider.skill,
      experience: provider.experience,
      availability: provider.availability,
      rating: provider.rating,
      reviews: provider.reviews,
      completedJobs: provider.completedJobs,
      isServiceProvider: provider.isServiceProvider,
      token: token,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Toggle provider availability
// @route   PATCH /api/service-providers/:id/availability
// @access  Private/Admin
export const toggleProviderAvailability = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findById(req.params.id);
  
  if (!provider) {
    return res.status(404).json({ message: 'Service provider not found' });
  }
  
  provider.availability = !provider.availability;
  await provider.save();
  
  res.status(200).json({
    message: `Provider availability updated to ${provider.availability}`,
    provider: {
      _id: provider._id,
      firstName: provider.firstName,
      lastName: provider.lastName,
      availability: provider.availability,
    },
  });
});
