import { Router } from 'express';
import passport from 'passport';
import { oAuthCallback } from '@controllers/authController';
import { savePlatformInfo } from '@base/middlewares/authMiddleware';

const router = Router();
/**
 * @swagger
 * tags:
 *  name: OAuth
 *  description: The OAuth Managing API
 */

router.get(
  '/google',
  savePlatformInfo,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);
router.get('/google/redirect', passport.authenticate('google'), oAuthCallback);

router.get(
  '/github',
  savePlatformInfo,
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get('/github/redirect', passport.authenticate('github'), oAuthCallback);

export default router;
