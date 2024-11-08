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

/**
 * @swagger
 * /google:
 *   get:
 *     summary: Redirects the user to Google’s OAuth2.0 login page
 *     tags: [OAuth]
 *     description: Redirects the user to Google’s OAuth2.0 login page, requesting access to the user's profile and email.
 *     responses:
 *       302:
 *         description: Redirects the user to the Google login page.
 *         headers:
 *           Location:
 *             type: string
 *             description: The URL to which the user is redirected for Google authentication.
 *             example: "https://accounts.google.com/o/oauth2/v2/auth?scope=profile+email&..."
 *       401:
 *         description: Unauthorized if Google authentication fails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Authentication failed"
 */
router.get(
  '/google',
  savePlatformInfo,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

/**
 * @swagger
 * /google/redirect:
 *   get:
 *     summary: Handles the OAuth callback from Google after authentication.
 *     tags: [OAuth]
 *     description: After successful authentication with Google, the user is redirected to either the frontend login page or a cross-platform redirect URL, depending on the origin.
 *     responses:
 *       302:
 *         description: Redirects the user to the appropriate URL after successful authentication.
 *         headers:
 *           Location:
 *             type: string
 *             description: The URL to which the user is redirected after Google authentication.
 *             example: "https://yourfrontend.com/login?oauth=true"
 *       500:
 *         description: Internal Server Error if session saving or redirecting fails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Internal server error occurred"
 */
router.get('/google/redirect', passport.authenticate('google'), oAuthCallback);
/**
 * @swagger
 * /github:
 *   get:
 *     summary: Initiates GitHub authentication using Passport.
 *     tags: [OAuth]
 *     description: Redirects the user to GitHub's OAuth2.0 login page, requesting access to the user's email.
 *     responses:
 *       302:
 *         description: Redirects the user to GitHub's OAuth page for authentication.
 *         headers:
 *           Location:
 *             type: string
 *             description: The URL to which the user is redirected for GitHub authentication.
 *             example: "https://github.com/login/oauth/authorize?scope=user%3Aemail&..."
 *       401:
 *         description: Unauthorized if GitHub authentication fails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Authentication failed"
 */
router.get(
  '/github',
  savePlatformInfo,
  passport.authenticate('github', { scope: ['user:email'] })
);
/**
 * @swagger
 * /github/redirect:
 *   get:
 *     summary: Handles the OAuth callback from GitHub after authentication.
 *     tags: [OAuth]
 *     description: After successful authentication with GitHub, the user is redirected to either the frontend login page or a cross-platform redirect URL, depending on the origin.
 *     responses:
 *       302:
 *         description: Redirects the user to the appropriate URL after successful authentication.
 *         headers:
 *           Location:
 *             type: string
 *             description: The URL to which the user is redirected after GitHub authentication.
 *             example: "https://yourfrontend.com/login?oauth=true"
 *       500:
 *         description: Internal Server Error if session saving or redirecting fails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Internal server error occurred"
 */
router.get('/github/redirect', passport.authenticate('github'), oAuthCallback);

export default router;
