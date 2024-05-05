import { PublicRequest } from 'app.request.js';
import express, { Response } from 'express';
import { Types } from 'mongoose';
import { BadRequestError } from '../../core/ApiError.js';
import {
  BadRequestResponse,
  SuccessMsgResponse,
} from '../../core/ApiResponse.js';
import UserRepo from '../../database/repository/UserRepo.js';
import VerificationTokenRepo from '../../database/repository/VerificationTokenRepo.js';
import asyncHandler from '../../helpers/asyncHandler.js';
import validator, { ValidationSource } from '../../helpers/validator.js';
import schema from './schema.js';

const router = express.Router();

router.get(
  '/new-password',
  validator(schema.verifyToken, ValidationSource.QUERY),
  asyncHandler(async (req: PublicRequest, res: Response) => {
    const token = req.query.token as string;
    const existingToken = await VerificationTokenRepo.findByKey(token);

    if (!existingToken) throw new BadRequestResponse('Token does not exist!');

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) throw new BadRequestResponse('Token has expired!');

    const existingUser = await UserRepo.exists({
      _id: new Types.ObjectId(existingToken.client),
    } as Types.ObjectId);

    if (!existingUser) throw new BadRequestError('Email does not exist!');

    if (existingToken.status)
      throw new BadRequestError('Token has been verified already!');

    await VerificationTokenRepo.update(existingToken);
    new SuccessMsgResponse(
      'Email verification successful. You can now reset your password',
    ).send(res);
  }),
);

export default router;
