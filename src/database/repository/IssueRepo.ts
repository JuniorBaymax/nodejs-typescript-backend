import { Types } from 'mongoose';
import { Issue, IssueModel } from '../model/Issue.js';

async function create(issue: Issue): Promise<Issue> {
  const now = new Date();
  issue.createdAt = now;
  issue.updatedAt = now;
  const createdProject = await IssueModel.create(issue);
  return createdProject.toObject();
}

async function allIssuesByProject(id: Types.ObjectId): Promise<Issue[]> {
  return IssueModel.find({ projectId: id }).exec();
}

async function allIssuesByUser(id: Types.ObjectId): Promise<Issue[]> {
  return IssueModel.find({ assignee: id })
    .populate({
      path: 'assignee',
      select: '-password', // Exclude sensitive information
      match: { _id: id }, // Match only the current user in the assignee array
    })
    .exec();
}

async function userIssueStatistics(userId: Types.ObjectId): Promise<any> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return IssueModel.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              { reporter: userId }, // Issues created by the user
              { assignee: userId }, // Issues assigned to the user
            ],
          },
          { createdAt: { $gte: sevenDaysAgo } }, // Filter issues created in the last 7 days
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalCreated: { $sum: 1 }, // Total issues created by the user
        totalAssigned: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$reporter', userId] },
                  { $eq: [userId, '$assignee'] }, //FIXME: TODO: total assigned sum is wrong
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        totalDue: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Due'] }, // Assuming 'Due' is the status for due issues
              then: 1,
              else: 0,
            },
          },
        },
        totalDone: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Done'] }, // Assuming 'Done' is the status for completed issues
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0, // Exclude the _id field from the output
      },
    },
  ]);
}

export default {
  create,
  allIssuesByProject,
  allIssuesByUser,
  userIssueStatistics,
};
