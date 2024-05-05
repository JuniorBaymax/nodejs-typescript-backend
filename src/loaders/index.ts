import { Application } from 'express';
import expressLoader from './express.js';
import mongooseLoader from './mongoose.js';

const loader = (app: Application) => {
  mongooseLoader();
  expressLoader(app);
};

export default loader;
