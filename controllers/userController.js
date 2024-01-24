const UserModel = require('../models/userModel');
const CatchAsync = require('../ultils/CatchAsync');
const CustomError = require('../ultils/CustomError');

const fillerObj = (obj, ...allowedFileds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFileds.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find();
  res.status(200).json({
    status: 'success',
    response: users.length,
    users: users,
  });
};
exports.updateMe = CatchAsync(async (req, res, next) => {
  //1.Create error if user POSTed password data
  if (req.body.password) {
    return next(
      new CustomError('This route is not for password updated!!', 400)
    );
  }
  //2. Filtered out unwanted fields name that are not allowed to be updated
  const filteredBody = fillerObj(req.body, 'name', 'email');
  //3. Update user document
  const currentUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    data: currentUser,
  });
});
exports.deleteMe = CatchAsync(async (req, res) => {
  await UserModel.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    data: null,
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
