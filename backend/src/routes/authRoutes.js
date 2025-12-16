import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../controllers/authController.js';
import User from '../models/User.js';
import { authenticate } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { registerValidator, loginValidator, refreshTokenValidator } from '../utils/validators.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerValidator), register);
router.post('/login', authLimiter, validate(loginValidator), login);
router.post('/refresh-token', validate(refreshTokenValidator), refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);
router.post('/profile/picture', authenticate, upload.single('profilePicture'), uploadProfilePicture);
router.post('/set-password', authenticate, async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Set the new password (will be hashed by the model pre-save hook)
    user.password = password;
    await user.save();
    
    res.status(200).json({ success: true, message: 'Password set successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
