const fs = require('fs');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const TourModel = require('../models/tourModel');
const APIFeature = require('./../ultils/APIFeatures');
const CustomError = require('../ultils/CustomError');
const catchAsync = require('../ultils/CatchAsync');

exports.checkID = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    res.status(400).json({
      state: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

exports.getTop5Tours = (req, res, next) => {
  req.query.limit = 5; //5 tour
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeature(TourModel.find(), req.query).filter().fields();
  const tours = await features.queryMongoose;

  res.status(200).json({
    state: 'success',
    response: tours.length,
    tours: tours,
  });
});
//hàm thống kê tour
exports.getTourStats = catchAsync(async (req, res, next) => {
  const query = TourModel.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
  ]);
  const stats = await await query;
  res.status(200).json({
    state: 'success',
    stats,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await TourModel.findById(id);
  if (!tour) {
    return next(new CustomError(`Can't find out any tour with id = ${id}`, 404));
  }
  res.status(200).json({
    state: 'success',
    tour,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  console.log(year);
  const monthlyPlan = await TourModel.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStart: -1 },
    },
    {
      $limit: 12,
    },
    // {
    //   $group: {
    //     _id: {
    //       $month: '$startDates',
    //       numTourStart: { $sum: 1 },
    //       tours: { $push: '$name' },
    //     },
    //   },
    // },
  ]);
  res.status(200).json({
    monthlyPlan,
  });
});

exports.addNewTour = catchAsync(async (req, res, next) => {
  const newTour = await TourModel.create(req.body);
  res.status(200).json({
    state: 'success',
    tour: newTour,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await TourModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new CustomError(`Can't find out any tour with id = ${id}`, 404));
  }
  res.status(200).json({
    state: 'success',
    tour,
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await TourModel.findByIdAndDelete(req.params.id);
  res.status(200).json({
    state: 'success',
    data: null,
  });
});
