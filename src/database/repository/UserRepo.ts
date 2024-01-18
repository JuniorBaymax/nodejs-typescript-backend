import { Types } from 'mongoose';
import { InternalError } from '../../core/ApiError.js';
import Keystore from '../model/KeyStore.js';
import { RoleModel } from '../model/Role.js';
import User, { UserModel } from '../model/User.js';
import KeyStoreRepo from './KeyStoreRepo.js';

interface UserQuery {
  _id?: { $in: string[] };
  status: boolean;
}

async function exists(id: Types.ObjectId): Promise<boolean> {
  const user = await UserModel.exists({ _id: id, status: true });
  return user !== null && user !== undefined;
}

async function findPrivateProfileById(
  id: Types.ObjectId,
): Promise<User | null> {
  return UserModel.findOne({ _id: id, status: true })
    .select('+email')
    .populate({
      path: 'roles',
      match: { status: true },
      select: { code: 1 },
    })
    .lean<User>()
    .exec();
}

// contains critical information of the user
async function findById(id: Types.ObjectId): Promise<User | null> {
  return UserModel.findOne({ _id: id, status: true })
    .select('+email +password +roles')
    .populate({
      path: 'roles',
      match: { status: true },
    })
    .lean()
    .exec();
}

async function findByEmail(email: string): Promise<User | null> {
  return UserModel.findOne({ email: email })
    .select('+email +password +roles')
    .populate({
      path: 'roles',
      match: { status: true },
      select: { code: 1 },
    })
    .lean()
    .exec();
}

async function findFieldsById(
  id: Types.ObjectId,
  ...fields: string[]
): Promise<User | null> {
  return UserModel.findOne({ _id: id, status: true }, [...fields])
    .lean()
    .exec();
}

async function findPublicProfileById(id: Types.ObjectId): Promise<User | null> {
  return UserModel.findOne({ _id: id, status: true }).lean().exec();
}

async function create(
  user: User,
  accessTokenKey: string,
  refreshTokenKey: string,
  roleCode: string,
): Promise<{ user: User; keystore: Keystore }> {
  const now = new Date();

  const role = await RoleModel.findOne({ code: roleCode })
    .select('+code')
    .lean()
    .exec();
  if (!role) throw new InternalError('Role must be defined');

  user.roles = [role];
  user.createdAt = user.updatedAt = now;
  const createdUser = await UserModel.create(user);
  const keystore = await KeyStoreRepo.create(
    createdUser,
    accessTokenKey,
    refreshTokenKey,
  );
  return {
    user: { ...createdUser.toObject(), roles: user.roles },
    keystore: keystore,
  };
}

async function update(
  user: User,
  accessTokenKey: string,
  refreshTokenKey: string,
): Promise<{ user: User; keystore: Keystore }> {
  user.updatedAt = new Date();
  await UserModel.updateOne({ _id: user._id }, { $set: { ...user } })
    .lean()
    .exec();
  const keystore = await KeyStoreRepo.create(
    user,
    accessTokenKey,
    refreshTokenKey,
  );
  return { user: user, keystore: keystore };
}

async function updateInfo(user: User): Promise<any> {
  user.updatedAt = new Date();
  return UserModel.updateOne({ _id: user._id }, { $set: { ...user } })
    .lean()
    .exec();
}

async function allUsers(): Promise<any> {
  return UserModel.find({ status: true }).select('+email').lean().exec();
}

async function findUsersByIds(userIds?: string[]): Promise<any> {
  const query: UserQuery = { status: true };

  if (userIds && userIds.length > 0) {
    query['_id'] = { $in: userIds };
  }

  return UserModel.find(query).select('+email').lean().exec();
}

async function findGoogleUser(
  email: string,
  name: string,
  picture: string,
): Promise<User | null> {
  return UserModel.findOne(
    { email },
    {
      name,
      photo: picture,
      email,
      provider: 'Google',
      verified: true,
    },
    { upsert: true, runValidators: false, new: true, lean: true },
  );
}

export default {
  exists,
  allUsers,
  findPrivateProfileById,
  findUsersByIds,
  findById,
  findGoogleUser,
  findByEmail,
  findFieldsById,
  findPublicProfileById,
  create,
  update,
  updateInfo,
};
