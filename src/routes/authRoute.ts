import { Router } from 'express';
import {
  signup,
  sendConfirmationCode,
  verifyEmail,
  login,
} from '@controllers/authController';
import oauthRouter from '@base/routes/oauthRoute';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/send-confirmation', sendConfirmationCode);
router.post('/verify', verifyEmail);
router.use('/oauth', oauthRouter);

export default router;
