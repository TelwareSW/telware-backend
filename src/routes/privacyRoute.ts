import { Router } from 'express';
import {
  switchReadRecieptsState,
  changeStoriesPrivacy,
  changeLastSeenPrivacy,
  changeProfilePicturePrivacy,
  changeInvitePermessionsePrivacy,
} from '@controllers/privacyController';

const router = Router();

/**
 * @swagger
 * tags:
 *  name: Privacy
 *  description: The Privacy Managing API
 */

router.patch('/read-receipts', switchReadRecieptsState);
router.patch('/stories', changeStoriesPrivacy);
router.patch('/last-seen', changeLastSeenPrivacy);
router.patch('/picture', changeProfilePicturePrivacy);
router.patch('/invite-permissions', changeInvitePermessionsePrivacy);

export default router;
