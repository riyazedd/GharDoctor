import asyncHandler from "../middleware/asyncHandler.js";
import ServiceProvider from "../models/serviceProviderModel.js";
import generateToken from "../utils/generateToken.js";
import { parseBooleanField, parseNumberField, resolveUploadedImage } from '../utils/uploadUtils.js';
import { verifyCitizenshipImage, resolveUploadedFilePath } from '../utils/ocrService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const privateUploadDir = path.join(__dirname, '..', 'private-uploads');

const normalizeCitizenshipNumber = (value) => String(value || '')
  .replace(/[^a-zA-Z0-9]/g, '')
  .toUpperCase();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isStrongPassword = (password) => typeof password === 'string'
  && password.length >= 8 && password.length <= 128 && /[A-Za-z]/.test(password) && /\d/.test(password);
const isValidProviderInput = ({ email, password, phone, experience }) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')
  && isStrongPassword(password) && /^[0-9+\-()\s]{7,20}$/.test(phone || '')
  && Number.isFinite(Number(experience)) && Number(experience) >= 0 && Number(experience) <= 80;

const toPublicProvider = (provider) => ({
  _id: provider._id,
  firstName: provider.firstName,
  lastName: provider.lastName,
  skill: provider.skill,
  experience: provider.experience,
  availability: provider.availability,
  rating: provider.rating,
  reviews: provider.reviews,
  completedJobs: provider.completedJobs,
  avatar: provider.avatar,
  isVerified: provider.isVerified,
});

// @desc    Get all service providers
// @route   GET /api/service-providers
// @access  Public
export const getServiceProviders = asyncHandler(async (req, res) => {
  const providers = await ServiceProvider.find({}).select('firstName lastName skill experience availability rating reviews completedJobs avatar isVerified');
  // Debug log
  // console.log('All providers in DB:', providers.map(p => ({ name: `${p.firstName} ${p.lastName}`, skill: p.skill, availability: p.availability })));
  res.status(200).json(providers.map(toPublicProvider));
});

export const getAdminServiceProviders = asyncHandler(async (req, res) => {
  const providers = await ServiceProvider.find({}).select('-password');
  res.status(200).json(providers);
});

// @desc    Get service provider by ID
// @route   GET /api/service-providers/:id
// @access  Public
export const getServiceProviderById = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findById(req.params.id).select('firstName lastName skill experience availability rating reviews completedJobs avatar isVerified');
  
  if (!provider) {
    return res.status(404).json({ message: 'Service provider not found' });
  }
  
  res.status(200).json(toPublicProvider(provider));
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
    isVerified: true,
  }).select('firstName lastName skill experience availability rating reviews completedJobs avatar isVerified');
  
  res.status(200).json(providers.map(toPublicProvider));
});

export const getPrivateDocument = asyncHandler(async (req, res) => {
  const filename = path.basename(req.params.filename);
  const provider = await ServiceProvider.findOne({ citizenshipImage: { $regex: `${escapeRegex(filename)}$` } }).select('_id citizenshipImage');
  if (!provider) return res.status(404).json({ message: 'Document not found' });
  if (req.actor.role !== 'admin' && (req.actor.role !== 'provider' || String(provider._id) !== req.actor.id)) {
    return res.status(403).json({ message: 'You are not allowed to view this document' });
  }
  return res.sendFile(filename, { root: privateUploadDir }, (error) => {
    if (error && !res.headersSent) res.status(404).json({ message: 'Document file not found' });
  });
});

