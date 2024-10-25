import express from 'express';
import passport from 'passport';
import {
  signup,
  sendConfirmationCode,
  verifyEmail,
  login,
  githubCallback
} from '@controllers/authController';

const router = express.Router();

router.post('/signup', signup);
router.post('/send-confirmation', sendConfirmationCode);
router.post('/verify', verifyEmail);
router.post('/login', login);
// router.get(
//   '/login/oauth/',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );
// router.get(
//   '/login/oauth/google',
//   passport.authenticate('google'),
//   googleCallback
// );
router.get(
  '/login/oauth',
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get(
  '/login/oauth/github',
  passport.authenticate('github'),
  githubCallback
);
export default router;
