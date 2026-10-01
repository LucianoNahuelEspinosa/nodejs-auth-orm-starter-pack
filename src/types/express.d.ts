import type { EntityManager } from '@mikro-orm/core';

declare global {
  namespace Express {
    interface Request {
      em: EntityManager;
      user?: {
        id: string;
      };
    }
  }
}

export { };