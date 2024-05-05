import Joi from 'joi';
import { Header } from '../core/utils.js';
import { JoiAuthBearer } from '../helpers/validator.js';

export default {
  apiKey: Joi.object()
    .keys({
      [Header.API_KEY]: Joi.string().required(), //? if you want to use x-api-key you can make it require
    })
    .unknown(true),
  auth: Joi.object()
    .keys({
      authorization: JoiAuthBearer().required(),
    })
    .unknown(true),
};
