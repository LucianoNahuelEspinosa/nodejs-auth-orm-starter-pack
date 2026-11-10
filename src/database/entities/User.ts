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
    },
    filters: {
        softDelete: {
            name: 'softDelete',
            cond: { deletedAt: null },
            default: true
        }
    }
});

export type IUser = InferEntity<typeof UserSchema>;

const isPasswordHash = (value: string): boolean => {
    return /^\$2[aby]\$\d{2}\$/.test(value);
}

const hashPassword = async (args: EventArgs<IUser>) => {
    const password = args.changeSet?.payload.password;

    if (typeof password !== 'string') {
        return;
    }

    if (isPasswordHash(password)) {
        return;
    }

    args.entity.password = await bcrypt.hash(password, 12);
}

const formatEmail = (args: EventArgs<IUser>) => {
    if (typeof args.entity.email === 'string') {
        args.entity.email = args.entity.email.trim().toLowerCase();
    }
}

UserSchema.addHook('beforeCreate', hashPassword);
UserSchema.addHook('beforeCreate', formatEmail);

UserSchema.addHook('beforeUpdate', hashPassword);
UserSchema.addHook('beforeUpdate', formatEmail);