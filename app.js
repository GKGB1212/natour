const { error } = require('console');
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

const getAllTours = (req, res) => {
  res.status(200).json({
    state: 'success',
    response: tours.length,
    tours: tours,
  });
};
const getTour = (req, res) => {
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
const addNewTour = (req, res) => {
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

const updateTour = (req, res) => {
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
/*
//get all tours
app.get('/api/v1/tours', getAllTours);
//get tour by id
app.get('/api/v1/tours/:id', getTour);
//add new tour
app.post('/api/v1/tours', addNewTour);
//update tour
app.patch('/api/v1/tours/:id', updateTour);
*/

app.route('/api/v1/tours').get(getAllTours).post(addNewTour);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
