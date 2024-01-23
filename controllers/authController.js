const UserModel = require('../models/userModel');
const catchAsync = require('../ultils/CatchAsync');
const jwt = require('jsonwebtoken');
const CustomError = require('../ultils/CustomError');
const { token } = require('morgan');
const sentEmail = require('../ultils/Email1');
const crypto = require('crypto');

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
  const match = await currentUser.checkCorrectPassword(
    password,
    currentUser.password
  );
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
  if (
    req.headers['authorization'] &&
    req.headers['authorization'].startsWith('Bearer')
  ) {
    token = req.headers['authorization'].split(' ')[1];
  }
  if (!token) {
    return next(
      new CustomError('You are not login, please login and try again!!!', 401)
    );
  }
  //2. kiem tra token co hop le hay khong
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decode);

  //3. kiem tra thong tin nguoi dung tu token
  const currentUser = await UserModel.findById(decode?.id);
  if (!currentUser) {
    return next(
      new CustomError('The user belonging this token does no longer exist')
    );
  }

  //4. Kiem tra lieu rang nguoi dung co thay doi mat khau sau khi gen token khong
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new CustomError(
        'User recently changed password! Please login again!!',
        401
      )
    );
  }
  req.user = currentUser;
  next();
});

//Kiểm tra có quyền để thực hiện hành động không
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin','lead-guide]
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError("You don't have permission to perform this action!!!"),
        403
      );
    }
    next();
  };
};

//Gửi mã token để reset lại password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on POSTed email
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new CustomError('There is no user with email address', 404));
  }
  //2. Generate the random reset token
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false }); //thêm option validateBeforeSave để userSchema khỏi check validate dữ liệu trước khi lưu nếu không lẽ báo lỗi vì ở đây save không đủ trường
  //3. Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password. Submit PATCH request with your new password and password confirm to: ${resetURL}. If you didn't forget your password, please ignore this email!!!`;
  try {
    await sentEmail({
      email: user.email,
      subject: 'Your password reset token (valid in 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new CustomError('There was an error sending email. Try again!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.find user
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2.if can not find user or token is expried, return error
  if (!user) {
    return next(new CustomError('Token is invalid or has expired', 400));
  }
  //3.update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  //4.return JWT
  res.status(200).json({
    state: 'success',
    token: signToken(user._id),
  });
});
