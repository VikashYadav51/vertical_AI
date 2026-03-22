import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.models.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        if (!profile.emails || !profile.emails.length) {
          return done(new Error('No email found from Google'), null);
        }

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
            user.isVerified = true;
            await user.save();
          }
          
          else {
            user = await User.create({
              googleId: profile.id,
              fullName: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos?.[0]?.value,
              isVerified: true,
            });
          }

        }

        return done(null, user);
      } 
      
      catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;