import { Router } from 'express';
import {
  createChat,
  getAllChats,
  getMessages,
  postMediaFile,
  enableSelfDestructing,
  disableSelfDestructing,
  getAllDrafts,
  getDraft,
  getChat,
} from '@base/controllers/chatController';
import { protect } from '@base/middlewares/authMiddleware';
import upload from '@base/config/fileUploads';
import restrictToMembers from '@base/middlewares/chatMiddlewares';

const router = Router();

/**
 * @swagger
 * tags:
 *  name: Chat
 *  description: The Chat Managing API
 */

router.use(protect);

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Retrieve all chats for the logged-in user.
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [private, group, channel]
 *         description: Filter chats by their type.
 *     responses:
 *       200:
 *         description: Success. Returns a list of chats, members, and their last messages.
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
 *                   example: Chats retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     chats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64c2f99c6f1e4e21a0f6a5e8
 *                           isSeen:
 *                             type: boolean
 *                             example: true
 *                           members:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: 64c2f8ad6f1e4e21a0f6a5d7
 *                           type:
 *                             type: string
 *                             enum: [private, group, channel]
 *                             example: private
 *                           numberOfMembers:
 *                             type: integer
 *                             example: 3
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64c2f8ad6f1e4e21a0f6a5d7
 *                           username:
 *                             type: string
 *                             example: john_doe
 *                           screenFirstName:
 *                             type: string
 *                             example: John
 *                           screenLastName:
 *                             type: string
 *                             example: Doe
 *                           phoneNumber:
 *                             type: string
 *                             example: +123456789
 *                           photo:
 *                             type: string
 *                             example: john_doe.jpg
 *                           status:
 *                             type: string
 *                             enum: [online, connected, offline]
 *                             example: online
 *                           isAdmin:
 *                             type: boolean
 *                             example: false
 *                           stories:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: 64c2fb5e6f1e4e21a0f6a6c9
 *                           blockedUsers:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: 64c2fca96f1e4e21a0f6a7f0
 *                     lastMessages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           chatId:
 *                             type: string
 *                             example: 64c2f99c6f1e4e21a0f6a5e8
 *                           lastMessage:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 64c2f8ad6f1e4e21a0f6a5d7
 *                               content:
 *                                 type: string
 *                                 example: Hello, how are you?
 *                               senderId:
 *                                 type: string
 *                                 example: 64c2f8ad6f1e4e21a0f6a5d7
 *                               timestamp:
 *                                 type: string
 *                                 format: date-time
 *                                 example: 2024-12-01T12:34:56Z
 *       400:
 *         description: Bad request. User is not logged in.
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
 *                   example: You need to login first
 */
router.get('/', getAllChats);

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chat]
 *     description: Create a new private or group chat. Requires the user to be authenticated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the chat ('private' or 'group').
 *                 example: "private"
 *               name:
 *                 type: string
 *                 description: The name of the chat (required for group or channel chats).
 *                 example: "Study Group"
 *               members:
 *                 type: array
 *                 description: An array of member IDs to include in the chat.
 *                 items:
 *                   type: string
 *                 example: ["674add2a35039e9581d4d752", "674add2a35039e9581d4d753"]
 *     responses:
 *       201:
 *         description: Chat created successfully.
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
 *                   example: Chat created successfuly
 *                 data:
 *                   type: object
 *                   properties:
 *                     isSeen:
 *                       type: boolean
 *                       example: true
 *                     members:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "674b62b8595166a31cef6bad"
 *                     type:
 *                       type: string
 *                       example: private
 *                     _id:
 *                       type: string
 *                       example: "674cbe3338e993348d08ec2b"
 *                     chatType:
 *                       type: string
 *                       example: GroupChannel
 *                     name:
 *                       type: string
 *                       example: Study Group
 *                     messagnigPermession:
 *                       type: boolean
 *                       example: true
 *                     downloadingPermession:
 *                       type: boolean
 *                       example: true
 *                     privacy:
 *                       type: boolean
 *                       example: true
 *                     isFilterd:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-01T19:51:15.947Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                     numberOfMembers:
 *                       type: integer
 *                       example: 1
 *                     id:
 *                       type: string
 *                       example: "674cbe3338e993348d08ec2b"
 *       400:
 *         description: Bad Request - Missing required fields or user not logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Please provide all required fields"
 *       401:
 *         description: Unauthorized - User not logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "You need to login first"
 */
router.post('/', createChat);

