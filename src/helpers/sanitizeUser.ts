import { wrap } from '@mikro-orm/core';
import { IUser } from "@/database/entities/User";

export type SanitizedUser = Omit<IUser, 'password'>;

/**
 * Sanitizes a User model instance before sending it in a response.
 * Removes sensitive fields that must never be exposed to the client,
 * such as the password, even if it is hashed.
 */
const sanitizeUser = (user: Partial<IUser>): Partial<SanitizedUser> => {
    const userObj = wrap(user).toObject() as IUser;
    const { password: _password, ...sanitizedUser } = userObj;

    return sanitizedUser;
};

export default sanitizeUser;