import { Types } from 'mongoose';
import { caching } from '../../config.js';
import Blog from '../../database/model/Blog.js';
import { addMillisToCurrentDate } from '../../helpers/utils.js';
import { DynamicKey, getDynamicKey } from '../keys.js';
import { getJson, setJson } from '../query.js';

function getKeyForId(blogId: Types.ObjectId) {
  return getDynamicKey(DynamicKey.BLOG, blogId.toHexString());
}

function getKeyForUrl(blogUrl: string) {
  return getDynamicKey(DynamicKey.BLOG, blogUrl);
}

async function save(blog: Blog) {
  return setJson(
    getKeyForId(blog._id),
    { ...blog },
    addMillisToCurrentDate(caching.contentCacheDuration),
  );
}

async function fetchById(blogId: Types.ObjectId) {
  return getJson<Blog>(getKeyForId(blogId));
}

async function fetchByUrl(blogUrl: string) {
  return getJson<Blog>(getKeyForUrl(blogUrl));
}

export default {
  save,
  fetchById,
  fetchByUrl,
};
