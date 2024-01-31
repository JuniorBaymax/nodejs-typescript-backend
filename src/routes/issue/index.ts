import { ProtectedRequest } from 'app.request.js';
import express from 'express';
import authentication from '../../auth/authentication.js';
import authorization from '../../auth/authorization.js';
import { NotFoundResponse, SuccessResponse } from '../../core/ApiResponse.js';
import { Issue } from '../../database/model/Issue.js';
import { RoleCode } from '../../database/model/Role.js';
import IssueRepo from '../../database/repository/IssueRepo.js';
import ProjectRepo from '../../database/repository/ProjectRepo.js';
import asyncHandler from '../../helpers/asyncHandler.js';
import role from '../../helpers/role.js';
import validator from '../../helpers/validator.js';
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
    //  Assigning key, have to check the unique key assignment of created Issue
    const key = `${req.body.title.split(' ')[0][0]}${
      req.body.title.split(' ')[1][0]
    }`;

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
        assignee: req.user._id,
        reporter: [req.user._id], // Assuming the user creating the issue is the reporter
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

      new SuccessResponse('Issue created successfully', createdIssue).send(res);
    } else {
      new NotFoundResponse('Project not found');
    }
  }),
);

export default router;
// router.use('/writer', writer);
// router.use('/editor', editor);
