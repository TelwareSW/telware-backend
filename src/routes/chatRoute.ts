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
  deleteGroupChannel,
  leaveChat,
} from '@base/controllers/chatController';
import { protect } from '@base/middlewares/authMiddleware';
import upload from '@base/config/fileUploads';
import restrictTo from '@base/middlewares/chatMiddlewares';

const router = Router();

router.use(protect);
router.get('/', getAllChats);
router.post('/', createChat);
router.get('/messages/:chatId', restrictTo(), getMessages);

router.patch('/destruct/:chatId', restrictTo(), enableSelfDestructing);
router.patch('/un-destruct/:chatId', restrictTo(), disableSelfDestructing);
router.post('/media', upload.single('file'), postMediaFile);

router.get('/get-all-drafts', getAllDrafts);
router.get('/get-draft', getDraft);

router.get('/:chatId', restrictTo(), getChat);
router.delete('/:chatId', restrictTo('creator'), deleteGroupChannel);
router.delete('/chats/leave/:id', leaveChat);
export default router;
