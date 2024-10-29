import passport from 'passport';
import axios from 'axios';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { createOAuthUser } from '@services/authService';
import User from '@models/userModel';
import IUser from '@base/types/user';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

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
      callbackURL: '/api/v1/auth/oauth/google/redirect',
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/user.phonenumbers.read',
      ],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const peopleResponse = await axios.get(
          'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const phoneNumber = peopleResponse.data.phoneNumbers
          ? peopleResponse.data.phoneNumbers[0].value
          : undefined;
        const user: IUser = await createOAuthUser(profile, { phoneNumber });
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
      // eslint-disable-next-line no-unused-vars
      done: (error: any, user?: any, info?: any) => void
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
        const user: IUser = await createOAuthUser(profile, { email });
        done(null, user);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      callbackURL: '/api/v1/auth/oauth/facebook/redirect',
      scope: ['public_profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const restOfProfile = await axios.get('https://graph.facebook.com/me', {
          params: {
            fields: 'email,picture',
            access_token: accessToken,
          },
        });

        console.log(profile);
        console.log(restOfProfile.data);
        const user: IUser = await createOAuthUser(profile, {
          email: restOfProfile.data.email,
          photo: restOfProfile.data.picture.data.url,
        });
        done(null, user);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);
