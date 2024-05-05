import _ from 'lodash';
import User from '../../database/model/User.js';

export const enum AccessMode {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
}

export async function getUserData(user: User) {
  const data = _.pick(user, ['_id', 'name', 'roles', 'profilePicUrl']);
  return data;
}
