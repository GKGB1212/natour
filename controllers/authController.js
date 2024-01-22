const UserModel = require('../models/userModel');
const catchAsync = require('../ultils/CatchAsync');
const jwt = require('jsonwebtoken');
const CustomError = require('../ultils/CustomError');
const { token } = require('morgan');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90 d',
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create(req.body);
  const token = signToken(newUser._id);
  res.status(200).json({
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1. Kiểm tra xem người dùng có truyền username, password vào không
  if (!email || !password) {
    return next(new CustomError('Please enter email and password!!!', 400));
  }
  //2.Kiểm tra xem người dùng có trong db không
  const currentUser = await UserModel.findOne({ email }).select('+password'); //phải thêm dấu + trước password bởi vì trong schema user ta đã khai báo slect:false với trường password
  console.log(password, currentUser.password);
  const match = await currentUser.checkCorrectPassword(password, currentUser.password);
  if (!currentUser || !match) {
    return next(new CustomError('Incorrect password or email!!!', 401));
  }
  //3. Tạo token và trả về người dùng
  let token = signToken(currentUser._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1.lấy token ra
  let token;
  if (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer')) {
    token = req.headers['authorization'].split(' ')[1];
  }
  if (!token) {
    return next(new CustomError('You are not login, please login and try again!!!', 401));
  }
  //2. kiem tra token co hop le hay khong
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decode);

  //3. kiem tra thong tin nguoi dung tu token
  const currentUser = await UserModel.findById(decode?.id);
  if (!currentUser) {
    return next(new CustomError('The user belonging this token does no longer exist'));
  }

  //4. Kiem tra lieu rang nguoi dung co thay doi mat khau sau khi gen token khong
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(new CustomError('User recently changed password! Please login again!!', 401));
  }
  next();
});
