import Review from '../models/Review.js';
import ApiError from '../utils/ApiError.js';

class ReviewService {
  async createReview(userId, reviewData) {
    const { content, rating, role } = reviewData;

    // Check if user already has a review
    const existingReview = await Review.findOne({ user: userId });
    if (existingReview) {
      throw ApiError.badRequest('You have already submitted a review');
    }

    const review = await Review.create({
      user: userId,
      name: reviewData.name,
      role,
      content,
      rating,
      image: reviewData.image || '',
      isApproved: false, // Admin needs to approve
      isPublished: false,
    });

    return review;
  }

  async getPublishedReviews() {
    const reviews = await Review.find({ 
      isPublished: true,
      isApproved: true 
    })
      .sort({ createdAt: -1 })
      .select('-user -isApproved -isPublished')
      .lean();

    return reviews;
  }

  async getAllReviews() {
    // For admin use
    const reviews = await Review.find()
      .populate('user', 'email profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .lean();

    return reviews;
  }

  async approveReview(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    review.isApproved = true;
    review.isPublished = true;
    await review.save();

    return review;
  }

  async deleteReview(reviewId, userId, isAdmin = false) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    // Only allow user to delete their own review or admin to delete any
    if (!isAdmin && review.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only delete your own review');
    }

    await review.deleteOne();
    return { message: 'Review deleted successfully' };
  }

  async getUserReview(userId) {
    const review = await Review.findOne({ user: userId }).lean();
    return review;
  }
}

export default new ReviewService();
