const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    unique: [true, 'Tên tour không được trùng'],
  },
  price: Number,
  rating: {
    type: Number,
    default: 4,
  },
  location: String,
});
const TourModel = mongoose.model('tour', tourSchema);

module.exports = TourModel;
