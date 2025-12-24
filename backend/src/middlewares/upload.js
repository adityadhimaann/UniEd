import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';
import { FILE_UPLOAD } from '../config/constants.js';

// Named export for upload
export { upload };

// Use memory storage instead of disk storage for cloud deployments
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (FILE_UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Invalid file type. Only images and documents are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_SIZE,
  },
});

// Error handler for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.badRequest('File too large. Maximum size is 5MB'));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(ApiError.badRequest('Too many files'));
    }
    return next(ApiError.badRequest(err.message));
  }
  next(err);
};

export default upload;
