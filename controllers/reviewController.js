const ReviewModel = require('../models/reviewModel');
const catchAsync = require('../ultils/CatchAsync');

exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await ReviewModel.find().populate('user');
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res) => {
  const newReview = await ReviewModel.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});
