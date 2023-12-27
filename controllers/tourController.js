const fs = require('fs');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const TourModel = require('../models/tourModel');
const { match } = require('assert');

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
    //1, lấy query object từ request
    let queryObj = { ...req.query };

    //2, xử lí query object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //2b, xử lí query cho lte, lt, gte, gt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //3, tạo câu query
    let query = TourModel.find(JSON.parse(queryStr));

    //4, sorting (request sort sẽ có cấu trúc như này: 'http://localhost:3000/api/v1/tours?sort=name,price,maxGroupSize')
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    //5, giới hạn field lấy lên
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    //6, phân trang
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    //xử lí nếu trang quá lố
    if (req.query.page) {
      const countTour = await TourModel.countDocuments();
      if (skip > countTour) throw new Error('quá lố rùi');
    }

    //7, thực thi câu query
    const tours = await query;
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
