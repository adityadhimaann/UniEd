import express from 'express';
import passport from '../config/passport.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

const router = express.Router();

// Debug logging
console.log('OAuth routes loaded');

// Google OAuth Routes
router.get(
  '/google',
  (req, res, next) => {
    console.log('Initiating Google OAuth');
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('Google OAuth callback received');
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=account_exists`,
    session: false 
  }),
  async (req, res) => {
    try {
      // Check if authentication failed (user will be false if denied in strategy)
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=account_exists`);
      }

      // Generate JWT token
      const token = generateAccessToken({ userId: req.user._id, role: req.user.role });
      
      // Check if this is a new OAuth user
      const isNewUser = req.user.isNewOAuthUser || false;
      const hasCompletedOnboarding = req.user.hasCompletedOnboarding || false;
      
      // Redirect to frontend with token, new user flag, and onboarding status
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=google&isNewUser=${isNewUser}&hasCompletedOnboarding=${hasCompletedOnboarding}&firstName=${encodeURIComponent(req.user.firstName || '')}&lastName=${encodeURIComponent(req.user.lastName || '')}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// Microsoft OAuth Routes
router.get(
  '/microsoft',
  passport.authenticate('microsoft', { scope: ['user.read'] })
);

router.get(
  '/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=microsoft_auth_failed`, session: false }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = generateAccessToken({ userId: req.user._id, role: req.user.role });
      
      // Check if this is a new OAuth user
      const isNewUser = req.user.isNewOAuthUser || false;
      
      // Redirect to frontend with token and new user flag
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=microsoft&isNewUser=${isNewUser}`);
    } catch (error) {
      console.error('Microsoft OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

export default router;
