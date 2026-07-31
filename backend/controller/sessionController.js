import jwt from 'jsonwebtoken';
import ServiceProvider from '../models/serviceProviderModel.js';
import User from '../models/userModel.js';

// @desc    Return the role associated with the current HTTP-only auth cookie
// @route   GET /api/session
// @access  Private
const getCurrentSession = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No active session' });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId).select('isAdmin');

    if (user) {
      return res.json({ role: user.isAdmin ? 'admin' : 'user' });
    }

    const provider = await ServiceProvider.findById(userId).select('isServiceProvider');
    if (provider?.isServiceProvider) {
      return res.json({ role: 'provider' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  return res.status(401).json({ message: 'Session account not found' });
};

export { getCurrentSession };
