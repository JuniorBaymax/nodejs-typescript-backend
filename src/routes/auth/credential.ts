import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse.js';

import { RoleRequest } from 'app.request.js';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import authentication from '../../auth/authentication.js';
import authorization from '../../auth/authorization.js';
import { BadRequestError } from '../../core/ApiError.js';
import { RoleCode } from '../../database/model/Role.js';
import User from '../../database/model/User.js';
import KeystoreRepo from '../../database/repository/KeyStoreRepo.js';
import UserRepo from '../../database/repository/UserRepo.js';
import asyncHandler from '../../helpers/asyncHandler.js';
import role from '../../helpers/role.js';
import validator from '../../helpers/validator.js';
import schema from './schema.js';

const router = express.Router();

//----------------------------------------------------------------
router.use(authentication, role(RoleCode.ADMIN), authorization);
//----------------------------------------------------------------

router.post(
  '/user/assign',
  validator(schema.credential),
  asyncHandler(async (req: RoleRequest, res) => {
    const user = await UserRepo.findByEmail(req.body.email);
    if (!user) throw new BadRequestError('User do not exists');

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    await UserRepo.updateInfo({
      _id: user._id,
      password: passwordHash,
    } as User);

    await KeystoreRepo.removeAllForClient(user);

    new SuccessResponse(
      'User password updated',
      _.pick(user, ['_id', 'name', 'email']),
    ).send(res);
  }),
);

export default router;
