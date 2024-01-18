const mongoose = require('mongoose');
const validator = require('validator');
const brcypt = require('bcryptjs');
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please tell us your email!'],
    unique: true,
    lowcase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please cofirm your password'],
    validate: {
      //this is only work on save and create
      validator: function (el) {
        return el === this.password;
      },
      message: 'password are not same!!!',
    },
  },
});
userSchema.pre('save', async function (next) {
  console.log('oallala', this.isModified('password'));
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await brcypt.hash(this.password, 12);
  //sau khi xác nhận rồi thì passwordConfirm không còn ý nghĩa nữa nên set thành undefined
  this.passwordConfirm = undefined;
  next();
});
const User = mongoose.model('User', userSchema);
module.exports = User;
