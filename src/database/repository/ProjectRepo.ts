import { Types } from 'mongoose';
import Project, { ProjectModel } from '../model/Project.js';

const AUTHOR_DETAIL = 'name profilePicUrl';

async function create(project: Project): Promise<Project> {
  const now = new Date();
  project.createdAt = now;
  project.updatedAt = now;
  const createdProject = await ProjectModel.create(project);
  return createdProject.toObject();
}

async function update(project: Project): Promise<Project | null> {
  project.updatedAt = new Date();
  return ProjectModel.findByIdAndUpdate(project._id, project, { new: true })
    .lean()
    .exec();
}

async function findProjectById(id: Types.ObjectId): Promise<Project | null> {
  return (
    ProjectModel.findOne({ _id: id, status: true })
      // .populate('author', AUTHOR_DETAIL)
      .lean()
      .exec()
  );
}

async function findUsersInProject(id: Types.ObjectId): Promise<Project | null> {
  return ProjectModel.findById({ _id: id }, { users: 1, _id: 0 }).populate(
    'users',
    'name verified status email profilePicUrl',
  );
}

// async function findInfoForPublishedById(
//   id: Types.ObjectId,
// ): Promise<Blog | null> {
//   return BlogModel.findOne({ _id: id, isPublished: true, status: true })
//     .select('+text')
//     .populate('author', AUTHOR_DETAIL)
//     .lean()
//     .exec();
// }

// async function findBlogAllDataById(id: Types.ObjectId): Promise<Blog | null> {
//   return BlogModel.findOne({ _id: id, status: true })
//     .select(
//       '+text +draftText +isSubmitted +isDraft +isPublished +status +createdBy +updatedBy',
//     )
//     .populate('author', AUTHOR_DETAIL)
//     .lean()
//     .exec();
// }

// async function findPublishedByUrl(blogUrl: string): Promise<Blog | null> {
//   return BlogModel.findOne({
//     blogUrl: blogUrl,
//     isPublished: true,
//     status: true,
//   })
//     .select('+text')
//     .populate('author', AUTHOR_DETAIL)
//     .lean()
//     .exec();
// }

// async function findUrlIfExists(blogUrl: string): Promise<Blog | null> {
//   return BlogModel.findOne({ blogUrl: blogUrl }).lean().exec();
// }

// async function findByTagAndPaginated(
//   tag: string,
//   pageNumber: number,
//   limit: number,
// ): Promise<Blog[]> {
//   return BlogModel.find({ tags: tag, status: true, isPublished: true })
//     .skip(limit * (pageNumber - 1))
//     .limit(limit)
//     .populate('author', AUTHOR_DETAIL)
//     .sort({ updatedAt: -1 })
//     .lean()
//     .exec();
// }

// async function findAllPublishedForAuthor(user: User): Promise<Blog[]> {
//   return BlogModel.find({ author: user, status: true, isPublished: true })
//     .populate('author', AUTHOR_DETAIL)
//     .sort({ updatedAt: -1 })
//     .lean()
//     .exec();
// }

// async function findAllDrafts(): Promise<Blog[]> {
//   return findDetailedBlogs({ isDraft: true, status: true });
// }

// async function findAllSubmissions(): Promise<Blog[]> {
//   return findDetailedBlogs({ isSubmitted: true, status: true });
// }

async function findAllProjects(): Promise<Project[]> {
  return findProjects({ isPublished: true, status: true });
}

// async function findAllSubmissionsForWriter(user: User): Promise<Blog[]> {
//   return findDetailedBlogs({ author: user, status: true, isSubmitted: true });
// }

// async function findAllPublishedForWriter(user: User): Promise<Blog[]> {
//   return findDetailedBlogs({ author: user, status: true, isPublished: true });
// }

// async function findAllDraftsForWriter(user: User): Promise<Blog[]> {
//   return findDetailedBlogs({ author: user, status: true, isDraft: true });
// }

async function findProjects(
  query: Record<string, unknown>,
): Promise<Project[]> {
  return ProjectModel.find(query)
    .select('+title +key +favorite +createdBy +updatedBy, +tasks')
    .populate('createdBy', AUTHOR_DETAIL)
    .populate('updatedBy', AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

// async function findLatestBlogs(
//   pageNumber: number,
//   limit: number,
// ): Promise<Blog[]> {
//   return BlogModel.find({ status: true, isPublished: true })
//     .skip(limit * (pageNumber - 1))
//     .limit(limit)
//     .populate('author', AUTHOR_DETAIL)
//     .sort({ publishedAt: -1 })
//     .lean()
//     .exec();
// }

// async function searchSimilarBlogs(blog: Blog, limit: number): Promise<Blog[]> {
//   return BlogModel.find(
//     {
//       $text: { $search: blog.title, $caseSensitive: false },
//       status: true,
//       isPublished: true,
//       _id: { $ne: blog._id },
//     },
//     {
//       similarity: { $meta: 'textScore' },
//     },
//   )
//     .populate('author', AUTHOR_DETAIL)
//     .sort({ updatedAt: -1 })
//     .limit(limit)
//     .sort({ similarity: { $meta: 'textScore' } })
//     .lean()
//     .exec();
// }

// async function search(query: string, limit: number): Promise<Blog[]> {
//   return BlogModel.find(
//     {
//       $text: { $search: query, $caseSensitive: false },
//       status: true,
//       isPublished: true,
//     },
//     {
//       similarity: { $meta: 'textScore' },
//     },
//   )
//     .select('-status -description')
//     .limit(limit)
//     .sort({ similarity: { $meta: 'textScore' } })
//     .lean()
//     .exec();
// }

// async function searchLike(query: string, limit: number): Promise<Blog[]> {
//   return BlogModel.find({
//     title: { $regex: `.*${query}.*`, $options: 'i' },
//     status: true,
//     isPublished: true,
//   })
//     .select('-status -description')
//     .limit(limit)
//     .sort({ score: -1 })
//     .lean()
//     .exec();
// }

export default {
  create,
  update,
  findAllProjects,
  findProjects,
  findUsersInProject,
  findProjectById,
  //   update,
  //   findInfoById,
  //   findInfoForPublishedById,
  //   findBlogAllDataById,
  //   findPublishedByUrl,
  //   findUrlIfExists,
  //   findByTagAndPaginated,
  //   findAllPublishedForAuthor,
  //   findAllDrafts,
  //   findAllSubmissions,
  //   findAllPublished,
  //   findAllSubmissionsForWriter,
  //   findAllPublishedForWriter,
  //   findAllDraftsForWriter,
  //   findLatestBlogs,
  //   searchSimilarBlogs,
  //   search,
  //   searchLike,
};
