const UserModel = require('../models/userModel');
const catchAsync = require('../ultils/CatchAsync');
const jwt = require('jsonwebtoken');

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create(req.body);
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: '7 d',
  });
  res.status(200).json({
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
  });
});
