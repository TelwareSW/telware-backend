import catchAsync from '@utils/catchAsync';
import User from '@models/userModel';
import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import AppError from '@errors/AppError';

export const getBlockedUsers = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id; // Blocker ID

    const user = await User.findById(userId).populate(
      'blockedUsers',
      'username email'
    );
    if (!user) {
      return next(new AppError('User not found', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'Blocked users fetched successfully',
      data: {
        users: user.blockedUsers,
      },
    });
  }
);

export const block = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id; // Blocker ID
    const targetUserId = req.params.id; // User ID to block

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      console.log('Invalid ID');
      return next(new AppError('Invalid user ID', 400));
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { blockedUsers: targetUserId } },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('User not found');

      return next(new AppError('User not found', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'User blocked successfully',
      data: {
        users: user.blockedUsers,
      },
    });
  }
);

export const unblock = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const targetUserId = req.params.id; // User ID to unblock

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return next(new AppError('Invalid user ID', 400));
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { blockedUsers: targetUserId } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('User not found', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'User unblocked successfullly',
      data: {
        users: user.blockedUsers,
      },
    });
  }
);

export const switchReadRecieptsState = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { readReceiptsEnablePrivacy: !user.readReceiptsEnablePrivacy } },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      throw new Error('User not found');
    }
    res.status(200).json({
      status: 'success',
      message: 'Read receipts privacy updated successfully',
      data: {},
    });
  }
);

export const changeStoriesPrivacy = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const { privacy } = req.body;
    if (
      privacy !== 'contacts' &&
      privacy !== 'everyone' &&
      privacy !== 'nobody'
    ) {
      return next(
        new AppError(
          'Invalid privacy option. Choose contacts, everyone, or nobody.',
          400
        )
      );
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { storiesPrivacy: privacy } },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new Error('User not found');
    }
    res.status(200).json({
      status: 'success',
      message: 'Stories privacy updated successfully',
      data: {},
    });
  }
);
export const changeLastSeenPrivacy = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const { privacy } = req.body;
    if (
      privacy !== 'contacts' &&
      privacy !== 'everyone' &&
      privacy !== 'nobody'
    ) {
      return next(
        new AppError(
          'Invalid privacy option. Choose contacts, everyone, or nobody.',
          400
        )
      );
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { lastSeenPrivacy: privacy } },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new Error('User not found');
    }
    res.status(200).json({
      status: 'success',
      message: 'Last seen privacy updated successfully',
      data: {},
    });
  }
);
export const changeProfilePicturePrivacy = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const { privacy } = req.body;
    if (
      privacy !== 'contacts' &&
      privacy !== 'everyone' &&
      privacy !== 'nobody'
    ) {
      return next(
        new AppError(
          'Invalid privacy option. Choose contacts, everyone, or nobody.',
          400
        )
      );
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { picturePrivacy: privacy } },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new Error('User not found');
    }
    res.status(200).json({
      status: 'success',
      message: 'Profile picture privacy updated successfully',
      data: {},
    });
  }
);
export const changeInvitePermessionsePrivacy = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const invitePermission = req.body.privacy;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { invitePermessionsPrivacy: invitePermission } },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new Error('User not found');
    }
    res.status(200).json({
      status: 'success',
      message: 'Invite permissions privacy updated successfully',
      data: {},
    });
  }
);