/**
 * @swagger
 * /chats/messages/{chatId}:
 *   get:
 *     summary: Retrieve messages from a specific chat
 *     tags: [Chat]
 *     description: Get messages from a specific chat. Only members of the chat can access this endpoint.
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number for paginated messages (default is 1).
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 50
 *         description: The number of messages to retrieve per page (default is 100).
 *     responses:
 *       200:
 *         description: Messages retrieved successfully.
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
 *                   example: messages retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "674cbbba97faf0d2e8a93846"
 *                           content:
 *                             type: string
 *                             example: this should disappear
 *                           contentType:
 *                             type: string
 *                             example: text
 *                           isPinned:
 *                             type: boolean
 *                             example: false
 *                           isForward:
 *                             type: boolean
 *                             example: false
 *                           senderId:
 *                             type: string
 *                             example: "674b62b8595166a31cef6bad"
 *                           chatId:
 *                             type: string
 *                             example: "674b62b9595166a31cef6c13"
 *                           parentMessage:
 *                             type: string
 *                             example: "674b62b9595166a31cef6c12"
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-01T19:37:56.399Z"
 *                           isAnnouncement:
 *                             type: boolean
 *                             example: false
 *                           threadMessages:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: []
 *                           messageType:
 *                             type: string
 *                             example: private
 *                           __v:
 *                             type: integer
 *                             example: 0
 *                           id:
 *                             type: string
 *                             example: "674cbbba97faf0d2e8a93846"
 *                     nextPage:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad Request - Chat does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "This chat does not exist."
 *       403:
 *         description: Forbidden - User is not a member of the chat or the chat has no members.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "You are not a member of this chat, you are not allowed here."
 *       401:
 *         description: Unauthorized - User not logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "You need to log in to access this resource."
 */
router.get('/messages/:chatId', restrictToMembers, getMessages);

/**
 * @swagger
 * /chats/destruct/{chatId}:
 *   patch:
 *     summary: Enable self-destruction for a chat
 *     description: Set a self-destruction timer for a chat by providing a destruction duration. Only members of the chat are allowed to enable self-destruction.
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat to enable self-destruction for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destructionDuration:
 *                 type: number
 *                 description: The duration (in milliseconds) after which the chat will self-destruct.
 *                 example: 86400000
 *     responses:
 *       200:
 *         description: Destruction time enabled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Destruction time is enabled successfully"
 *       400:
 *         description: Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "missing required fields"
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "No chat with the provided id"
 */
router.get('/', getAllChats);
router.get('/messages/:chatId', restrictToMembers, getMessages);

router.patch('/destruct/:chatId', restrictToMembers, enableSelfDestructing);

/**
 * @swagger
 * /chats/un-destruct/{chatId}:
 *   patch:
 *     summary: Disable self-destruction for a chat
 *     tags: [Chat]
 *     description: Disable the self-destruction timer for a chat. Only members of the chat are allowed to disable self-destruction.
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat to disable self-destruction for.
 *     responses:
 *       200:
 *         description: Destruction time disabled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Destruction time is disabled successfully"
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "No chat with the provided id"
 */
router.patch('/un-destruct/:chatId', restrictToMembers, disableSelfDestructing);

/**
 * @swagger
 * /chats/media:
 *   post:
 *     summary: Upload a media file for chats
 *     description: Uploads a media file to the server and returns the filename of the uploaded file.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The media file to upload
 *     responses:
 *       200:
 *         description: Media file uploaded successfully.
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
 *                   example: Uploaded media file successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     mediaFileName:
 *                       type: string
 *                       description: The name of the uploaded media file
 *                       example: media-file-name.jpg
 *       400:
 *         description: Bad Request. File not provided or invalid.
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
 *       500:
 *         description: Internal Server Error.
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
 *                   example: An error occurred while uploading the story
 */
router.post('/media', upload.single('file'), postMediaFile);

// Should be either the last endpoint in the file or changed to not conflict with other endpoints.
router.get('/:type?', getAllChats);
/**
 * @swagger
 * /chats/get-all-drafts:
 *   get:
 *     summary: Get all drafts
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of drafts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 */
router.get('/get-all-drafts', getAllDrafts);
/**
 * @swagger
 * /chats/{chatId}:
 *   get:
 *     summary: Retrieve a specific chat
 *     tags: [Chat]
 *     description: Retrieve the details of a specific chat by its ID, including its members.
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat to retrieve.
 *     responses:
 *       200:
 *         description: Chat retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Chat retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: The ID of the chat.
 *                           example: "648ac9dc36f5a1c5e84e6f7b"
 *                         isSeen:
 *                           type: boolean
 *                           description: Whether the chat is marked as seen.
 *                           example: true
 *                         members:
 *                           type: array
 *                           description: List of chat members.
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: The user ID of the member.
 *                               username:
 *                                 type: string
 *                                 description: Username of the member.
 *                               screenFirstName:
 *                                 type: string
 *                                 description: Screen first name of the member.
 *                               screenLastName:
 *                                 type: string
 *                                 description: Screen last name of the member.
 *                               phoneNumber:
 *                                 type: string
 *                                 description: Phone number of the member.
 *                               photo:
 *                                 type: string
 *                                 description: Profile photo URL of the member.
 *                               status:
 *                                 type: string
 *                                 description: Status of the member.
 *                               isAdmin:
 *                                 type: boolean
 *                                 description: Whether the member is an admin in the chat.
 *                               stories:
 *                                 type: array
 *                                 description: List of user stories.
 *                               blockedUsers:
 *                                 type: array
 *                                 description: List of blocked users by this member.
 *                         type:
 *                           type: string
 *                           description: The type of the chat (e.g., private, group, channel).
 *                           example: "private"
 *                         numberOfMembers:
 *                           type: number
 *                           description: Number of members in the chat.
 *       404:
 *         description: Chat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "No chat with the provided id"
 */
router.get('/:chatId', getChat);

/**
 * @swagger
 * /chats/get-draft:
 *   get:
 *     summary: Get a specific draft
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A draft's details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 */
router.get('/get-draft', getDraft);
export default router;
