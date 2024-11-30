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
  getAllContactsStories,
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

/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Retrieve all users
 *     tags: [User]
 *     description: Fetches a list of all users with specific fields included.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all users.
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
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: "johndoe123"
 *                           screenFirstName:
 *                             type: string
 *                             example: "John"
 *                           screenLastName:
 *                             type: string
 *                             example: "Doe"
 *                           email:
 *                             type: string
 *                             example: "johndoe@example.com"
 *                           photo:
 *                             type: string
 *                             format: name
 *                             example: "photo.jpg"
 *                           status:
 *                             type: string
 *                             example: "online"
 *                           bio:
 *                             type: string
 *                             example: "Just a tech enthusiast!"
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
router.get('/', getAllUsers);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Retrieve the current authenticated user
 *     tags: [User]
 *     description: Fetches the details of the currently authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the current user.
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
 *                         id:
 *                           type: string
 *                           example: "64f1d2d2c1234567890abcdef"
 *                         provider:
 *                           type: string
 *                           enum: [local, google, github]
 *                           example: "local"
 *                         username:
 *                           type: string
 *                           example: "johndoe123"
 *                         screenFirstName:
 *                           type: string
 *                           example: "John"
 *                         screenLastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+1234567890"
 *                         photo:
 *                           type: string
 *                           format: uri
 *                           example: "photo.jpg"
 *                         status:
 *                           type: string
 *                           enum: [online, connected, offline]
 *                           example: "online"
 *                         isAdmin:
 *                           type: boolean
 *                           example: false
 *                         bio:
 *                           type: string
 *                           example: "Just a tech enthusiast!"
 *                         accountStatus:
 *                           type: string
 *                           enum: [active, unverified, deactivated, banned]
 *                           example: "active"
 *                         maxFileSize:
 *                           type: number
 *                           example: 3145
 *                         automaticDownloadEnable:
 *                           type: boolean
 *                           example: true
 *                         lastSeenPrivacy:
 *                           type: string
 *                           enum: [everyone, contacts, nobody]
 *                           example: "everyone"
 *                         readReceiptsEnablePrivacy:
 *                           type: boolean
 *                           example: true
 *                         storiesPrivacy:
 *                           type: string
 *                           enum: [everyone, contacts, nobody]
 *                           example: "contacts"
 *                         picturePrivacy:
 *                           type: string
 *                           enum: [everyone, contacts, nobody]
 *                           example: "contacts"
 *                         invitePermessionsPrivacy:
 *                           type: string
 *                           enum: [everyone, admins]
 *                           example: "admins"
 *                         contacts:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "64f1d2d2c1234567890abcde1"
 *                         blockedUsers:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "64f1d2d2c1234567890abcde2"
 *                         stories:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "64f1d2d2c1234567890abcde3"
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
 *       404:
 *         description: No user exists with the authenticated user's ID.
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
 */
router.get('/me', getCurrentUser);

