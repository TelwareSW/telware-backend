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

router.use(protect);
router.get('/', getAllChats);
router.post('/', createChat);
router.get('/messages/:chatId', restrictToMembers, getMessages);
router.get('/', getAllChats);
router.get('/messages/:chatId', restrictToMembers, getMessages);

router.patch('/destruct/:chatId', restrictToMembers, enableSelfDestructing);
router.patch('/un-destruct/:chatId', restrictToMembers, disableSelfDestructing);
router.post('/media', upload.single('file'), postMediaFile);

router.get('/:type?', getAllChats);
router.get('/get-all-drafts', getAllDrafts);
router.get('/:chatId', getChat);
router.get('/get-draft', getDraft);
export default router;
