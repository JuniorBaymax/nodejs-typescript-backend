import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { model, Schema, Types } from 'mongoose';
import Role from './Role.js';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';

// Define the interface for User document
export default interface User {
  _id: Types.ObjectId;
  name?: string;
  profilePicUrl?: string;
  email?: string;
  password?: string;
  roles: Role[];
  projects: string[];
  verified?: boolean;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  firebaseToken?: string;
}

// Create the User schema
const schema = new Schema<User>(
  {
    name: {
      type: Schema.Types.String,
      trim: true,
      maxlength: 200,
    },
    profilePicUrl: {
      type: Schema.Types.String,
      trim: true,
    },
    email: {
      type: Schema.Types.String,
      unique: true,
      sparse: true, // allows null
      trim: true,
      select: false,
    },
    password: {
      type: Schema.Types.String,
      select: false,
    },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    firebaseToken: Schema.Types.String,
    roles: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Role',
        },
      ],
      required: true,
      select: false,
    },
    verified: {
      type: Schema.Types.Boolean,
      default: false,
    },
    status: {
      type: Schema.Types.Boolean,
      default: true,
    },
    createdAt: {
      type: Schema.Types.Date,
      required: true,
      select: false,
    },
    updatedAt: {
      type: Schema.Types.Date,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

schema.pre('save', async function (next) {
  // ? Only run this function if password is actually modified
  if (!this.isModified('password')) return next();
  // this.password = await bcrypt.hash(this.password, 12);
  //@ts-ignore
  this.passwordConfirm = undefined;

  next();
});

schema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  //@ts-ignore
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

schema.pre(/^find/, async function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

schema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

schema.methods.changePasswordAfter = async function (jwtTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      //@ts-ignore
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(this.passwordChangedAt, jwtTimestamp, changedTimestamp);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

schema.methods.createResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

schema.index({ _id: 1, status: 1 });
schema.index({ email: 1 });
schema.index({ status: 1 });

export const UserModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);