/**
 * @swagger
 * /users/username/check:
 *   get:
 *     summary: Check if a username is available
 *     tags: [User]
 *     description: Validates a given username and checks if it is already in use.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 5
 *           maxLength: 15
 *           pattern: "^[A-Za-z0-9_]+$"
 *         description: The username to be checked for availability.
 *     responses:
 *       200:
 *         description: Username is unique and available for use.
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
 *                   example: "Username is unique"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Validation error or invalid username.
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
 *                   example: "Invalid username. Username can contain only letters, numbers, and underscores."
 *       409:
 *         description: Username already exists.
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
 *                   example: "Username already exists"
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
router.get('/username/check', getCheckUserName);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update the current user's data
 *     tags: [User]
 *     description: Updates the authenticated user's data. Only fields included in the request body will be updated. All fields are validated before saving.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 15
 *                 pattern: "^[A-Za-z0-9_]+$"
 *                 description: The username to update.
 *               screenFirstName:
 *                 type: string
 *                 description: The first name to display.
 *               screenLastName:
 *                 type: string
 *                 description: The last name to display.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email to update.
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number to update.
 *               bio:
 *                 type: string
 *                 maxLength: 70
 *                 description: A short biography for the user.
 *               photo:
 *                 type: string
 *                 description: The user profile photo name.
 *             example:
 *               username: "newUsername"
 *               screenFirstName: "John"
 *               screenLastName: "Doe"
 *               email: "john.doe@example.com"
 *               phoneNumber: "+1234567890"
 *               bio: "Passionate software developer."
 *               photo: "photo.jpg"
 *     responses:
 *       200:
 *         description: User data updated successfully.
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
 *                   example: "User data updated successfuly"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Validation error due to invalid data in the request body.
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
 *                   example: "Invalid input data"
 *       404:
 *         description: The authenticated user was not found.
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
router.patch('/me', updateCurrentUser);

/**
 * @swagger
 * /users/bio:
 *   patch:
 *     summary: Update the user's bio
 *     tags: [User]
 *     description: Updates the authenticated user's biography. The bio must not exceed 70 characters.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 maxLength: 70
 *                 description: The updated bio for the user.
 *             example:
 *               bio: "This is my new bio!"
 *     responses:
 *       200:
 *         description: User bio updated successfully.
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
 *                   example: "User bio updated successfuly"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Validation error due to an invalid bio (e.g., exceeding character limit).
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
 *                   example: "Invalid bio length"
 *       404:
 *         description: The authenticated user was not found.
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
router.patch('/bio', updateBio);

/**
 * @swagger
 * /users/phone:
 *   patch:
 *     summary: Update the user's phone number
 *     tags: [User]
 *     description: Updates the authenticated user's phone number. The phone number must be valid and unique.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: The new phone number for the user.
 *             example:
 *               phoneNumber: "+1234567890"
 *     responses:
 *       200:
 *         description: User phone number updated successfully.
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
 *                   example: "User phoneNumber updated successfuly"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Validation error due to an invalid or already existing phone number.
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
 *                   example: "Phone number already exists"
 *       404:
 *         description: The authenticated user was not found.
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
router.patch('/phone', updatePhoneNumber);

/**
 * @swagger
 * /users/email:
 *   patch:
 *     summary: Update the user's email address
 *     tags: [User]
 *     description: Updates the authenticated user's email address. The email must be valid and unique.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The new email address for the user.
 *             example:
 *               email: "user@example.com"
 *     responses:
 *       200:
 *         description: User email updated successfully.
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
 *                   example: "User email updated successfuly"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Validation error due to an invalid or already existing email address.
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
 *                   example: "Email already exists"
 *       404:
 *         description: The authenticated user was not found.
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
router.patch('/email', updateEmail);

/**
 * @swagger
 * /users/username:
 *   patch:
 *     summary: Update the user's username
 *     tags: [User]
 *     description: Updates the authenticated user's username. The username must be unique and adhere to validation rules.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The new username for the user.
 *             example:
 *               username: "new_username"
 *     responses:
 *       200:
 *         description: User username updated successfully.
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
 *                   example: "User username updated successfuly"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Validation error due to an invalid or already existing username.
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
 *                   example: "Username already exists or is invalid"
 *       404:
 *         description: The authenticated user was not found.
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
router.patch('/username', updateUsername);

/**
 * @swagger
 * /users/screen-name:
 *   patch:
 *     summary: Update the user's screen name
 *     tags: [User]
 *     description: Updates the authenticated user's screen first name and last name.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               screenFirstName:
 *                 type: string
 *                 description: The new screen first name for the user.
 *               screenLastName:
 *                 type: string
 *                 description: The new screen last name for the user.
 *             example:
 *               screenFirstName: "John"
 *               screenLastName: "Doe"
 *     responses:
 *       200:
 *         description: User screenFirstName and screenLastName updated successfully.
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
 *                   example: "User screenFirstName and screenLastName updated successfuly"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Validation error due to invalid screen name data.
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
 *                   example: "Invalid screenFirstName or screenLastName"
 *       404:
 *         description: The authenticated user was not found.
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
router.patch('/screen-name', updateScreenName);

/**
 * @swagger
 * /users/picture:
 *   patch:
 *     summary: Update the user's profile picture
 *     tags: [User]
 *     description: Uploads and updates the authenticated user's profile picture.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: The new profile picture for the user.
 *     responses:
 *       201:
 *         description: User profile picture updated successfully.
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
 *                   example: "User profile picture updated successfully"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Error while uploading the profile picture.
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
 *                   example: "An error occurred while uploading the story"
 *       404:
 *         description: The authenticated user was not found.
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
router.patch('/picture', upload.single('file'), updatePicture);

/**
 * @swagger
 * /users/picture:
 *   delete:
 *     summary: Delete the user's profile picture
 *     tags: [User]
 *     description: Removes the authenticated user's profile picture and resets the `photo` field.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: User profile picture deleted successfully.
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
 *                   example: "User profile picture deleted successfully"
 *                 data:
 *                   type: object
 *                   example: {}
 *       404:
 *         description: The authenticated user was not found.
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
router.delete('/picture', deletePicture);

/**
 * @swagger
 * /users/contacts/stories:
 *   get:
 *     summary: Retrieve stories of user's contacts
 *     description: Fetches all stories of the authenticated user's contacts. The contacts are determined based on private chats that the user is part of. The response includes user details (like username, profile picture) and their associated stories.
 *     tags:
 *       - User
 *       - Story
 *     responses:
 *       200:
 *         description: Stories retrieved successfully
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
 *                   example: Stories retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: "64eae68cdb5e4556b8b6e54d"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       photo:
 *                         type: string
 *                         example: "profile.jpg"
 *                       stories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "74fbb38ddb5e4556b8b6e67a"
 *                             content:
 *                               type: string
 *                               example: "story.jpg"
 *                             caption:
 *                               type: string
 *                               example: "Beautiful sunset"
 *                             timestamp:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-11-30T12:34:56.789Z"
 *       404:
 *         description: User or stories not found
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
 *       500:
 *         description: Internal server error
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
 *                   example: An unexpected error occurred
 */
router.get('/contacts/stories', getAllContactsStories);

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
