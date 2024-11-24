import { Router } from 'express';
import upload from '@base/config/fileUploads';
import privacyRouter from '@routes/privacyRoute';
import {
  block,
  getBlockedUsers,
  unblock,
} from '@controllers/privacyController';
import {
  deletePicture,
  getAllUsers,
  getCheckUserName,
  getCurrentUser,
  getUser,
  updateBio,
  updateCurrentUser,
  updateEmail,
  updatePhoneNumber,
  updatePicture,
  updateScreenName,
  updateUsername,
} from '@controllers/userController';
import {
  deleteStory,
  getCurrentUserStory,
  getStory,
  postStory,
} from '@controllers/storyController';
import { protect } from '@middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *  name: User
 *  description: The User Managing API
 */

router.use(protect);
router.use('/privacy', privacyRouter);

/**
 * @swagger
 * /users/stories:
 *   get:
 *     summary: Retrieve the current user's stories
 *     tags: [User]
 *     description: Fetches all the stories associated with the currently authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's stories.
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
 *                   example: "Stories retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "64f1d2d2c1234567890abcdef"
 *                           content:
 *                             type: string
 *                             example: "story_name.jpg"
 *                           caption:
 *                             type: string
 *                             example: "An optional caption for the story."
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-11-24T12:00:00.000Z"
 *                           views:
 *                             type: array
 *                             description: List of users who viewed the story
 *                             items:
 *                               type: string
 *                               example: "64f1d2d2c1234567890abcdef"
 *       404:
 *         description: No user exists with the provided ID.
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
 *                   example: "No User exists with this ID"
 *       401:
 *         description: Unauthorized or session not found.
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
 *                   example: "Session not found, you are not allowed here!"
 */
router.get('/stories', getCurrentUserStory);

/**
 * @swagger
 * /users/stories:
 *   post:
 *     summary: Create a new story for the authenticated user
 *     tags: [User]
 *     description: Allows the authenticated user to upload a new story, including a caption and an image file.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *                 description: Optional caption for the story
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image or media file for the story (required)
 *             required:
 *               - file
 *     responses:
 *       201:
 *         description: Story successfully created
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
 *                   example: Story created successfully
 *                 data:
 *                   type: object
 *                   properties: {}
 *       400:
 *         description: Missing required file or invalid input
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
 *                   example: An error occurred while uploading the story
 *       404:
 *         description: No user found with the provided ID
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
 *                   example: No User exists with this ID
 *       401:
 *         description: Unauthorized or session not found.
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
 *                   example: "Session not found, you are not allowed here!"
 */
router.post('/stories', upload.single('file'), postStory);

/**
 * @swagger
 * /users/stories/{storyId}:
 *   delete:
 *     summary: Delete a user's story
 *     tags: [User]
 *     description: Deletes a specific story by its ID for the authenticated user. This removes the story from the user's collection and deletes the associated file from the server.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         description: The ID of the story to be deleted
 *         schema:
 *           type: string
 *           example: "64f1d2d2c1234567890abcdef"  # Example story ID
 *     responses:
 *       204:
 *         description: Story successfully deleted
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
 *                   example: Story deleted successfully
 *                 data:
 *                   type: object
 *                   properties: {}
 *       400:
 *         description: Invalid story ID or failed deletion
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
 *                   example: Invalid story ID or failed deletion
 *       404:
 *         description: Story or user not found
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
 *                   enum:
 *                     - No User exists with this ID
 *                     - No story exists with this ID in your stories
 *       401:
 *         description: Unauthorized or session not found.
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
 *                   example: "Session not found, you are not allowed here!"
 */
router.delete('/stories/:storyId', deleteStory);

// Block settings
router.get('/block', getBlockedUsers);
router.post('/block/:id', block);
router.delete('/block/:id', unblock);

// User routes
router.get('/', getAllUsers);
router.get('/me', getCurrentUser);
router.get('/username/check', getCheckUserName);
router.patch('/me', updateCurrentUser);
router.patch('/bio', updateBio);
router.patch('/phone', updatePhoneNumber);
router.patch('/email', updateEmail);
router.patch('/username', updateUsername);
router.patch('/screen-name', updateScreenName);
router.patch('/picture', upload.single('file'), updatePicture);
router.delete('/picture', deletePicture);

// conflicting routes
/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Retrieve a user by their ID
 *     tags: [User]
 *     description: Fetches the user data associated with the provided `userId`. It includes optional fields based on the user's privacy settings, like the profile picture.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user to retrieve.
 *         schema:
 *           type: string
 *           example: "64f1d2d2c1234567890abcdef"
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the user.
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
 *                   example: "User retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                           example: "john_doe"
 *                         screenFirstName:
 *                           type: string
 *                           example: "John"
 *                         screenLastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         status:
 *                           type: string
 *                           example: "online"
 *                         bio:
 *                           type: string
 *                           example: "Software developer, tech enthusiast"
 *                         photo:
 *                           type: string
 *                           example: "photo.jpg"
 *       404:
 *         description: No user found with the provided ID.
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
 *                   example: "No User exists with this ID"
 *       401:
 *         description: Unauthorized, user not logged in or session expired.
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
 *                   example: "Session not found, you are not allowed here!"
 */
router.get('/:userId', getUser);

/**
 * @swagger
 * /users/{userId}/stories:
 *   get:
 *     summary: Retrieve the stories of a user
 *     tags: [User]
 *     description: Fetches the stories of a user if the authenticated user is a contact of the requested user. If they are not a contact, it returns an Unauthorized response.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user whose stories to retrieve.
 *         schema:
 *           type: string
 *           example: "64f1d2d2c1234567890abcdef"
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's stories.
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
 *                   example: "Stories retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stories:
 *                       type: array
 *                       description: List of stories associated with the user.
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "64f1d2d2c1234567890abcdef"
 *                           content:
 *                             type: string
 *                             example: "story_name.jpg"
 *                           caption:
 *                             type: string
 *                             example: "An optional caption for the story."
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-11-24T12:00:00.000Z"
 *       404:
 *         description: No user found with the provided ID.
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
 *                   example: "No User exists with this ID"
 *       401:
 *         description: Unauthorized, either user is not logged in, session expired, or user is not in contacts of the requested user.
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
 *                   enum:
 *                     - Session not found, you are not allowed here!
 *                     - You are not authorized to view these stories
 */
router.get('/:userId/stories', getStory);

export default router;
