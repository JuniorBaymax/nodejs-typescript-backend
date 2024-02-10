import { Schema, model } from 'mongoose';
import User from './User.js';

export default interface Activity {
  userId: User;
  action: string;
  issueKey: string;
  details: {
    summary: string;
    actionDetails?: Array<{ field: string; oldValue: any; newValue: any }>;
  };
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
  details: {
    summary: String,
    actionDetails: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
  },
});

export const ActivityModel = model<Activity>('Activity', schema, 'activity');
