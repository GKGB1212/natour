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
app.all('*', (req, res, next) => {
  // res.status(400).json({
  //   error: true,
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
  console.log('da vao');
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  err.status = 'fail';
  err.statusCode = 400;
  next(err);
});

app.use((error, req, res, next) => {
  console.log('da vao1', error);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});
module.exports = app;
