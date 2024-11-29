import { Router } from 'express';
import {
  createChat,
  getAllChats,
  getMessages,
} from '@base/controllers/chatController';
import { protect } from '@base/middlewares/authMiddleware';
import restrictToMembers from '@base/middlewares/chatMiddlewares';

const router = Router();

router.use(protect);

router.post('/', createChat);
router.get('/:type?', getAllChats);
router.get('/messages/:chatId', restrictToMembers, getMessages);

export default router;
