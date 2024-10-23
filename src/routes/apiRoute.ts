import { Router } from 'express';
import authRouter from '@routes/authRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);

export default apiRouter;
