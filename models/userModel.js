const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false, //nếu set bằng false thì mongoose tự động sẽ k select lên
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
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});
userSchema.pre('save', async function (next) {
  //chỉ mã hóa mật khẩu khi mật khẩu thay đổi
  console.log(this.isModified('password'));
  if (!this.isModified('password')) {
    return next();
  }
  //mã hóa lại mật khẩu
  this.password = await brcypt.hash(this.password, 12);
  //sau khi xác nhận rồi thì passwordConfirm không còn ý nghĩa nữa nên set thành undefined
  this.passwordConfirm = undefined;
  next();
});
//cập nhật trường passwordChangeAt nếu thay đổi mật khẩu
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangeAt = Date.now() + 1000;
  next();
});
userSchema.methods.checkCorrectPassword = async function (
  candidatePassword,
  userPassword
) {
  //cần phải truyền userPassword
  return await brcypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changeAt = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
    return changeAt > JWTTimestamp;
  }
  return false;
};
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
