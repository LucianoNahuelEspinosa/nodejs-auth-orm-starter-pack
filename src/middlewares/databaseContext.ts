import type { RequestHandler } from 'express';
import { orm } from '../database';

const databaseContext: RequestHandler = (req, res, next) => {
  req.em = orm.em.fork();
  next();
};

export default databaseContext;