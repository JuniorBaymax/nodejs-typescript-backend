import { Schema, model } from 'mongoose';
import User from './User.js';

export default interface Activity {
  userId: User;
  action: string;
  issueKey: string;
  details: Record<string, unknown>;
  timestamp?: Date;
}

const schema = new Schema<Activity>({
  timestamp: {
    type: Date,
    index: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: String,
  issueKey: String,
  details: { summary: String },
});

export const ActivityModel = model<Activity>('Activity', schema, 'activity');
