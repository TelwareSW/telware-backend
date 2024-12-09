import fs from 'fs/promises';
import path from 'path';

const deleteFile = async (fileName: string | undefined) => {
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

export default deleteFile;
