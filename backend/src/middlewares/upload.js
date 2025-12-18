import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import ApiError from '../utils/ApiError.js';
import { FILE_UPLOAD } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Named export for upload
export { upload };

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

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
