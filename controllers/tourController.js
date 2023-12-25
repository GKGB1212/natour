const fs = require('fs');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const TourModel = require('../models/tourModel');

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
exports.getAllTours = async (req, res) => {
  try {
    const tours = await TourModel.find();
    res.status(200).json({
      state: 'success',
      response: tours.length,
      tours: tours,
    });
  } catch (error) {
    res.status(404).json({
      state: 'Fail',
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
  // const tour = tours.find((el) => el.id === id * 1);
  // if (!tour) {
  //   res.status(404).json({
  //     state: 'Fail',
  //     message: `Can't find out any tour with id = ${id}`,
  //   });
  // } else {
  //   res.status(200).json({
  //     state: 'success',
  //     tour,
  //   });
  // }
};
