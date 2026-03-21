import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/user.models.js';

const passportGoogleStrategy = passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = await User.create({
          googleId: profile.id,
          fullName: profile.displayName,
          email: profile.emails[0].value
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

export default passportGoogleStrategy;