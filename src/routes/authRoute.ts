import { Router } from 'express';
import {
  signup,
  sendConfirmationCode,
  verifyEmail,
  login,
  refresh,
  isLoggedIn,
  forgotPassword,
  resetPassword,
  logout,
  logoutOthers,
  logoutAll,
} from '@controllers/authController';
import {protect} from '@middlewares/authMiddleware';
import oauthRouter from '@base/routes/oauthRoute';

const router = Router();

router.use('/oauth', oauthRouter);

router.post('/signup', signup);
router.post('/login', login);
router.post('/send-confirmation', sendConfirmationCode);
router.post('/verify', verifyEmail);
router.post('/refresh', protect, refresh);
router.get('/me', protect, isLoggedIn);

router.post('/password/forget', forgotPassword);
router.post('/password/reset/:token', resetPassword);

router.post('/logout', protect, logout);
router.post('/logout/all', protect, logoutAll);
router.post('/logout/others', protect, logoutOthers);

export default router;
