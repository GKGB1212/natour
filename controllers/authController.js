const UserModel = require('../models/userModel');
const catchAsync = require('../ultils/CatchAsync');

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
