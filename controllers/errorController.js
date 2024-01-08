const CustomError = require('../ultils/CustomError');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${path}:${value}`;
  return new CustomError(message, 404);
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
module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, error);
  } else if (process.env.NODE_ENV === 'production') {
    let err = { ...error };
    if ((error.name = 'CastError')) {
      err = handleCastErrorDB(err);
    }
    sendErrorPro(res, err);
  }
};
