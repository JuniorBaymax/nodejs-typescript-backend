import { Types } from 'mongoose';
import User from '../model/User.js';
import VerificationToken, {
  VerificationTokenModel,
} from '../model/VerificationToken.js';

async function findByKey(token: string): Promise<VerificationToken | null> {
  return VerificationTokenModel.findOne({ token: token, status: false })
    .lean()
    .exec();
}
async function findByEmail(email: string): Promise<VerificationToken | null> {
  return VerificationTokenModel.findOne({ email: email, status: true })
    .lean()
    .exec();
}

async function create(
  client: User,
  email: string,
  token: string,
  expires: Date,
): Promise<VerificationToken> {
  const now = new Date();
  const verificationToken = await VerificationTokenModel.create({
    client: client,
    email,
    status: false,
    expires,
    token,
    createdAt: now,
    updatedAt: now,
  });
  return verificationToken.toObject();
}

async function update(params: VerificationToken) {
  return await VerificationTokenModel.updateOne(
    { _id: params._id },
    { $set: { status: true } },
  )
    .lean()
    .exec();
}
async function remove(id: Types.ObjectId): Promise<VerificationToken | null> {
  return VerificationTokenModel.findByIdAndRemove(id).lean().exec();
}

export default {
  create,
  update,
  remove,
  findByKey,
  findByEmail,
};
