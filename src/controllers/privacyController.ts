import catchAsync from '@utils/catchAsync';
import User from '@models/userModel';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import AppError from '@errors/AppError';

export const getBlockedUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const userId = req.user.id; // Blocker ID
    const userId ='671a7aad6d8b2991d75dfa12';

    const user = await User.findById(userId).populate('blockedUsers', 'username email');
    if (!user) {
      return next(new AppError('User not found',400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        blockedUsers: user.blockedUsers,
      },
    });
  }
);

export const block = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Request Params:", req.params); 
    // const userId = req.user.id; // Blocker ID
    const userId = '671a7aad6d8b2991d75dfa12'; // Hardcoded until middleware gets added
    const targetUserId = req.params.id; // User ID to block

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      console.log('Invalid ID');
      return next(new AppError('Invalid user ID',400));
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { blockedUsers: targetUserId } }, 
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('User not found');

      return next(new AppError('User not found',400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        blockedUsers: user.blockedUsers,
      },
    });
  }
);

export const unblock = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const userId = req.user.id; // Blocker ID
    const userId = '671a7aad6d8b2991d75dfa12'; // Hardcoded until middleware gets added
    const targetUserId = req.params.id; // User ID to unblock

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return next(new AppError('Invalid user ID',400));
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { blockedUsers: targetUserId } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('User not found',400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        blockedUsers: user.blockedUsers,
      },
    });
  }
);

export const switchReadRecieptsState = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = '671a7aad6d8b2991d75dfa12'; // Hardcoded until middleware gets added
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { readReceiptsEnablePrivacy: user.readReceiptsEnablePrivacy === "true" ? "false" : "true"} },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      throw new Error('User not found');
    }
    res.status(200).json({
      status: 'success',
      data: {
        readReceiptsEnablePrivacy: updatedUser.readReceiptsEnablePrivacy,
      },
    });
  }
);

export const changeStoriesPrivacy = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = '671a7aad6d8b2991d75dfa12'; // Hardcoded until middleware gets added
    const {privacy} = req.body;
    if (privacy !== "contacts" && privacy !== "everyone" 
      && privacy !== "nobody") {
      return next(new AppError('Invalid privacy option. Choose contacts, everyone, or nobody.', 400));
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { storiesPrivacy:privacy } },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new Error('User not found');
    }
    res.status(200).json({
      status: 'success',
      data: {
        storiesPrivacy: user.storiesPrivacy,
      },
    });
  }
);
export const changeLastSeenPrivacy = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = '671a7aad6d8b2991d75dfa12'; // Hardcoded until middleware gets added
    const {privacy} = req.body;
    if (privacy !== "contacts" && privacy !== "everyone" 
      && privacy !== "nobody") {
      return next(new AppError('Invalid privacy option. Choose contacts, everyone, or nobody.', 400));
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { lastSeenPrivacy:privacy } },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new Error('User not found');
    }
    res.status(200).json({
      status: 'success',
      data: {
        lastSeenPrivacy: user.lastSeenPrivacy,
      },
    });
  }
);
export const changeProfilePicturePrivacy = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = '671a7aad6d8b2991d75dfa12'; // Hardcoded until middleware gets added
    const {privacy} = req.body;
    if (privacy !== "contacts" && privacy !== "everyone" 
      && privacy !== "nobody") {
      return next(new AppError('Invalid privacy option. Choose contacts, everyone, or nobody.', 400));
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
      data: {
        picturePrivacy: user.picturePrivacy,
      },
    });
  }
);
export const changeInvitePermessionsePrivacy = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = '671a7aad6d8b2991d75dfa12'; // Hardcoded until middleware gets added
    const invitePermission = req.body.permission;
    
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
      data: {
        invitePermessionsPrivacy: user.invitePermessionsPrivacy,
      },
    });
  }
);
