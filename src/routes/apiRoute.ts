import { Router } from 'express';
import authRouter from '@routes/authRoutes';
import userRouter from '@routes/userRoute';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);

apiRouter.use('/users', userRouter);

export default apiRouter;
