const UserModel = require('../models/userModel');
const catchAsync = require('../ultils/CatchAsync');
const jwt = require('jsonwebtoken');
const CustomError = require('../ultils/CustomError');

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create(req.body);
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: '90 d',
  });
  res.status(200).json({
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
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
