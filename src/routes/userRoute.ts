import { Router } from 'express';
import upload from '@config/file_uploads';
import privacyRouter from '@routes/privacyRoute';
import {
  block,
  getBlockedUsers,
  unblock,
} from '@controllers/privacyController';
import {
  getAllUsers,
  getUser,
  updateBio,
  updateEmail,
  updatePhoneNumber,
  updateScreenName,
  updateUsername,
} from '@controllers/userController';
import {
  deleteStory,
  getCurrentUserStory,
  getStory,
  postStory,
} from '@controllers/storyController';

const router = Router();

router.use('/privacy', privacyRouter);

// User routes
router.get('/', getAllUsers);
router.get('/me', getUser);
router.get('/:id', getUser);
router.patch('/bio', updateBio);
router.patch('/phone', updatePhoneNumber);
router.patch('/email', updateEmail);
router.patch('/username', updateUsername);
router.patch('/screen-name', updateScreenName);

// Block settings
router.get('/block', getBlockedUsers);
router.post('/block/:id', block);
router.delete('/block/:id', unblock);

// Stories routes
router.get('/me/stories', getCurrentUserStory);
router.post('/me/stories', upload.single('file'), postStory);
router.delete('/me/stories/:storyId', deleteStory);
router.get('/:userId/stories', getStory);

export default router;
