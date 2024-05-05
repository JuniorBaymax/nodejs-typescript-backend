import { ProtectedRequest } from 'app.request.js';
import express from 'express';
import { Types } from 'mongoose';
import {
  AccessTokenError,
  AuthFailureError,
  TokenExpiredError,
} from '../core/ApiError.js';
import JWT from '../core/JWT.js';
import KeystoreRepo from '../database/repository/KeyStoreRepo.js';
import UserRepo from '../database/repository/UserRepo.js';
import asyncHandler from '../helpers/asyncHandler.js';
import validator, { ValidationSource } from '../helpers/validator.js';
import { getAccessToken, validateTokenData } from './authUtils.js';
import schema from './schema.js';

const router = express.Router();

export default router.use(
  validator(schema.auth, ValidationSource.HEADER),
  asyncHandler(async (req: ProtectedRequest, res, next) => {
    req.accessToken = getAccessToken(req.headers.authorization); // Express headers are auto converted to lowercase

    try {
      const payload = await JWT.validate(req.accessToken);

      validateTokenData(payload);

      const user = await UserRepo.findById(new Types.ObjectId(payload.sub));
      if (!user) throw new AuthFailureError('User not registered');
      req.user = user;

      const keystore = await KeystoreRepo.findforKey(req.user, payload.prm);
      if (!keystore) throw new AuthFailureError('Invalid access token');
      req.keystore = keystore;

      return next();
    } catch (e) {
      if (e instanceof TokenExpiredError) throw new AccessTokenError(e.message);
      throw e;
    }
  }),
);
