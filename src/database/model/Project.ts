import { Schema, Types, model } from 'mongoose';
import User from './User.js';

export const DOCUMENT_NAME = 'Project';
export const COLLECTION_NAME = 'projects';

export enum SCOPE {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

interface ITask {
  _id: Types.ObjectId;
  // ... add other task properties
}

interface IIssue {
  _id: Types.ObjectId;
  // ... add other issue properties
}

export default interface Project {
  _id: Types.ObjectId;
  title: string;
  key: string;
  favorite: boolean;
  description?: string;
  draftText?: string;
  projectLead: User;
  category?: string;
  scope: string;
  issueCounter?: number;
  users: string[];
  tasks?: Types.ObjectId[] | ITask[];
  issues?: Types.ObjectId[] | IIssue[];
  createdBy?: User;
  updatedBy?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Project>(
  {
    title: { type: String, required: true },
    key: String,
    favorite: { type: Boolean, default: false, required: false },
    description: String,
    draftText: String,
    projectLead: { type: Schema.Types.ObjectId, ref: 'User' },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    category: String,
    scope: {
      type: String,
      enum: Object.values(SCOPE),
      default: SCOPE.PUBLIC,
    },
    issueCounter: {
      type: Number,
      default: 0, // Initialize the counter to 0
    },
    tasks: [{ type: Types.ObjectId, ref: 'Task' }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: false,
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: false,
    },
    createdAt: {
      type: Date,
      required: true,
      select: false,
    },
    updatedAt: {
      type: Date,
      required: true,
      select: false,
    },
  },
  { timestamps: true }, // Add timestamps for createdAt and updatedAt
);

schema.index({ _id: 1, title: 1 });

export const ProjectModel = model<Project>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