// @desc    Create a new service provider (admin only)
// @route   POST /api/service-providers
// @access  Private/Admin
export const createServiceProvider = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, skill, experience, citizenshipNumber } = req.body;
  const citizenshipImage = resolveUploadedImage(req, 'citizenshipImage');
  const avatar = resolveUploadedImage(req, 'avatar');

  if (!isValidProviderInput({ email, password, phone, experience })) {
    return res.status(400).json({ message: 'Provide a valid email, phone, experience, and strong password' });
  }

  if (!citizenshipImage || !citizenshipNumber?.trim()) {
    return res.status(400).json({ message: 'Citizenship number and image are required' });
  }
  
  // Check if provider already exists
  const existingProvider = await ServiceProvider.findOne({ email });
  if (existingProvider) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const existingCitizenship = await ServiceProvider.findOne({
    citizenshipNumber: normalizeCitizenshipNumber(citizenshipNumber),
  });
  if (existingCitizenship) {
    return res.status(400).json({ message: 'Citizenship number is already registered' });
  }

  // Run OCR on the uploaded citizenship image, matching name and citizenship number.
  const citizenshipFilePath = resolveUploadedFilePath(req.files, 'citizenshipImage');
  if (!citizenshipFilePath) return res.status(400).json({ message: 'A citizenship image file is required' });
  const ocrResult = await verifyCitizenshipImage(citizenshipFilePath, { firstName, lastName, citizenshipNumber });
  console.log('[OCR] Admin create — verified:', ocrResult.verified, '| keyword:', ocrResult.keywordMatch, '| nameMatch:', ocrResult.nameMatch, '|', ocrResult.reason);
  
  const provider = new ServiceProvider({
    firstName,
    lastName,
    email,
    password,
    phone,
    skill,
    experience: parseNumberField(experience),
    citizenshipImage,
    citizenshipNumber: normalizeCitizenshipNumber(citizenshipNumber),
    ...(avatar ? { avatar } : {}),
    availability: true,
    isVerified: true, // Admin-created providers are trusted as verified
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
      citizenshipImage: provider.citizenshipImage,
      citizenshipNumber: provider.citizenshipNumber,
      avatar: provider.avatar,
      isVerified: provider.isVerified,
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
  
  const { firstName, lastName, phone, skill, experience, availability, citizenshipNumber } = req.body;
  const citizenshipImage = resolveUploadedImage(req, 'citizenshipImage', provider.citizenshipImage);
  const avatar = resolveUploadedImage(req, 'avatar', provider.avatar);
  
  provider.firstName = firstName || provider.firstName;
  provider.lastName = lastName || provider.lastName;
  provider.phone = phone || provider.phone;
  provider.skill = skill || provider.skill;
  provider.experience = experience !== undefined ? parseNumberField(experience, provider.experience) : provider.experience;
  provider.availability = availability !== undefined ? parseBooleanField(availability, provider.availability) : provider.availability;
  provider.citizenshipImage = citizenshipImage || provider.citizenshipImage;
  provider.citizenshipNumber = citizenshipNumber?.trim()
    ? normalizeCitizenshipNumber(citizenshipNumber)
    : provider.citizenshipNumber;
  provider.avatar = avatar || provider.avatar;
  
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
      citizenshipImage: provider.citizenshipImage,
      citizenshipNumber: provider.citizenshipNumber,
      avatar: provider.avatar,
    },
  });
});

// @desc    Update current service provider profile
// @route   PUT /api/service-providers/profile
// @access  Private/Provider
export const updateCurrentServiceProvider = asyncHandler(async (req, res) => {
  let provider = await ServiceProvider.findById(req.provider._id);
  
  if (!provider) {
    return res.status(404).json({ message: 'Service provider not found' });
  }
  
  const { firstName, lastName, phone, skill, experience, availability, citizenshipNumber } = req.body;
  const citizenshipImage = resolveUploadedImage(req, 'citizenshipImage', provider.citizenshipImage);
  const avatar = resolveUploadedImage(req, 'avatar', provider.avatar);
  
  provider.firstName = firstName || provider.firstName;
  provider.lastName = lastName || provider.lastName;
  provider.phone = phone || provider.phone;
  provider.skill = skill || provider.skill;
  provider.experience = experience !== undefined ? parseNumberField(experience, provider.experience) : provider.experience;
  provider.availability = availability !== undefined ? parseBooleanField(availability, provider.availability) : provider.availability;
  provider.citizenshipImage = citizenshipImage || provider.citizenshipImage;
  provider.citizenshipNumber = citizenshipNumber?.trim()
    ? normalizeCitizenshipNumber(citizenshipNumber)
    : provider.citizenshipNumber;
  provider.avatar = avatar || provider.avatar;
  
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
      citizenshipImage: provider.citizenshipImage,
      citizenshipNumber: provider.citizenshipNumber,
      avatar: provider.avatar,
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
    const { firstName, lastName, email, password, phone, skill, experience, availability, citizenshipNumber } = req.body;
    const citizenshipImage = resolveUploadedImage(req, 'citizenshipImage');
    const avatar = resolveUploadedImage(req, 'avatar');

    if (!isValidProviderInput({ email, password, phone, experience })) {
      return res.status(400).json({ message: 'Provide a valid email, phone, experience, and strong password' });
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !skill || !citizenshipNumber?.trim() || !citizenshipImage) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if provider already exists
    const existingProvider = await ServiceProvider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingCitizenship = await ServiceProvider.findOne({
      citizenshipNumber: normalizeCitizenshipNumber(citizenshipNumber),
    });
    if (existingCitizenship) {
      return res.status(400).json({ message: 'Citizenship number is already registered' });
    }

    // --- OCR Verification (Option B: soft-flag) ---
    // Run OCR and compare citizenship-card keywords, name, and citizenship number.
    // If any check fails, the account is created but marked isVerified=false
    // so an admin can review it manually.
    const citizenshipFilePath = resolveUploadedFilePath(req.files, 'citizenshipImage');
    if (!citizenshipFilePath) return res.status(400).json({ message: 'A citizenship image file is required' });
    const ocrResult = await verifyCitizenshipImage(citizenshipFilePath, { firstName, lastName, citizenshipNumber });
    const isVerified = ocrResult.verified;
    console.log(
      '[OCR] Self-register — verified:', isVerified,
      '| keyword:', ocrResult.keywordMatch,
      '| nameMatch:', ocrResult.nameMatch,
      '|', ocrResult.reason
    );

    const provider = new ServiceProvider({
      firstName,
      lastName,
      email,
      password,
      phone,
      skill,
      experience: parseNumberField(experience),
      citizenshipImage,
      citizenshipNumber: normalizeCitizenshipNumber(citizenshipNumber),
      ...(avatar ? { avatar } : {}),
      availability: availability !== undefined ? parseBooleanField(availability, true) : true,
      isVerified,
    });

    await provider.save();

    // Generate token
    generateToken(res, provider._id);

    // Build a human-friendly OCR message for the frontend
    let ocrMessage;
    if (isVerified) {
      ocrMessage = 'Your citizenship card was verified successfully; your name and citizenship number match the document.';
    } else if (!ocrResult.citizenshipNumberMatch) {
      ocrMessage = 'Your citizenship number could not be confirmed on the uploaded card. Your account has been created and will be reviewed by an admin.';
    } else if (!ocrResult.keywordMatch) {
      ocrMessage = 'The uploaded image does not appear to be a Nepali Citizenship Certificate. Your account has been created and will be reviewed by an admin.';
    } else if (!ocrResult.nameMatch) {
      ocrMessage = `Your name "${firstName} ${lastName}" could not be confirmed on the uploaded citizenship card. ${ocrResult.nameMatchDetail} Your account has been created and will be reviewed by an admin.`;
    } else {
      ocrMessage = 'Citizenship card could not be automatically verified. Your account has been created and will be reviewed by an admin.';
    }

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
      avatar: provider.avatar,
      isProvider: true,
      isVerified: provider.isVerified,
      ocrVerification: {
        verified: isVerified,
        keywordMatch: ocrResult.keywordMatch,
        nameMatch: ocrResult.nameMatch,
        citizenshipNumberMatch: ocrResult.citizenshipNumberMatch,
        message: ocrMessage,
      },
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
    generateToken(res, provider._id);

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
      avatar: provider.avatar,
      isServiceProvider: provider.isServiceProvider,
      isVerified: provider.isVerified,
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

// @desc    Toggle provider verification status (admin manually approves/revokes)
// @route   PATCH /api/service-providers/:id/verify
// @access  Private/Admin
export const toggleProviderVerification = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findById(req.params.id);

  if (!provider) {
    return res.status(404).json({ message: 'Service provider not found' });
  }

  provider.isVerified = !provider.isVerified;
  await provider.save();

  res.status(200).json({
    message: `Provider verification status updated to ${provider.isVerified ? 'Verified' : 'Unverified'}`,
    provider: {
      _id: provider._id,
      firstName: provider.firstName,
      lastName: provider.lastName,
      isVerified: provider.isVerified,
    },
  });
});

