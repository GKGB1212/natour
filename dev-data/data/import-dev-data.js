const fs = require('fs');
const mongoose = require('mongoose');
//thư viện dùng để đọc file config
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const Tour = require('./../../models/tourModel');
const TourModel = require('./../../models/tourModel');

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//Đoạn này dùng để kết nối với db mongo
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'));

const importData = async () => {
  try {
    await TourModel.create(tours);
    console.log('Đã thêm thành công');
  } catch (error) {
    console.log('Lỗi rùi', error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await TourModel.deleteMany();
    console.log('Đã xóa thành công');
  } catch (error) {
    console.log('Lỗi rùi');
  }
  process.exit();
};
console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
