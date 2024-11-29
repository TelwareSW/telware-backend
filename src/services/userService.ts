import AppError from '@base/errors/AppError';
import User from '@base/models/userModel';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import path from 'path';

const deletePictureFile = async (userId: mongoose.Types.ObjectId | string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('No User exists with this ID', 404);
  }

  const fileName = user.photo;
  if (!fileName || !fileName.trim()) return;

  const filePath = path.join(process.cwd(), 'src/public/media/', fileName);

  try {
    // Check if the file exists
    await fs.access(filePath);
    // Delete the file if it exists
    await fs.unlink(filePath);
  } catch (err: any) {
    // Ignore file not found errors (ENOENT)
    if (err.code !== 'ENOENT') {
      throw err; // Rethrow unexpected errors
    }
  }
};
export default deletePictureFile;
