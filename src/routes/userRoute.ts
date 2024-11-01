import { Router } from 'express';
import upload from '@base/config/fileUploads';
import privacyRouter from '@routes/privacyRoute';
import { block, getBlockedUsers, unblock } from '@controllers/privacyController';
import {
  deletePicture,
  getAllUsers,
  getCurrentUser,
  getUser,
  updateBio,
  updateCurrentUser,
  updateEmail,
  updatePhoneNumber,
  updatePicture,
  updateScreenName,
  updateUsername,
} from '@controllers/userController';
import {
  deleteStory,
  getCurrentUserStory,
  getStory,
  postStory,
} from '@controllers/storyController';
import { protect } from '@middlewares/authMiddleware';

const router = Router();

router.use(protect);
router.use('/privacy', privacyRouter);

// Stories routes
router.get('/stories', getCurrentUserStory);
router.post('/stories', upload.single('file'), postStory);
router.delete('/stories/:storyId', deleteStory);

// Block settings
router.get('/block', getBlockedUsers);
router.post('/block/:id', block);
router.delete('/block/:id', unblock);

// User routes
router.get('/', getAllUsers);
router.get('/me', getCurrentUser);
router.patch('/me', updateCurrentUser);
router.patch('/bio', updateBio);
router.patch('/phone', updatePhoneNumber);
router.patch('/email', updateEmail);
router.patch('/username', updateUsername);
router.patch('/screen-name', updateScreenName);
router.patch('/picture', upload.single('file'), updatePicture);
router.delete('/picture', deletePicture);

// conflicting routes
router.get('/:userId', getUser);
router.get('/:userId/stories', getStory);

export default router;
