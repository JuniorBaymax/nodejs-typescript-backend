import Joi from 'joi';
import { JoiObjectId } from '../../helpers/validator.js';

export default {
  issueCreate: Joi.object().keys({
    title: Joi.string().required(),
    summary: Joi.string().required(),
    description: Joi.string(),
    dueDate: Joi.date(),
    priority: Joi.string()
      .valid('Highest', 'High', 'Medium', 'Low', 'Lowest')
      .required(),
    issueType: Joi.string().valid('Task', 'Bug', 'Story', 'Epic').required(),
    // Assuming a default value of 'Task'
    resolution: Joi.string(),
    status: Joi.string().default('To Do').default({ name: 'To Do' }), // Assuming a default value of 'None'
    labels: Joi.array().items(Joi.string()),
    epicLink: Joi.string(),
    storyPoints: Joi.number(),
    projectId: Joi.string().required(), // Assuming projectId is required
    assignee: Joi.string(),
    reporter: Joi.string(),
    watchers: Joi.array().items(Joi.string()),
    components: Joi.array().items(Joi.string()),
    environment: Joi.string(),
    attachments: Joi.array().items(
      Joi.object({
        name: Joi.string(),
        url: Joi.string(),
      }),
    ),
    linkedIssues: Joi.array().items(Joi.string()),
    comments: Joi.array().items(
      Joi.object({
        userId: Joi.string().required(),
        text: Joi.string().required(),
        createdAt: Joi.date(),
      }),
    ),
  }),
  projectId: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  // Add other custom fields as needed // Assuming issues are represented by their ObjectId strings
};
