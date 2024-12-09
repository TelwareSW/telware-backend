import { Router } from 'express';
import {
  getAllChats,
  getMessages,
  postMediaFile,
  enableSelfDestructing,
  disableSelfDestructing,
  getAllDrafts,
  getDraft,
  getChat,
  setPrivacy,
  getChatMembers,
  muteChat,
  unmuteChat,
} from '@base/controllers/chatController';
import { protect } from '@base/middlewares/authMiddleware';
import upload from '@base/config/fileUploads';
import restrictTo from '@base/middlewares/chatMiddlewares';

const router = Router();

router.use(protect);
router.get('/', getAllChats);
router.get('/messages/:chatId', restrictTo(), getMessages);

router.patch('/destruct/:chatId', restrictTo(), enableSelfDestructing);
router.patch('/un-destruct/:chatId', restrictTo(), disableSelfDestructing);
router.post('/media', upload.single('file'), postMediaFile);

router.get('/get-all-drafts', getAllDrafts);
router.get('/get-draft', getDraft);

router.get('/:chatId', restrictTo(), getChat);
router.patch('/privacy/:chatId', restrictTo('admin'), setPrivacy);
router.get('/members/:chatId', restrictTo(), getChatMembers);
router.patch('/mute/:chatId', restrictTo(), muteChat);
router.patch('/unmute/:chatId', restrictTo(), unmuteChat);

export default router;
