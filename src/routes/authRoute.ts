import { Router } from 'express';
import {
  signup,
  sendConfirmationCode,
  verifyEmail,
  login,
  isLoggedIn,
  forgotPassword,
  resetPassword,
  logoutOthers,
  logoutAll,
  changePassword,
  logoutSession,
  getLogedInSessions,
} from '@controllers/authController';
import { protect } from '@middlewares/authMiddleware';
import oauthRouter from '@base/routes/oauthRoute';

const router = Router();

router.use('/oauth', oauthRouter);

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: The Auth Managing API
 */

/**
 * @swagger
 * auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: This endpoint registers a new user by validating inputs, verifying reCaptcha, creating the user, and sending a verification email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number
 *               password:
 *                 type: string
 *                 description: User's password
 *               passwordConfirm:
 *                 type: string
 *                 description: Confirmation of the user's password
 *               reCaptchaResponse:
 *                 type: string
 *                 description: reCaptcha validation response
 *             required:
 *               - email
 *               - phoneNumber
 *               - password
 *               - passwordConfirm
 *               - reCaptchaResponse
 *     responses:
 *       201:
 *         description: User created successfully, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Verification email sent
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request due to missing required fields or reCaptcha validation failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Please provide all required fields
 */
router.post('/signup', signup);
router.post('/login', login);
router.post('/send-confirmation', sendConfirmationCode);
router.post('/verify', verifyEmail);

router.post('/password/forget', forgotPassword);
router.patch('/password/reset/:token', resetPassword);
router.patch('/password/change', protect, changePassword);

router.use(protect);
router.get('/me', isLoggedIn);
router.get('/sessions', getLogedInSessions);
router.post('/logout', logoutSession);
router.post('/logout/all', logoutAll);
router.post('/logout/others', logoutOthers);

export default router;
