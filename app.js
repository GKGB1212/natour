const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//thêm middleware để parse body của request
app.use(express.json());

//thêm middleware để log
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
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

//3, router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
