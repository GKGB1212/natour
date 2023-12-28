const fs = require('fs');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const TourModel = require('../models/tourModel');
const { match } = require('assert');
const APIFeature = require('./../ultils/APIFeatures');

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

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeature(TourModel.find(), req.query).filter().fields();
    const tours = await features.queryMongoose;

    res.status(200).json({
      state: 'success',
      response: tours.length,
      tours: tours,
    });
  } catch (error) {
    res.status(404).json({
      state: 'Fail',
      message: error,
    });
  }
};
exports.getTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await TourModel.findById(id);
    res.status(200).json({
      state: 'success',
      tour,
    });
  } catch (error) {
    res.status(404).json({
      state: 'Fail',
      message: `Can't find out any tour with id = ${id}`,
    });
  }
};

exports.addNewTour = async (req, res) => {
  try {
    const newTour = await TourModel.create(req.body);
    res.status(200).json({
      state: 'success',
      tour: newTour,
    });
  } catch (error) {
    res.status(404).json({
      state: 'Fail',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await TourModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      state: 'success',
      tour,
    });
  } catch (error) {
    res.status(404).json({
      state: 'Fail',
      message: `Can't find out any tour with id = ${id}`,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await TourModel.deleteTour(req.params.id);
    res.status(200).json({
      state: 'success',
      data: null,
    });
  } catch (error) {
    res.status(200).json({
      state: 'success',
      data: null,
    });
  }
};
