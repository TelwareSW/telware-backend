import AppError from '@base/errors/AppError';
import User from '@base/models/userModel';
import catchAsync from '@base/utils/catchAsync';
import { Request, Response } from 'express';
import deletePictureFile from '@base/services/userService';
import IUser from '@base/types/user';
import GroupChannel from '@base/models/groupChannelModel';

interface GetUser extends Request {
  params: {
    userId?: string;
  };
  user: IUser;
  //TODO: add a user here that would contain the user data.
}

export const getCurrentUser = catchAsync(
  async (req: GetUser, res: Response) => {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('No User exists with this ID', 404);
    }
    return res.status(200).json({
      status: 'success',
      message: 'User retrieved successfuly',
      data: {
        user,
      },
    });
  }
);

export const updateCurrentUser = catchAsync(async (req: any, res: Response) => {
  const userData = req.body;
  const userId = req.user.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { ...userData },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }
  return res.status(200).json({
    status: 'success',
    message: 'User data updated successfuly',
    data: {},
  });
});

export const getCheckUserName = catchAsync(async (req: any, res: Response) => {
  const { username } = req.query;

  const user = new User({
    username,
    screenFirstName: 'temp',
    password: 12345678,
    passwordConfirm: 12345678,
  });

  await user.validate();

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    throw new AppError('Username already exists', 409);
  }

  return res.status(200).json({
    status: 'success',
    message: 'Username is unique',
    data: {},
  });
});

export const getUser = catchAsync(async (req: GetUser, res: Response) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  const fieldsToGet = [
    'username',
    'screenFirstName',
    'screenLastName',
    'email',
    'status',
    'bio',
  ];

  if (
    user.picturePrivacy === 'everyone' ||
    (user.picturePrivacy === 'contacts' && user.contacts.includes(req.user.id))
  ) {
    fieldsToGet.push('photo');
  }

  const userData = await User.findById(userId, fieldsToGet.join(' '));

  return res.status(200).json({
    status: 'success',
    message: 'User retrieved successfuly',
    data: {
      user: userData,
    },
  });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.find(
    {},
    'username screenFirstName screenLastName email photo status bio accountStatus'
  );

  return res.status(200).json({
    status: 'success',
    message: 'Users retrieved successfuly',
    data: {
      users,
    },
  });
});

export const updateBio = catchAsync(async (req: any, res: Response) => {
  const { bio } = req.body;
  const userId = req.user.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { bio },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(200).json({
    status: 'success',
    message: 'User bio updated successfuly',
    data: {},
  });
});

export const updatePhoneNumber = catchAsync(async (req: any, res: Response) => {
  const { phoneNumber } = req.body;
  const userId = req.user.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { phoneNumber },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(200).json({
    status: 'success',
    message: 'User phoneNumber updated successfuly',
    data: {},
  });
});

export const updateEmail = catchAsync(async (req: any, res: Response) => {
  const { email } = req.body;
  const userId = req.user.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { email },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(200).json({
    status: 'success',
    message: 'User email updated successfuly',
    data: {},
  });
});

export const updateUsername = catchAsync(async (req: any, res: Response) => {
  const { username } = req.body;
  const userId = req.user.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { username },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(200).json({
    status: 'success',
    message: 'User username updated successfuly',
    data: {},
  });
});

export const updateScreenName = catchAsync(async (req: any, res: Response) => {
  const { screenFirstName, screenLastName } = req.body;
  const userId = req.user.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { screenFirstName, screenLastName },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(200).json({
    status: 'success',
    message: 'User screenFirstName and screenLastName updated successfuly',
    data: {},
  });
});

export const updatePicture = catchAsync(async (req: any, res: Response) => {
  const userId = req.user.id;

  if (!req.file) {
    throw new AppError('An error occured while uploading the story', 500);
  }

  await deletePictureFile(userId);

  const user = await User.findByIdAndUpdate(
    userId,
    { photo: req.file.filename },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(201).json({
    status: 'success',
    message: 'User profile picture updated successfuly',
    data: {},
  });
});

export const deletePicture = catchAsync(async (req: any, res: Response) => {
  const userId = req.user.id;

  await deletePictureFile(userId);

  const user = await User.findByIdAndUpdate(
    userId,
    { photo: '' },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(204).json({
    status: 'success',
    message: 'User profile picture deleted successfuly',
    data: {},
  });
});

export const getAllGroups = catchAsync(async (req: Request, res: Response) => {
  const groupsAndChannels = await GroupChannel.find(); // Use `find()` in Mongoose to retrieve all documents

  return res.status(200).json({
    status: 'success',
    message: 'Groups and Channels retrieved successfully',
    data: {
      groupsAndChannels,
    },
  });
});

export const toggleAutomaticDownload = catchAsync(
  async (req: any, res: Response) => {
    const userId = req.user.id;
    const { enabled } = req.body;

    User.findByIdAndUpdate(userId, { automaticDownloadEnable: enabled });
    return res.status(200).json({
      status: 'success',
      message: 'Automatic download settings updated successfully',
      data: {},
    });
  }
);

export const activateUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }
  if (user.accountStatus === 'banned') {
    return res.status(400).json({
      status: 'fail',
      message: 'User is Banned',
    });
  }
  user.accountStatus = 'active';
  await user.save();

  return res.status(200).json({
    status: 'success',
    message: 'User activated successfully',
  });
});

export const deactivateUser = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    user.accountStatus = 'deactivated';
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'User deactivated successfully',
    });
  }
);

export const banUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }

  user.accountStatus = 'banned';
  await user.save();

  return res.status(200).json({
    status: 'success',
    message: 'User banned successfully',
  });
});

export const updateFCMToken = catchAsync(async (req: any, res: Response) => {
  const userId = req.user.id;
  const { fcmToken } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { fcmToken },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  return res.status(201).json({
    status: 'success',
    message: 'User fcm token updated successfuly',
    data: {},
  });
});
