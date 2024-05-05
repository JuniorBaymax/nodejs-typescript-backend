import mongoose, { ConnectOptions } from 'mongoose';
import Logger from '../core/Logger.js';

const mongooseLoader = async (): Promise<void> => {
  const options: ConnectOptions = {
    autoIndex: true,
    // Maintain up to x socket connections
    connectTimeoutMS: 60000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  Logger.debug(process.env.LOCAL_DB_URI);

  function setRunValidators() {
    this.setOptions({ runValidators: true });
  }

  //  `mongoose.set('strictQuery', true);` to suppress this warning.
  mongoose.set({ strictQuery: true });
  // Create the database connection
  mongoose
    .plugin((schema: any) => {
      schema.pre('findOneAndUpdate', setRunValidators);
      schema.pre('updateMany', setRunValidators);
      schema.pre('updateOne', setRunValidators);
      schema.pre('update', setRunValidators);
    })
    .connect(process.env.LOCAL_DB_URI as string, options)
    .then(() => {
      Logger.info('Mongoose connection done');
    })
    .catch((e) => {
      Logger.info('Mongoose connection error');
      Logger.error(e);
    });

  // CONNECTION EVENTS
  // When successfully connected
  mongoose.connection.on('connected', () => {
    Logger.debug(
      'Mongoose default connection open to ' + process.env.LOCAL_DB_URI,
    );
  });

  // If the connection throws an error
  mongoose.connection.on('error', (err) => {
    Logger.error('Mongoose default connection error: ' + err);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    Logger.info('Mongoose default connection disconnected');
  });
  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      Logger.info(
        'Mongoose default connection disconnected through app termination',
      );
      process.exit(0);
    });
  });
};

export default mongooseLoader;
