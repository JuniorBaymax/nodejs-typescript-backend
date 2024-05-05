import Joi from 'joi';
import { JoiObjectId } from '../../helpers/validator.js';

export default {
  projectCreate: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string(),
    category: Joi.string(),
    issueCounter: Joi.number().default(1),
    tasks: Joi.array().items(Joi.string()), // Assuming tasks are represented by their ObjectId strings
    issues: Joi.array().items(Joi.string()), // Assuming issues are represented by their ObjectId strings
  }),
  projectId: Joi.object().keys({
    id: JoiObjectId().optional(),
  }),
};
