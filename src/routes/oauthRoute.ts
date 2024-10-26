import { Router } from 'express';
import passport from 'passport';
import {
  oAuthCallback,
  googleLogin,
  githubLogin,
  facebookLogin
} from '@controllers/authController';

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/user.phonenumbers.read',
    ],
  })
);
router.get('/google/redirect', passport.authenticate('google'), oAuthCallback);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get('/github/redirect', passport.authenticate('github'), oAuthCallback);

router.get('/google/:token', googleLogin);
router.get('/github/:token', githubLogin);
router.get('/facebook/:token', facebookLogin);

export default router;
