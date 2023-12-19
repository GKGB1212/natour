const fs = require('fs');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

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
exports.getAllTours = (req, res) => {
  res.status(200).json({
    state: 'success',
    response: tours.length,
    tours: tours,
  });
};
exports.getTour = (req, res) => {
  const { id } = req.params;
  const tour = tours.find((el) => el.id === id * 1);
  if (!tour) {
    res.status(404).json({
      state: 'Fail',
      message: `Can't find out any tour with id = ${id}`,
    });
  } else {
    res.status(200).json({
      state: 'success',
      tour,
    });
  }
};
exports.addNewTour = (req, res) => {
  const id = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: id }, req.body);
  tours.push(newTour);
  //ghi tour mới vào file tour
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (error) => {
    res.status(201).json({
      state: 'success',
      tour: newTour,
    });
  });
};

exports.updateTour = (req, res) => {
  const { id } = req.params;
  const tour = tours.find((el) => el.id === id * 1);
  if (!tour) {
    res.status(404).json({
      state: 'Fail',
      message: `Can't find out any tour with id = ${id}`,
    });
  } else {
    res.status(200).json({
      state: 'success',
      tour,
    });
  }
};
