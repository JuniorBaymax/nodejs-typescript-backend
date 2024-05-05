import { RoleCode } from '~/database/model/Role.js';

import { NextFunction, Request, Response } from 'express';

// Extend the Express.Request type
interface CustomRequest extends Request {
  currentRoleCodes: string[];
}
export default (...roleCodes: RoleCode[]) =>
  (req: CustomRequest, res: Response, next: NextFunction) => {
    req.currentRoleCodes = roleCodes;
    next();
  };
