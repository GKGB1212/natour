class APIFeature {
  constructor(queryMongoose, queryRequest) {
    this.queryMongoose = queryMongoose;
    this.queryRequest = queryRequest;
  }
  filter() {
    let queryObj = { ...this.queryRequest };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //xử lí query cho lte, lt, gte, gt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //3, tạo câu query
    this.queryMongoose = this.queryMongoose.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    // sorting (request sort sẽ có cấu trúc như này: 'http://localhost:3000/api/v1/tours?sort=name,price,maxGroupSize')
    if (this.queryRequest.sort) {
      const sortBy = this.queryRequest.sort.split(',').join(' ');
      this.queryMongoose = this.queryMongoose.sort(sortBy);
    } else {
      this.queryMongoose = this.queryMongoose.sort('-createdAt');
    }
    return this;
  }
  fields() {
    if (this.queryRequest.fields) {
      const fields = this.queryRequest.fields.split(',').join(' ');
      this.queryMongoose = this.queryMongoose.select(fields);
    } else {
      this.queryMongoose = this.queryMongoose.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.queryRequest.page * 1 || 1;
    const limit = this.queryRequest.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.queryMongoose = this.queryMongoose.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeature;
