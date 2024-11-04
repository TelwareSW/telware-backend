import { protect } from '@middlewares/authMiddleware';
import { viewStory } from '@controllers/storyController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *  name: Story
 *  description: The Story Managing API
 */

router.post('/:storyId/views', protect, viewStory);

export default router;
