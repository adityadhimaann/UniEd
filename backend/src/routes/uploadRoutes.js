import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = express.Router();

// General file upload endpoint
router.post(
  '/',
  authenticate,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json(
        ApiResponse.error('No file uploaded', 400)
      );
    }

    // Return the file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json(
      ApiResponse.success(
        {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        'File uploaded successfully'
      )
    );
  })
);

export default router;
