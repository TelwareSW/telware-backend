import { Router } from 'express';
import { createChat, getAllChats } from '@base/controllers/chatController';
import { protect } from '@base/middlewares/authMiddleware';

const router = Router();
router.use(protect);

router.post('/', createChat);
router.get('/', getAllChats);

export default router;
