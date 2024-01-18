const mongoose = require('mongoose');

//thư viện dùng để đọc file config
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
console.log(DB);

//Đoạn này dùng để kết nối với db mongo
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled Rejection 💣💣💣💥💥💥, shuting down...');
  server.close(() => {
    process.exit(1);
  });
});
