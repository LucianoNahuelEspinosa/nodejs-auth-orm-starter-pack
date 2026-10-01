import { MikroORM } from '@mikro-orm/core';
import config from '@/mikro-orm.config';

export const orm = await MikroORM.init(config as any);
export const em = orm.em.fork();