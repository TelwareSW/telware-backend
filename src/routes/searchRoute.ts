import { Router } from 'express';
import {
    searchMessages,
} from '@controllers/searchController';
import { protect } from '@base/middlewares/authMiddleware';
import restrictTo from '@base/middlewares/chatMiddlewares';

const router = Router();
router.use(protect);
router.post('/search-request',searchMessages);

export default router;
