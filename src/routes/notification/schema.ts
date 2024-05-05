import Joi from 'joi';
import { JoiObjectId } from '../../helpers/validator.js';

export default {
  issueId: Joi.object().keys({ id: JoiObjectId().required() }),
  firebase: Joi.object().keys({
    registrationToken: Joi.string().required(),
  }),
};
