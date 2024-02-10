import { Document, Schema, Types, model } from 'mongoose';
import User from './User.js';

export const DOCUMENT_NAME = 'Issue';
export const COLLECTION_NAME = 'issues';

interface IIssueComment {
  userId: string;
  text: string;
  createdAt: Date;
}

interface IIssueAttachment {
  name: string;
  url: string;
}

interface IIssueLinked {
  type: string;
  ref: string; // Reference to other linked issues
}

interface IIssueStatusChange {
  status: string;
  updatedBy: Types.ObjectId; // Assuming it's a reference to the User collection
  updatedAt: Date;
}

export interface Issue extends Document {
  title: string;
  description: string;
  summary: string;
  dueDate: Date;
  createdDate: Date;
  updatedDate: Date;
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  issueType: string;
  currentUser?: Record<string, unknown>;
  statusHistory: IIssueStatusChange[];
  resolution: string;
  status: string;
  labels: string[];
  epicLink: string;
  storyPoints: number;
  projectId: Record<string, unknown>;
  assignee: Types.ObjectId[];
  reporter: Record<string, unknown>;
  watchers: string[];
  components: string[];
  environment: string;
  attachments: IIssueAttachment[];
  linkedIssues: IIssueLinked[];
  comments: IIssueComment[];
  createdBy?: User;
  updatedBy?: User;
  createdAt?: Date;
  updatedAt?: Date;
  key: string; // This will be auto incremental based on project context such as PM1, PM2
}

const issueSchema = new Schema<Issue>({
  title: String,
  description: String,
  summary: String,
  dueDate: Date,
  priority: {
    type: String,
    enum: ['Highest', 'High', 'Medium', 'Low', 'Lowest'],
    required: true,
  },
  issueType: { type: String, default: 'Task' },
  statusHistory: [
    {
      status: String,
      updatedBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
      },
      updatedAt: {
        type: Date,
        required: true,
      },
    },
  ],
  status: { type: String, default: 'None' },
  resolution: String,
  labels: [String],
  epicLink: String,
  storyPoints: Number,
  projectId: {
    type: Types.ObjectId,
    ref: 'Project',
  },
  assignee: [
    {
      type: Types.ObjectId,
      ref: 'User',
    },
  ],
  reporter: {
    type: Types.ObjectId,
    ref: 'User',
  },

  watchers: [
    {
      type: Types.ObjectId,
      ref: 'User',
    },
  ],
  components: [String],
  environment: String,
  attachments: [
    {
      name: String,
      url: String,
    },
  ],
  linkedIssues: [
    {
      type: Types.ObjectId,
      ref: 'Issue',
    },
  ],
  comments: [
    {
      userId: { type: Types.ObjectId, ref: 'User' },
      text: String,
      createdAt: Date,
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
    select: true,
    index: true,
  },
  updatedBy: {
    type: Types.ObjectId,
    ref: 'User',
    // required: true,
    select: false,
  },
  createdAt: {
    type: Date,
    // required: true,
    select: true,
  },
  updatedAt: {
    type: Date,
    // required: true,
    select: true,
  },
  key: String,
});

issueSchema.index({ projectId: 1 });

export const IssueModel = model<Issue>(
  DOCUMENT_NAME,
  issueSchema,
  COLLECTION_NAME,
);
