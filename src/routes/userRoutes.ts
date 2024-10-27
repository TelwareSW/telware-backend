import { Router } from 'express';
import upload from '@base/config/file_uploads';
import {
  block,
  switchReadRecieptsState,
  getBlockedUsers,
  unblock,
  changeStoriesPrivacy,
  changeLastSeenPrivacy,
  changeProfilePicturePrivacy,
  changeInvitePermessionsePrivacy,
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
import { deleteStory, getCurrentUserStory, postStory } from '@base/controllers/storyController';

const router = Router();

// User routes
router.get('/', getAllUsers);
router.get('/me', getUser);
router.get('/:id', getUser);
router.patch('/bio', updateBio);
router.patch('/phone', updatePhoneNumber);
router.patch('/email', updateEmail);
router.patch('/username', updateUsername);
router.patch('/screen-name', updateScreenName);

// Privacy settings
router.get('/block', getBlockedUsers);
router.post('/block/:id', block);
router.patch('/privacy/read-receipts', switchReadRecieptsState);
router.patch('/privacy/stories', changeStoriesPrivacy);
router.patch('/privacy/last-seen', changeLastSeenPrivacy);
router.patch('/privacy/profile-picture', changeProfilePicturePrivacy);
router.patch('/privacy/invite-permissions', changeInvitePermessionsePrivacy);
router.delete('/block/:id', unblock);

// Stories routes
router.get('/me/stories', getCurrentUserStory);
router.post('/me/stories', upload.single('file'), postStory);
router.delete('/me/stories/:storyId', deleteStory);
router.get('/:userId/stories');

export default router;
