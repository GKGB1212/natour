const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const CustomError = require('./ultils/CustomError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//thêm middleware để parse body của request
app.use(express.json());
//thêm middleware để log
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 2, // Số lượng yêu cầu tối đa trong khoảng thời gian trên
  message: 'Too many request from this IP, please try again in 15 minutes!',
});

app.use('/api', limiter);

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//3, router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new CustomError(`Can't find ${req.originalUrl} on this server`, 404));
});

//thêm middleware xử lí lỗi
app.use(globalErrorHandler);

module.exports = app;

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
