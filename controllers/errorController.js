const CustomError = require('../ultils/CustomError');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}:${error.value}`;
  return new CustomError(message, 404);
};
const handleDuplicateFieldsDB = (error) => {
  const value = error.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new CustomError(message, 400);
};
const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = errors.join(', ');
  return new CustomError(message, 400);
};
const sendErrorDev = (res, error) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    isOperational: error.isOperational,
    error: error,
    stack: error.stack,
  });
};
const sendErrorPro = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
    ////Nếu là lỗi developerment thì giấu đi
  } else {
    //1.LOG LỖI RA
    console.log(error);
    //2.CHUYỂN SANG MỘT MÃ LỖI KHÁC
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!!',
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, err);
  } else {
    let error;
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    //invalid field value
    if (err.name == 'ValidationError') error = handleValidationErrorDB(err);
    if (error) sendErrorPro(res, error);
    else sendErrorDev(res, err);
  }
};
