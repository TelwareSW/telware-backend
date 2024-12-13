import { Router } from 'express';
import authRouter from '@routes/authRoute';
import userRouter from '@routes/userRoute';
import storyRouter from '@base/routes/storyRoute';
import chatRouter from '@base/routes/chatRoute';
import searchRouter from '@base/routes/searchRoute'

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/stories', storyRouter);
apiRouter.use('/chats', chatRouter);
apiRouter.use('/search', searchRouter);

export default apiRouter;
