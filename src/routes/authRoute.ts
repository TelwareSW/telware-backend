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
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Register a new user by validating inputs, verifying reCaptcha, creating the user, and sending a verification email.
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
 *         description: Missing required fields or reCaptcha validation failure
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
 *       409:
 *         description: User validation failed
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
 *                   example: Email already exists
 */
router.post('/signup', signup);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     description: Login user by providing email and password. It validates user credentials and checks if the user's email is verified before granting access.
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
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully
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
 *                   example: logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: User information
 *                     sessionId:
 *                       type: string
 *                       description: Session ID for the user session
 *       400:
 *         description: Validation error (e.g., invalid credentials or missing fields)
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
 *                   example: Invalid email or password
 *       403:
 *         description: Email not verified
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
 *                   example: Please verify your email first to be able to login
 *       404:
 *         description: User not found
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
 *                   example: No user is found with this email address
 */
router.post('/login', login);
/**
 * @swagger
 * /auth/send-confirmation-code:
 *   post:
 *     summary: Send email confirmation code
 *     tags: [Auth]
 *     description: Send a verification code to the provided email to verify the user's email address.
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
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Verification email sent successfully
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
 *                   example: verification email sent
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Missing or invalid email field
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
 *                   example: Please provide a valid email
 *       404:
 *         description: User not found with the provided email address
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
 *                   example: No user is found with this email address
 *       500:
 *         description: Internal server error during email sending
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
 *                   example: Failed to send verification email
 */
router.post('/send-confirmation', sendConfirmationCode);
/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user's email address
 *     tags: [Auth]
 *     description: Verify a user's email address by checking the verification code provided by the user. If the code is valid, it activates the user's account.
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
 *               verificationCode:
 *                 type: string
 *                 description: Verification code sent to the user's email
 *             required:
 *               - email
 *               - verificationCode
 *     responses:
 *       200:
 *         description: Email verified successfully, account activated
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
 *                   example: Account got verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                         screenFirstName:
 *                           type: string
 *                         screenLastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         photo:
 *                           type: string
 *                         status:
 *                           type: string
 *                         bio:
 *                           type: string
 *                     sessionId:
 *                       type: string
 *                       description: Session ID for the user session
 *       400:
 *         description: Bad request due to missing fields or validation errors
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
 *                   example: Provide your email
 *       403:
 *         description: Maximum number of attempts reached, try again later
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
 *                   example: You have reached the maximum number of attempts, please try again later
 *       404:
 *         description: User not found or not registered
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
 *                   example: You need to register before verifying your email
 *       500:
 *         description: Internal server error during verification
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
 *                   example: An error occurred during email verification
 */
router.post('/verify', verifyEmail);

router.post('/password/forget', forgotPassword);
router.patch('/password/reset/:token', resetPassword);
/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change user's password
 *     tags: [Auth]
 *     description: Allow a user to change their password by providing their current password, a new password, and confirming the new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 description: User's new password
 *               confirmNewPassword:
 *                 type: string
 *                 description: Confirmation of the user's new password
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmNewPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: password changed successfully
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request due to incorrect old password or validation error
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
 *                   example: Wrong password
 *       500:
 *         description: Internal server error during password change
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
 *                   example: An error occurred while changing the password
 */
router.patch('/password/change', protect, changePassword);

router.use(protect);
router.get('/me', isLoggedIn);
router.get('/sessions', getLogedInSessions);
router.post('/logout', logoutSession);
router.post('/logout/all', logoutAll);
router.post('/logout/others', logoutOthers);

export default router;
