const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const CustomError = require('./ultils/CustomError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//set security HTTP header
app.use(helmet());

//Limit requests from same API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 2, // Số lượng yêu cầu tối đa trong khoảng thời gian trên
  message: 'Too many request from this IP, please try again in 15 minutes!',
});
app.use('/api', limiter);

//thêm middleware để parse body của request
app.use(express.json({ limit: '10KB' }));

//middleware ngăn việc tấn công NoSQL
app.use(mongoSanitize());

//middleware ngăn chặn việc tấn công bằng xss
app.use(xss());

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

//3, router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new CustomError(`Can't find ${req.originalUrl} on this server`, 404));
});

//thêm middleware xử lí lỗi
app.use(globalErrorHandler);

module.exports = app;
