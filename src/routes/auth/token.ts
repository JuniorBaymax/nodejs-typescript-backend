import express, { Response } from 'express';
import { TokenRefreshResponse } from '../../core/ApiResponse.js';

import { ProtectedRequest } from 'app.request.js';
import crypto from 'crypto';
import { Types } from 'mongoose';

import {
  createTokens,
  getAccessToken,
  validateTokenData,
} from '../../auth/authUtils.js';
import { AuthFailureError } from '../../core/ApiError.js';
import JWT from '../../core/JWT.js';

import KeystoreRepo from '../../database/repository/KeyStoreRepo.js';
import UserRepo from '../../database/repository/UserRepo.js';
import asyncHandler from '../../helpers/asyncHandler.js';
import validator, { ValidationSource } from '../../helpers/validator.js';
import schema from './schema.js';

const router = express.Router();

router.post(
  '/refresh',
  validator(schema.auth, ValidationSource.HEADER),
  validator(schema.refreshToken),
  asyncHandler(async (req: ProtectedRequest, res: Response) => {
    req.accessToken = getAccessToken(req.headers.authorization); // Express headers are auto converted to lowercase

    const accessTokenPayload = await JWT.decode(req.accessToken);
    validateTokenData(accessTokenPayload);

    const user = await UserRepo.findById(
      new Types.ObjectId(accessTokenPayload.sub),
    );
    if (!user) throw new AuthFailureError('User not registered');
    req.user = user;

    const refreshTokenPayload = await JWT.validate(req.body.refreshToken);
    validateTokenData(refreshTokenPayload);

    if (accessTokenPayload.sub !== refreshTokenPayload.sub)
      throw new AuthFailureError('Invalid access token');

    const keystore = await KeystoreRepo.find(
      req.user,
      accessTokenPayload.prm,
      refreshTokenPayload.prm,
    );

    if (!keystore) throw new AuthFailureError('Invalid access token');
    await KeystoreRepo.remove(keystore._id);

    const accessTokenKey = crypto.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto.randomBytes(64).toString('hex');

    await KeystoreRepo.create(req.user, accessTokenKey, refreshTokenKey);
    const tokens = await createTokens(
      req.user,
      accessTokenKey,
      refreshTokenKey,
    );

    new TokenRefreshResponse(
      'Token Issued',
      tokens.accessToken,
      tokens.refreshToken,
    ).send(res);
  }),
);

export default router;
