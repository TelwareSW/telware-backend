import passport from 'passport';
import axios from 'axios';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from 'passport-github2';
import { createOAuthUser } from '@services/authService';
import IUser from '@base/types/user';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    done(null, { id });
  } catch (error) {
    done(error);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/api/v1/auth/oauth/google/redirect',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user: IUser = await createOAuthUser(profile);
        done(null, user);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: '/api/v1/auth/oauth/github/redirect',
      scope: ['user:email'],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GitHubProfile,
      done: (_error: any, _user?: any, _info?: any) => void
    ) => {
      try {
        const emailResponse = await axios.get(
          'https://api.github.com/user/emails',
          {
            headers: {
              Authorization: `token ${accessToken}`,
            },
          }
        );
        const email = emailResponse.data.find(
          (em: any) => em.primary && em.verified
        )?.email;
        const user: IUser = await createOAuthUser(profile, email);
        done(null, user);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);
