import express from 'express';
import { block, switchReadRecieptsState, getBlockedUsers, unblock,changeStoriesPrivacy,
        changeLastSeenPrivacy,changeProfilePicturePrivacy,changeInvitePermessionsePrivacy} from '@controllers/privacyController';

const router = express.Router();


router.get('/block', getBlockedUsers);
router.post('/block/:id', block);
router.patch('/privacy/read-receipts', switchReadRecieptsState);
router.patch('/privacy/stories', changeStoriesPrivacy);
router.patch('/privacy/last-seen', changeLastSeenPrivacy);
router.patch('/privacy/profile-picture', changeProfilePicturePrivacy);
router.patch('/privacy/invite-permissions', changeInvitePermessionsePrivacy);
router.delete('/block/:id', unblock);

export default router;
