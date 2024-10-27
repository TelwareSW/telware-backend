import { Router } from 'express';
import authRouter from '@routes/authRoutes';
import userRouter from '@routes/userRoutes';
import storyRouter from '@routes/storyRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/stories', storyRouter);

export default apiRouter;
