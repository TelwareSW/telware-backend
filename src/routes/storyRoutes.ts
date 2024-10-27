import { viewStory } from '@base/controllers/storyController';
import { Router } from 'express';

const router = Router();

router.post('/:storyId/views', viewStory);

export default router;
