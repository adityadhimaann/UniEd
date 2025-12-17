import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
console.log('Configuring Google OAuth Strategy:', {
  hasClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10)
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/v1/oauth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google Profile:', JSON.stringify(profile, null, 2));
          
          // Extract name from Google profile
          const displayName = profile.displayName || '';
          const nameParts = displayName.split(' ');
          const firstName = profile.name?.givenName || profile._json?.given_name || nameParts[0] || 'User';
          const lastName = profile.name?.familyName || profile._json?.family_name || nameParts.slice(1).join(' ') || '';

          console.log('Extracted names:', { firstName, lastName, displayName });
          
          // Check if user already exists
          let user = await User.findOne({ 
            $or: [
              { googleId: profile.id },
              { email: profile.emails[0].value }
            ]
          });

          if (user) {
            // Update user data if needed
            let needsUpdate = false;
            
            if (!user.googleId) {
              user.googleId = profile.id;
              user.authProvider = 'google';
              needsUpdate = true;
            }
            
            // Update firstName and lastName if they're empty
            if (!user.firstName || user.firstName === '') {
              user.firstName = firstName;
              needsUpdate = true;
            }
            
            if (!user.lastName || user.lastName === '') {
              user.lastName = lastName;
              needsUpdate = true;
            }
            
            // Update avatar if not set
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              await user.save();
              console.log('Updated existing user:', { id: user._id, firstName: user.firstName, lastName: user.lastName });
            }
            
            return done(null, user);
          }

          // Create new user without password
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: firstName,
            lastName: lastName,
            avatar: profile.photos?.[0]?.value || null,
            authProvider: 'google',
            password: Math.random().toString(36).slice(-8) + 'Aa1!', // Temporary password
            role: 'student', // Default role
          });

          console.log('User created:', { id: user._id, firstName: user.firstName, lastName: user.lastName });

          // Mark as new user
          user.isNewOAuthUser = true;
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth Strategy configured successfully');
} else {
  console.warn('⚠️  Google OAuth Strategy NOT configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Microsoft OAuth Strategy
console.log('Configuring Microsoft OAuth Strategy:', {
  hasClientId: !!process.env.MICROSOFT_CLIENT_ID,
  hasClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET
});

if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/v1/oauth/microsoft/callback`,
        scope: ['user.read'],
        tenant: 'common', // 'common' for multi-tenant, or specific tenant ID
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({
            $or: [
              { microsoftId: profile.id },
              { email: profile.emails[0].value }
            ]
          });

          if (user) {
            // Update Microsoft ID if not set
            if (!user.microsoftId) {
              user.microsoftId = profile.id;
              user.authProvider = 'microsoft';
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            microsoftId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name.familyName || profile.displayName.split(' ')[1] || '',
            avatar: null,
            authProvider: 'microsoft',
            password: Math.random().toString(36).slice(-8) + 'Aa1!', // Random password (won't be used)
            role: 'student', // Default role
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
  console.log('✅ Microsoft OAuth Strategy configured successfully');
} else {
  console.warn('⚠️  Microsoft OAuth Strategy NOT configured - missing MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET');
}

export default passport;
