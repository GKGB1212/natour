const mongoose = require('mongoose');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour name must have name'],
      unique: [true, 'Tên tour không được trùng'],
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: Number,
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    slug: String,
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //tọa độ địa lí gồm 2 điểm kinh độ vĩ độ.
      address: String,
      description: String,
    },
    locations: [
      {
        //GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], //tọa độ địa lí gồm 2 điểm kinh độ vĩ độ.
        address: String,
        description: String,
        day: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//vitual fields
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// document middleware for save, update
tourSchema.pre('save', function (next) {
  //next là function dùng để nhảy đến middleware tiếp theo
  //console.log('hello form middware mongoose', this);
  this.slug = 'Này là trường được thêm từ mongoose middleware';
  next();
});

tourSchema.pre('save', function (next) {
  //console.log('hàm này là hàm thứ2');
  next();
});

tourSchema.post('save', function (document, next) {
  // console.log('Hello from post middleware', document);
  next();
});

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  //console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});
//AGGREGATE MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});
tourSchema.pre('aggregate', function (next) {
  console.log(this.pipeline());
  next();
});
const TourModel = mongoose.model('tour', tourSchema);

module.exports = TourModel;
