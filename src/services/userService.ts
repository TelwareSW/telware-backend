import AppError from '@base/errors/AppError';
import User from '@base/models/userModel';
import { unlink } from 'fs/promises';
import mongoose from 'mongoose';
import path from 'path';

const deletePictureFile = async (userId: mongoose.Types.ObjectId | string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  const fileName = user.photo;
  if (!fileName || !fileName.trim()) return;

  await unlink(path.join(process.cwd(), 'src/public/media/', fileName));
};

export default deletePictureFile;
