import { Schema, Types, model } from 'mongoose';
import User from './User.js';

export const DOCUMENT_NAME = 'VerificationToken';
export const COLLECTION_NAME = 'VerificationToken';

export default interface VerificationToken {
  _id: Types.ObjectId;
  client: Types.ObjectId;
  email: User;
  token: string;
  expires: Date;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<VerificationToken>(
  {
    client: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    email: {
      type: Schema.Types.String,
      required: true,
      ref: 'User',
    },
    token: {
      type: Schema.Types.String,
      unique: true,
    },
    status: {
      type: Schema.Types.Boolean,
      default: true,
    },
    expires: { type: Schema.Types.Date, required: true },
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

schema.index({ client: 1 });
schema.index({ client: 1, email: 1, status: 1 });
schema.index({ client: 1, token: 1 });

export const VerificationTokenModel = model<VerificationToken>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
