import { Router } from 'express';
import {
  getAllChats,
  getMessages,
  postMediaFile,
  enableSelfDestructing,
  disableSelfDestructing,
  getChat,
  setPrivacy,
  getChatMembers,
  muteChat,
  unmuteChat,
  updateChatPicture,
} from '@base/controllers/chatController';
import { protect } from '@base/middlewares/authMiddleware';
import upload from '@base/config/fileUploads';
import restrictTo from '@base/middlewares/chatMiddlewares';

const router = Router();

router.use(protect);
router.get('/', getAllChats);
router.post('/media', upload.single('file'), postMediaFile);
router.patch('/picture/:chatId', restrictTo(), upload.single('file'), updateChatPicture);

router.patch('/privacy/:chatId', restrictTo('admin'), setPrivacy);
router.patch('/destruct/:chatId', restrictTo(), enableSelfDestructing);
router.patch('/un-destruct/:chatId', restrictTo(), disableSelfDestructing);
router.patch('/mute/:chatId', restrictTo(), muteChat);
router.patch('/unmute/:chatId', restrictTo(), unmuteChat);

router.get('/messages/:chatId', restrictTo(), getMessages);
router.get('/members/:chatId', restrictTo(), getChatMembers);
router.get('/:chatId', restrictTo(), getChat);

export default router;
