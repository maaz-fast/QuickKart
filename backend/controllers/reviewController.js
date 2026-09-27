const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { logActivity } = require('../utils/activityLogger');

// Helper to recalculate average rating & count on Product
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const averageRating = numReviews > 0
    ? Number((reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews).toFixed(1))
    : 0;
  await Product.findByIdAndUpdate(productId, { averageRating, numReviews });
};

// @desc    Create or update product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createOrUpdateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) {
      res.status(400);
      throw new Error('Please provide rating and comment');
    }

    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      res.status(400);
      throw new Error('Rating must be an integer between 1 and 5');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check verified purchase (user has an order containing this product)
    const verifiedOrder = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
    });
    const isVerifiedPurchase = Boolean(verifiedOrder);

    // Check if user already reviewed this product
    let review = await Review.findOne({ product: productId, user: req.user._id });

    if (review) {
      review.rating = numRating;
      review.comment = comment.trim();
      review.isVerifiedPurchase = isVerifiedPurchase;
      await review.save();

      await logActivity(req.user, 'UPDATE_REVIEW', `Updated review for ${product.name}`, {
        productId,
        reviewId: review._id,
      });
    } else {
      review = await Review.create({
        product: productId,
        user: req.user._id,
        rating: numRating,
        comment: comment.trim(),
        isVerifiedPurchase,
      });

      await logActivity(req.user, 'CREATE_REVIEW', `Left a ${numRating}-star review on ${product.name}`, {
        productId,
        reviewId: review._id,
      });
    }

    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Review saved successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const { sortBy = 'newest', rating, page = 1, limit = 10 } = req.query;
    const productId = req.params.id;

    let sortOption = { createdAt: -1 };
    if (sortBy === 'highest') sortOption = { rating: -1, createdAt: -1 };
    if (sortBy === 'lowest') sortOption = { rating: 1, createdAt: -1 };

    const query = { product: productId };
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalCount = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalCount / Number(limit)) || 1;

    const reviews = await Review.find(query)
      .populate('user', 'name profileImage')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: reviews.length,
      totalCount,
      totalPages,
      currentPage: Number(page),
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    await logActivity(req.user, 'DELETE_REVIEW', `Deleted review for product`, {
      reviewId: req.params.id,
      productId,
    });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateReview,
  getProductReviews,
  deleteReview,
};
