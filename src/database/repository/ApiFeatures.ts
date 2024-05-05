import { Document, Query } from 'mongoose';

class ApiFeatures<T extends Document> {
  private query: Query<T[], T>;
  private queryString: any;

  constructor(query: Query<T[], T>, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }

  sort() {
    // custom Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log('SORT BY', sortBy);
      this.query = this.query.sort(sortBy);
    }
    // Default sorting
    this.query = this.query.sort('-createdAt');
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lt|lte|gt)\b/g, (match) => `$${match}`);

    console.log('<<QUERY>>', JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  limitFields() {
    // Projecting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  pagination() {
    // Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default ApiFeatures;
