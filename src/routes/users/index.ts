import { ProtectedRequest } from 'app.request.js';
import express from 'express';
import { Types } from 'mongoose';
import authentication from '../../auth/authentication.js';
import authorization from '../../auth/authorization.js';
import { SuccessResponse } from '../../core/ApiResponse.js';
import { RoleCode } from '../../database/model/Role.js';
import ProjectRepo from '../../database/repository/ProjectRepo.js';
import UserRepo from '../../database/repository/UserRepo.js';
import asyncHandler from '../../helpers/asyncHandler.js';
import role from '../../helpers/role.js';
import validator, { ValidationSource } from '../../helpers/validator.js';
import schema from './schema.js';
// import BlogRepo from '../../database/repository/BlogRepo.';
// import task from './task';
// import issue from './issue';
// import BlogCache from '../../cache/repository/BlogCache';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(
  authentication,
  role(RoleCode.ADMIN, RoleCode.LEARNER), //TODO: Assign Role according to route
  authorization,
);
/*-------------------------------------------------------------------------*/

router.get(
  '/:id?',
  validator(schema.projectId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (req.params.id) {
      // If only projectId is provided, fetch users in the project
      const projectUsers = await ProjectRepo.findUsersInProject(
        new Types.ObjectId(req.params.id),
      );
      return new SuccessResponse('success', projectUsers).send(res);
    } else {
      // If no parameters are provided, fetch all users
      const users = await UserRepo.allUsers();
      return new SuccessResponse('success', users).send(res);
    }
  }),
);

export default router;
// router.use('/writer', writer);
// router.use('/editor', editor);
