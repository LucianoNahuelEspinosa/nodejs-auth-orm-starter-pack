type SanitizedUser = {
    id: string;
    name: string;
    lastName: string;
    email: string;
};

/**
 * Sanitizes a User model instance before sending it in a response.
 *
 * Removes sensitive fields that must never be exposed to the client,
 * such as the password, even if it is hashed.
 */
const sanitizeUser = (user: SanitizedUser) => {
    return {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email
    };
}

export default sanitizeUser;