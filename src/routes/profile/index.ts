import express from 'express';
import { SuccessMsgResponse, SuccessResponse } from '../../core/ApiResponse.js';
import UserRepo from '../../database/repository/UserRepo.js';

import { ProtectedRequest } from 'app.request.js';
import bcrypt from 'bcrypt';

import _ from 'lodash';
import { Types } from 'mongoose';
import User from '~/database/model/User.js';
import authentication from '../../auth/authentication.js';
import { BadRequestError } from '../../core/ApiError.js';
import asyncHandler from '../../helpers/asyncHandler.js';
import validator, { ValidationSource } from '../../helpers/validator.js';
import schema from './schema.js';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

router.get(
  '/my',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const user = await UserRepo.findPrivateProfileById(req.user._id);
    if (!user) throw new BadRequestError('User not registered');

    return new SuccessResponse(
      'success',
      _.pick(user, ['_id', 'name', 'email', 'profilePicUrl', 'roles']),
    ).send(res);
  }),
);

router.put(
  '/',
  validator(schema.profile),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const user = await UserRepo.findPrivateProfileById(req.user._id);
    if (!user) throw new BadRequestError('User not registered');

    if (req.body.name) user.name = req.body.name;
    if (req.body.profilePicUrl) user.profilePicUrl = req.body.profilePicUrl;

    await UserRepo.updateInfo(user);

    const data = _.pick(user, ['name', 'profilePicUrl']);

    return new SuccessResponse('Profile updated', data).send(res);
  }),
);

router.patch(
  '/change-password',
  validator(schema.changePassword, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    console.log(req.user);
    const isUserExist = await UserRepo.exists(new Types.ObjectId(req.user._id));

    if (!isUserExist) throw new BadRequestError('User not registered');

    const currentUser = await UserRepo.findById(
      new Types.ObjectId(req.user._id),
    );

    const match = await bcrypt.compare(
      req.body.password,
      currentUser?.password as string,
    );

    if (!match) throw new BadRequestError('Your current password is invalid');

    const passwordHash = await bcrypt.hash(req.body.newPassword, 10);

    await UserRepo.updateInfo({
      _id: req.user._id,
      password: passwordHash,
    } as User);

    console.log(match);

    new SuccessMsgResponse('Password has changed successfully!').send(res);
  }),
);

export default router;
