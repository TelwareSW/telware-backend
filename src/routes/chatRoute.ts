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
router.patch('/privacy/:chatId', restrictTo('admin'), setPrivacy);

router.use(restrictTo());
router.patch('/picture/:chatId', upload.single('file'), updateChatPicture);
router.patch('/destruct/:chatId', enableSelfDestructing);
router.patch('/un-destruct/:chatId', disableSelfDestructing);
router.patch('/mute/:chatId', muteChat);
router.patch('/unmute/:chatId', unmuteChat);
router.get('/messages/:chatId', getMessages);
router.get('/members/:chatId', getChatMembers);
router.get('/:chatId', getChat);

export default router;
