import express from 'express';
import {
  signup,
  sendConfirmationCode,
  verifyEmail,
} from '@controllers/authController';

const router = express.Router();

router.post('/signup', signup);
router.post('/send-confirmation', sendConfirmationCode);
router.post('/verify', verifyEmail);
export default router;
