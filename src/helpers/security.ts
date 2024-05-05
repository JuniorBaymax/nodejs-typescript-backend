import { Request } from 'express';
import { ForbiddenError } from '~/core/ApiError.js';
import { findIpAddress } from './utils.js';

export function restrictIpAddress(req: Request, ipAddress: string) {
  if (ipAddress === '*') return;
  const ip = findIpAddress(req);
  if (!ip) throw new ForbiddenError('IP Address Not Recognized');
  if (ipAddress !== ip) throw new ForbiddenError('Permission Denied');
}
