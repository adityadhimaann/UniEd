import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// Upload single file
router.post(
  '/',
  authenticate,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json(
        new ApiResponse(400, null, 'No file uploaded')
      );
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'messages');

    res.status(200).json(
      new ApiResponse(200, {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        size: result.size,
      }, 'File uploaded successfully')
    );
  })
);

export default router;
