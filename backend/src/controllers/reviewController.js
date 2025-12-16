import reviewService from '../services/reviewService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createReview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { content, rating, role, name, image } = req.body;

  const review = await reviewService.createReview(userId, {
    content,
    rating,
    role,
    name: name || `${req.user.profile.firstName} ${req.user.profile.lastName}`,
    image: image || req.user.profile.avatar || '',
  });

  res.status(201).json(
    ApiResponse.success(
      review,
      'Review submitted successfully. It will be published after admin approval.'
    )
  );
});

export const getPublishedReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getPublishedReviews();

  res.json(ApiResponse.success(reviews, 'Reviews fetched successfully'));
});

export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getAllReviews();

  res.json(ApiResponse.success(reviews, 'All reviews fetched successfully'));
});

export const approveReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await reviewService.approveReview(reviewId);

  res.json(ApiResponse.success(review, 'Review approved and published'));
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';

  const result = await reviewService.deleteReview(reviewId, userId, isAdmin);

  res.json(ApiResponse.success(result, 'Review deleted successfully'));
});

export const getUserReview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const review = await reviewService.getUserReview(userId);

  res.json(ApiResponse.success(review, 'User review fetched successfully'));
});
