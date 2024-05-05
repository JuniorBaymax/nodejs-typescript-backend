import Activity, { ActivityModel } from '../model/Activity.js';

async function create(activity: Activity): Promise<void> {
  const now = new Date();
  activity.timestamp = now;

  const createdActivity = await ActivityModel.create(activity);
  return createdActivity.toObject();
}

export default { create };
