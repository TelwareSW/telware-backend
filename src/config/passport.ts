import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from 'passport-github2';
import User from '@models/userModel';
import IUser from '../types/user';

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/api/v1/auth/login/oauth/google',
    },
    async (accessToken, refreshToken, profile, done) => {
      const photo = profile.photos ? profile.photos[0].value : undefined;
      const email = profile.emails ? profile.emails[0].value : undefined;
      const user: IUser = new User({
        provider: profile.provider,
        providerId: profile.id,
        screenName: profile.displayName,
        username: '',
        accountStatus: 'active',
        email,
        photo,
      });
      user.save({ validateBeforeSave: false });
      done(null, user, { accessToken });
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: '/api/v1/auth/login/oauth/github',
      scope: ['user:email'],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GitHubProfile,
      done: (_error: any, _user?: any, _info?: any) => void,
    ) => {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      const emails = await emailResponse.json();
      const email = emails.find((em: any) => em.primary && em.verified)?.email;
      const photo = profile.photos ? profile.photos[0].value : undefined;
      const user: IUser = new User({
        provider: profile.provider,
        providerId: profile.id,
        screenName: profile.displayName,
        username: profile.username,
        accountStatus: 'active',
        email,
        photo,
      });
      user.save({ validateBeforeSave: false });
      done(null, user, { accessToken });
    }
  )
);
