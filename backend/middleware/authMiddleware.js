import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/userModel.js';

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read JWT from the 'token' cookie
  token = req.cookies.token;
  
  console.log('Protect middleware - Token from cookie:', !!token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified, userId:', decoded.userId);

      req.user = await User.findById(decoded.userId).select('-password');
      
      if (!req.user) {
        console.error('User not found in database for userId:', decoded.userId);
        res.status(401);
        throw new Error('User not found');
      }
      
      console.log('User loaded:', req.user.email, 'isAdmin:', req.user.isAdmin);

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
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
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    console.error('Admin check failed:', {
      hasUser: !!req.user,
      isAdmin: req.user?.isAdmin,
      userId: req.user?._id,
      email: req.user?.email
    });
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin };
