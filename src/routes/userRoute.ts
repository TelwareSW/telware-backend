import { Router } from 'express';
import userController from '@base/controllers/userController';

const userRouter = Router();

userRouter.get('/', userController.getAllUsers);
userRouter.get('/me', userController.getUser);
userRouter.get('/:id', userController.getUser);
userRouter.patch('/bio', userController.updateBio);

export default userRouter;
