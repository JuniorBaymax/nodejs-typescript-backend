import { ProtectedRequest } from 'app.request.js';
import express from 'express';
import { Types } from 'mongoose';
import authentication from '../../auth/authentication.js';
import authorization from '../../auth/authorization.js';
import { BadRequestError } from '../../core/ApiError.js';
import {
  NotFoundResponse,
  SuccessMsgResponse,
  SuccessResponse,
} from '../../core/ApiResponse.js';
import { Issue } from '../../database/model/Issue.js';
import { RoleCode } from '../../database/model/Role.js';
import ActivityRepo from '../../database/repository/ActivityRepo.js';
import IssueRepo from '../../database/repository/IssueRepo.js';
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
  validator(schema.issueCreate),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const existingIssues = await IssueRepo.allIssuesByProject(
      req.body.projectId,
    );

    const project = await ProjectRepo.findProjectById(req.body.projectId);

    if (project) {
      // Increment the issue count for the project
      project.issueCounter = (project.issueCounter || 0) + 1;
      await ProjectRepo.update(project);

      // Generate the issue key using the project key and the incremented issue count
      const key = `${project.key}-${project.issueCounter}`;

      const createdIssue = await IssueRepo.create({
        title: req.body.title,
        summary: req.body.summary,
        description: req.body.description,
        draftText: req.body.text,
        priority: req.body.priority,
        issueType: req.body.issueType,
        resolution: req.body.resolution,
        status: req.body.status,
        labels: req.body.labels,
        epicLink: req.body.epicLink,
        storyPoints: req.body.storyPoints,
        projectId: req.body.projectId,
        assignee:
          req.body.assignee === 'automatic' ? req.user._id : req.body.assignee,
        reporter: req.body.reporter, // Assuming the user creating the issue is the reporter
        watchers: req.body.watchers,
        components: req.body.components,
        environment: req.body.environment,
        attachments: req.body.attachments,
        linkedIssues: req.body.linkedIssues,
        comments: req.body.comments,
        createdBy: req.user,
        updatedBy: req.user,
        key,
      } as unknown as Issue);

      await ActivityRepo.create({
        action: 'issueCreated',
        userId: req.user,
        issueKey: key,
        details: { summary: createdIssue.summary },
      });

      new SuccessResponse('Issue created successfully', createdIssue).send(res);
    } else {
      new NotFoundResponse('Project not found');
    }
  }),
);

router.patch(
  '/:issueKey/update',
  validator(schema.issueId, ValidationSource.PARAM),
  validator(schema.updateIssue, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { issueKey } = req.params;
    const updateFields = req.body;

    // Retrieve the existing issue
    const existingIssue = await IssueRepo.findIssueById(
      new Types.ObjectId(issueKey),
    );

    if (!existingIssue) throw new BadRequestError('Issue does not exists');

    // Compare existing and updated fields to identify changes
    const updatedFields = Object.keys(updateFields).filter(
      (field) => existingIssue.get(field) !== updateFields[field],
    );

    const updatedIssue = await IssueRepo.update({
      _id: issueKey,
      ...updateFields,
    });

    // Update activity based on the identified changes
    if (updatedFields.length > 0) {
      const actionDetails = updatedFields.map((field) => ({
        field,
        oldValue: existingIssue.get(field),
        newValue: updateFields[field],
      }));

      const response = await ActivityRepo.create({
        action: 'issueUpdated',
        userId: req.user,
        issueKey: updatedIssue?.key as string,
        details: { summary: 'Issue updated', actionDetails },
      });
    }

    return new SuccessMsgResponse('Issue updated successfully').send(res);
  }),
);
router.get(
  '/id/:id?/issue-by-project',
  validator(schema.projectId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;
    const issues = await IssueRepo.allIssuesByProject(new Types.ObjectId(id));

    if (!issues) {
      throw new NotFoundResponse('No issues found corresponds to project');
    }
    return new SuccessResponse('success', issues).send(res);
  }),
);

router.get(
  '/user/:id/assigned-to-me',
  validator(schema.userId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;

    const user = await UserRepo.exists(new Types.ObjectId(id));

    if (!user) throw new BadRequestError('User not registered');

    const issues = await IssueRepo.allIssuesByUser(new Types.ObjectId(id));
    if (!issues) {
      throw new NotFoundResponse('User does not have any assigned issue yet!');
    }
    return new SuccessResponse('success', issues).send(res);
  }),
);

router.get(
  '/user/:id/user-issue-statics',
  validator(schema.projectId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;
    const currentUserId = req.user._id;
    console.log('Current User id', currentUserId);
    const user = await UserRepo.exists(new Types.ObjectId(currentUserId));

    if (!user) throw new BadRequestError('User not registered');

    const statics = await IssueRepo.userIssueStatistics(
      currentUserId,
      new Types.ObjectId(id),
    );
    console.log('Statics', statics[0]);

    return new SuccessResponse('success', statics[0]).send(res);
  }),
);

export default router;
