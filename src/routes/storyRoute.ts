import { protect } from '@middlewares/authMiddleware';
import { viewStory } from '@controllers/storyController';
import { Router } from 'express';

const router = Router();

router.post('/:storyId/views', protect, viewStory);

export default router;
