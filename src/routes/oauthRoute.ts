import { Router } from 'express';
import passport from 'passport';
import { oAuthCallback } from '@controllers/authController';

const router = Router();
/**
 * @swagger
 * tags:
 *  name: OAuth
 *  description: The OAuth Managing API
 */

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);
router.get('/google/redirect', passport.authenticate('google'), oAuthCallback);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get('/github/redirect', passport.authenticate('github'), oAuthCallback);

export default router;
