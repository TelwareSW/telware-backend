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
 *     summary: Registers a new user
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
 *     summary: Logs in a user
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
 *     summary: Sends email confirmation code
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
 *     summary: Verifies user's email address
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
/**
 * @swagger
 * /password/forget:
 *   post:
 *     summary: Sends a reset password email to the user.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@gmail.com
 *                 description: The email of the user requesting password reset.
 *     responses:
 *       200:
 *         description: Reset instructions sent successfully.
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
 *                   example: "Reset instructions is sent to your email"
 *                 data:
 *                   type: object
 *                   example: {}
 *       404:
 *         description: No user found with this email.
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
 *                   example: "No user found with this email"
 *       500:
 *         description: Error occurred while sending the email.
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
 *                   example: "An error occurred while sending the email. Try again later!"
 */
router.post('/password/forget', forgotPassword);
/**
 * @swagger
 * /password/reset/{token}:
 *   patch:
 *     summary: Resets the user's password using a reset token.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The password reset token sent to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: newPassword123
 *                 description: The new password for the user.
 *               passwordConfirm:
 *                 type: string
 *                 example: newPassword123
 *                 description: Confirmation of the new password.
 *     responses:
 *       200:
 *         description: Password reset successfully.
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
 *                   example: "Password reset successfully"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Token is invalid or has expired.
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
 *                   example: "Token is invalid or expired"
 */
router.patch('/password/reset/:token', resetPassword);
/**
 * @swagger
 * /password/change:
 *   patch:
 *     summary: Allows an authenticated user to change their password.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldPassword123
 *                 description: The user's current password.
 *               newPassword:
 *                 type: string
 *                 example: newPassword456
 *                 description: The new password for the user.
 *               confirmNewPassword:
 *                 type: string
 *                 example: newPassword456
 *                 description: Confirmation of the new password.
 *     responses:
 *       200:
 *         description: Password changed successfully.
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
 *                   example: "Password changed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: "session12345"
 *                       description: The new session ID after password change.
 *       400:
 *         description: Incorrect old password.
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
 *                   example: "Wrong password"
 *       401:
 *         description: Unauthorized or session not found.
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
 *                   example: "Session not found, you are not allowed here!"
 */
router.patch('/password/change', protect, changePassword);

router.use(protect);
/**
 * @swagger
 * /me:
 *   get:
 *     summary: Checks if the user is logged in and retrieves user information if authenticated.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated and logged in.
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
 *                   example: "User is logged in"
 *                 data:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Unauthorized or session not found.
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
 *                   example: "Session not found, you are not allowed here!"
 */
router.get('/me', isLoggedIn);
/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Retrieves all active sessions for the authenticated user.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all active sessions.
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
 *                   example: "Got all sessions successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           agent:
 *                             type: string
 *                             example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36"
 *                             description: The user agent string of the device.
 *                           status:
 *                             type: string
 *                             example: "active"
 *                             description: The status of the session.
 *                           lastSeenTime:
 *                             type: integer
 *                             example: 1609459200000
 *                             description: The last seen time of the session in Unix timestamp format.
 *       401:
 *         description: Unauthorized or session not found.
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
 *                   example: "Session not found, you are not allowed here!"
 */
router.get('/sessions', getLogedInSessions);
/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logs the user out from a specified session or the current session if no session ID is provided.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "session12345"
 *                 description: The session ID to log out from. If omitted, logs out from the current session.
 *     responses:
 *       204:
 *         description: User logged out successfully.
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
 *                   example: "User logged out successfully"
 *                 data:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Unauthorized or session not found.
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
 *                   example: "Session not found, you are not allowed here!"
 */
router.post('/logout', logoutSession);
/**
 * @swagger
 * /logout/all:
 *   post:
 *     summary: Logs the user out from all active sessions.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: User successfully logged out from all sessions.
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
 *                   example: "All sessions logged out successfully"
 *                 data:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Unauthorized or session not found.
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
 *                   example: "Session not found, you are not allowed here!"
 */
router.post('/logout/all', logoutAll);
/**
 * @swagger
 * /logout/others:
 *   post:
 *     summary: Logs the user out from all active sessions except for the current session.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: User successfully logged out from all other sessions.
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
 *                   example: "All other sessions logged out successfully"
 *                 data:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Unauthorized or session not found.
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
 *                   example: "Session not found, you are not allowed here!"
 */
router.post('/logout/others', logoutOthers);

export default router;
