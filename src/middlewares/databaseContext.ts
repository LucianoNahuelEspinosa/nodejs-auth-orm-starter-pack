import type { RequestHandler } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { orm } from '../database';

/**
 * Express middleware that wraps each incoming request in a isolated MikroORM RequestContext.
 * This prevents cross-request entity pollution and memory leaks.
 */
const databaseContext: RequestHandler = (req, res, next) => {
  RequestContext.create(orm.em, () => {
    req.em = orm.em;
    next();
  });
};

export default databaseContext;