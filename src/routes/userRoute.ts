import { Router } from 'express';
import upload from '@base/config/fileUploads';
import privacyRouter from '@routes/privacyRoute';
import { block, getBlockedUsers, unblock } from '@controllers/privacyController';
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

// Stories routes
router.get('/stories', getCurrentUserStory);
router.post('/stories', upload.single('file'), postStory);
router.delete('/stories/:storyId', deleteStory);
router.get('/:userId/stories', getStory);

// Block settings
router.get('/block', getBlockedUsers);
router.post('/block/:id', block);
router.delete('/block/:id', unblock);

// User routes
router.get('/', getAllUsers);
router.get('/me', getUser);
router.get('/:id', getUser);
router.patch('/bio', updateBio);
router.patch('/phone', updatePhoneNumber);
router.patch('/email', updateEmail);
router.patch('/username', updateUsername);
router.patch('/screen-name', updateScreenName);

export default router;