// @desc    Reject a provider's submitted identity document and notify them
// @route   PATCH /api/service-providers/:id/reject
// @access  Private/Admin
export const rejectProviderVerification = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findById(req.params.id);
  if (!provider) return res.status(404).json({ message: 'Service provider not found' });

  provider.isVerified = false;
  provider.availability = false;
  provider.verificationNotice = {
    message: 'Your citizenship ID could not be verified and your provider application has been rejected. Please contact support or submit a clear, valid citizenship document for review.',
    createdAt: new Date(),
    isRead: false,
  };
  await provider.save();

  res.status(200).json({
    message: 'Provider rejected and notification sent',
    provider: { _id: provider._id, isVerified: false, availability: false },
  });
});

// @desc    Get and acknowledge the current provider's verification notice
// @route   GET /api/service-providers/profile/verification-notice
// @access  Private/Provider
export const getVerificationNotice = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findById(req.provider._id).select('verificationNotice isVerified');
  if (!provider) return res.status(404).json({ message: 'Service provider not found' });
  const hasUnreadNotice = Boolean(provider.verificationNotice?.message && !provider.verificationNotice.isRead);
  if (hasUnreadNotice) {
    provider.verificationNotice.isRead = true;
    await provider.save();
  }
  res.json({ notice: provider.verificationNotice || null, hasUnreadNotice, isVerified: provider.isVerified });
});

// @desc    Rate a service provider
// @route   POST /api/service-providers/:id/rating
// @access  Private/User
export const rateServiceProvider = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findById(req.params.id);

  if (!provider) {
    return res.status(404).json({ message: 'Service provider not found' });
  }

  const rating = Number(req.body.rating);

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
  }

  const existingReviews = provider.reviews || 0;
  const existingRating = provider.rating || 0;
  const updatedReviews = existingReviews + 1;
  const updatedRating = ((existingRating * existingReviews) + rating) / updatedReviews;

  provider.reviews = updatedReviews;
  provider.rating = Number(updatedRating.toFixed(1));

  await provider.save();

  res.status(200).json({
    message: 'Rating submitted successfully',
    provider: toPublicProvider(provider),
  });
});
