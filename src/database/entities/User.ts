import { defineEntity, type EventArgs, type InferEntity, p } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

export const UserSchema = defineEntity({
    name: 'users',
    properties: {
        id: p.uuid().primary().onCreate(() => randomUUID()),
        name: p.string(),
        lastName: p.string().fieldName('last_name'),
        email: p.string().unique(),
        password: p.string().hidden().lazy(),
        isBlocked: p.boolean().fieldName('is_blocked').default(false),
        createdAt: p.datetime().fieldName('created_at').onCreate(() => new Date()),
        updatedAt: p.datetime().fieldName('updated_at').onCreate(() => new Date()).onUpdate(() => new Date()),
        deletedAt: p.datetime().fieldName('deleted_at').nullable()
    }
});

export type IUser = InferEntity<typeof UserSchema>;

const hashPassword = async (args: EventArgs<IUser>) => {
    const password = args.changeSet?.payload.password;

    if (typeof password === 'string') {
        args.entity.password = await bcrypt.hash(password, 12);
    }
}

UserSchema.addHook('beforeCreate', hashPassword);
UserSchema.addHook('beforeUpdate', hashPassword);