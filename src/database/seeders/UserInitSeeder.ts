import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { UserSchema } from '@/database/entities/User';

export class UserInitSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    em.create(UserSchema, {
      name: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: '1234'
    });

    await em.flush();
  }
}