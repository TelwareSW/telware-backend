import { Router } from 'express';
import authRouter from '@routes/authRoute';
import userRouter from '@routes/userRoute';
import storyRouter from '@base/routes/storyRoute';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/stories', storyRouter);

export default apiRouter;
