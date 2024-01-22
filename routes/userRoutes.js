const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { signUp, login } = require('../controllers/authController');

const router = express.Router();

//auth
router.post('/signup', signUp);
router.post('/login', login);

//user
router.route('/').get(getAllUsers).post(createUser);

router.route(':/id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
