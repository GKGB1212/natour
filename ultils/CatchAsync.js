module.exports = (fn) => {
  //hàm return sẽ nhận 3 tham số từ nodejs
  return (req, res, next) => {
    fn(req, res, next).catch((error) => next(error));
  };
};
