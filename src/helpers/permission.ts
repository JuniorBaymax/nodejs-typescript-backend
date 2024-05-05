// import { PublicRequest } from 'app.request';
import { PublicRequest } from 'app.request.js';
import { NextFunction, Response } from 'express';
import { ForbiddenError } from '../core/ApiError.js';

export default (permission: string) =>
  (req: PublicRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.apiKey?.permissions)
        return next(new ForbiddenError('Permission Denied'));
      const exists = req.apiKey.permissions.find(
        (entry: any) => entry === permission,
      );

      if (!exists) return next(new ForbiddenError('Permission Denied'));

      next();
    } catch (error) {
      next(error);
    }
  };
