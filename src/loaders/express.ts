import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';

import morgan from 'morgan';
import passport from 'passport';

// Import swagger dependencies and document
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json' assert { type: 'json' };

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { corsUrl, environment } from '../config.js';
import {
  ApiError,
  ErrorType,
  InternalError,
  NotFoundError,
} from '../core/ApiError.js';
import Logger from '../core/Logger.js';
import routes from '../routes/index.js';

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

interface CustomRequest extends Request {
  requestTime?: string;
}

const expressLoader = (app: Application): void => {
  try {
    app.use('/api', limiter);

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }
    app.use(express.json({ limit: '10mb' }));
    app.use(
      express.urlencoded({
        limit: '10mb',
        extended: true,
        parameterLimit: 50000,
      }),
    );
    app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 })); // cross-origin
    // Swagger setup
    app.use('/api-docs', swaggerUi.serve);
    app.get('/api-docs', swaggerUi.setup(swaggerDocument));

    app.use('/api', routes);
    // catch 404 and forward to error handler
    app.use((req, res, next) => next(new NotFoundError()));

    // Set security headers using helmet
    app.use(helmet());

    app.use(passport.initialize());
    app.use(passport.session() as express.RequestHandler);

    // Data sanitization against NoSql query injection
    app.use(mongoSanitize());
    // Data sanitization against XSS
    // app.use(xss('', {}));
    // Prevent parameter pollution
    app.use(
      hpp({
        whitelist: [
          'duration',
          'ratingAverage',
          'average',
          'maxGroupSize',
          'difficulty',
          'price',
        ],
      }),
    );
    // In ECMAScript modules (ESM), __dirname and __filename are not available as they are in CommonJS modules
    // using the import.meta.url property to achieve a similar result.
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Serving static files
    app.use(express.static(`${__dirname}/public`));

    // Test middleware
    app.use((req: CustomRequest, res: Response, next: NextFunction) => {
      req.requestTime = new Date().toISOString();
      // console.log(req.headers);
      next();
    });

    // Port and server initialization
    app.set('port', process.env.PORT);

    // Middleware Error Handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof ApiError) {
        ApiError.handle(err, res);
        if (err.type === ErrorType.INTERNAL)
          Logger.error(
            `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
          );
      } else {
        Logger.error(
          `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
        );
        Logger.error(err);
        if (environment === 'development') {
          return res.status(500).send(err);
        }
        ApiError.handle(new InternalError(), res);
      }
    });
  } catch (error) {
    Logger.error(error);
  }
};

export default expressLoader;
