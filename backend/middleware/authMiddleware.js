import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/userModel.js';
import ServiceProvider from '../models/serviceProviderModel.js';

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read JWT from the 'jwt' cookie
  token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// User must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

const protectProvider = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.provider = await ServiceProvider.findById(decoded.userId).select('-password');

      if (!req.provider) {
        res.status(401);
        throw new Error('Not authorized, provider not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Accept either account type and record the authenticated actor. This is used
// for resources (such as bookings) that are shared by customers and providers.
const protectAny = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (user) {
      req.user = user;
      req.actor = { id: String(user._id), role: user.isAdmin ? 'admin' : 'user' };
      return next();
    }

    const provider = await ServiceProvider.findById(decoded.userId).select('-password');
    if (provider) {
      req.provider = provider;
      req.actor = { id: String(provider._id), role: 'provider' };
      return next();
    }

    res.status(401);
    throw new Error('Not authorized, account not found');
  } catch (error) {
    if (error.statusCode) throw error;
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

export { protect, admin, protectProvider, protectAny };
