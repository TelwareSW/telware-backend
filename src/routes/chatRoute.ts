import { Router } from 'express';
import {
  createChat,
  getAllChats,
  getMessages,
  postMediaFile,
  enableSelfDestructing,
  disableSelfDestructing,
  getAllDrafts,
  getDraft
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

router.post('/', createChat);
router.get('/messages/:chatId', restrictToMembers, getMessages);
router.patch('/destruct/:chatId', restrictToMembers, enableSelfDestructing);
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
