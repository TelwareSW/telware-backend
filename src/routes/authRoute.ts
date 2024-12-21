import { Router } from 'express';
import {
  signup,
  sendConfirmationCode,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  logoutOthers,
  logoutAll,
  changePassword,
  logoutSession,
  getLogedInSessions,
  getCurrentSession,
} from '@controllers/authController';
import { protect , isActive } from '@middlewares/authMiddleware';
import oauthRouter from '@base/routes/oauthRoute';

const router = Router();

router.use('/oauth', oauthRouter);

router.post('/signup', signup);

router.post('/login', login);
router.post('/send-confirmation', sendConfirmationCode);
router.post('/verify', verifyEmail);
router.post('/password/forget', forgotPassword);
router.patch('/password/reset/:token', resetPassword);

router.use(protect);
router.patch('/password/change', protect, changePassword);

router.use(isActive);
router.get('/me', getCurrentSession);
router.get('/sessions', getLogedInSessions);
router.post('/logout', logoutSession);
router.post('/logout/all', logoutAll);
router.post('/logout/others', logoutOthers);

export default router;
