import { Router } from 'express';
import userController from '@base/controllers/userController';

const userRouter = Router();

userRouter.get('/', userController.getAllUsers);
userRouter.get('/me', userController.getUser);
userRouter.get('/:id', userController.getUser);
userRouter.patch('/bio', userController.updateBio);
userRouter.patch('/phone', userController.updatePhoneNumber);
userRouter.patch('/email', userController.updateEmail);
userRouter.patch('/username', userController.updateUsername);
userRouter.patch('/screen-name', userController.updateScreenName);

export default userRouter;
