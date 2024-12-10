import AppError from '@base/errors/AppError';
import User from '@base/models/userModel';
import deleteFile from '@base/utils/deleteFile';
import mongoose from 'mongoose';

const deletePictureFile = async (userId: mongoose.Types.ObjectId | string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  const fileName = user.photo;
  await deleteFile(fileName);
};
export default deletePictureFile;
