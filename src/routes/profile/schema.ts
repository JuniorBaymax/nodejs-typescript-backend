import Joi from 'joi';
import { JoiObjectId } from '../../helpers/validator.js';

export default {
  userId: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  profile: Joi.object().keys({
    name: Joi.string().min(1).max(200).optional(),
    profilePicUrl: Joi.string().uri().optional(),
  }),
  changePassword: Joi.object().keys({
    password: Joi.string().required(),
    newPassword: Joi.string()
      .min(6)
      .max(16)
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  }),
};
