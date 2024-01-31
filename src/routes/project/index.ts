import { ProtectedRequest } from 'app.request.js';
import express from 'express';
import { Types } from 'mongoose';
import Project from '~/database/model/Project.js';
import authentication from '../../auth/authentication.js';
import authorization from '../../auth/authorization.js';
import { FailureMsgResponse, SuccessResponse } from '../../core/ApiResponse.js';
import { RoleCode } from '../../database/model/Role.js';
import User from '../../database/model/User.js';
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
  role(RoleCode.ADMIN, RoleCode.LEARNER),
  authorization,
);
/*-------------------------------------------------------------------------*/

router.post(
  '/',
  validator(schema.projectCreate),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const key = `${req.body.title
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase())
      .join('')}`;
    const createdProject = await ProjectRepo.create({
      title: req.body.title,
      description: req.body.description,
      draftText: req.body.text,
      scope: req.body.scope,
      projectLead: req.user,
      key,
      createdBy: req.user,
      updatedBy: req.user,
    } as Project);

    // Get the Socket.IO instance from the app
    const io = req.app.get('io');
    // Emit a 'projectCreated' event to all connected clients
    io.emit('projectCreated', createdProject);

    new SuccessResponse('Project created successfully', createdProject).send(
      res,
    );
  }),
);

router.put(
  `/id/:id?/assign-members`,
  validator(schema.projectId, ValidationSource.PARAM),
  validator(schema.id),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;

    // Ensure the project exists
    const project = await ProjectRepo.findProjectById(new Types.ObjectId(id));
    if (!project) {
      throw new FailureMsgResponse('Project not found');
    }

    // TODO: I think we have to fix here already mapped user under the same project
    // Ensure the provided user IDs are valid
    const users = await UserRepo.findUsersByIds(req.body);
    if (!users || users.length !== req.body.length) {
      throw new FailureMsgResponse('Invalid user IDs');
    }

    // Check if any of the provided user IDs are already in the project
    const existingUserIds = project.users.map((user: any) => user._id);
    const newUserIds = users.map((user: User) => user._id.toString());

    const intersection = newUserIds.filter((userId: string) =>
      existingUserIds.includes(userId),
    );

    if (intersection.length > 0) {
      throw new FailureMsgResponse(
        'Some users are already assigned to the project',
      );
    }

    project.users.push(...users);

    await ProjectRepo.update(project);

    return new SuccessResponse(
      'Users assigned to project successfully',
      project,
    ).send(res);
  }),
);

router.get(
  '/all',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const projects = await ProjectRepo.findAllProjects();
    return new SuccessResponse('success', projects).send(res);
  }),
);

export default router;
// router.use('/writer', writer);
// router.use('/editor', editor);
