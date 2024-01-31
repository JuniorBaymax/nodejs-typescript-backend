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

export default { create, allIssuesByProject };
