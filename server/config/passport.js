/* 
passport.js is the server’s rulebook for how to log someone in using Google (or any provider) — and what to do with their account info once they are authenticated.
*/

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.CLIENT_URL}/api/auth/google/callback`,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        //profile.id is Google's unique user id
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // is user does not exist.check by email.he might have signed up locally
          const email = profile.emails?.[0]?.value;
          user = await User.findOne({ email });

          if (!user) {
            //still user not found..then new entry
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              password: "google-oauth", //dummy password
            });
          } else {
            //link google account to existing user
            user.googleId = profile.id;
            await user.save();
          }
        }

        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

// Serialize only the DB id into session (required by passport)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then((user) => done(null, user))
);

export default passport;
