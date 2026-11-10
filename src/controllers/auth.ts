import { Request, Response, NextFunction } from "express";
import { UserSchema } from "@/database/entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "@/config";
import sanitizeUser from "@/helpers/sanitizeUser";

class Auth {
    constructor() { }

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const em = req.em;
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).send({ message: "Missing required fields" });
                return;
            }

            const result = await em.findOne(
                UserSchema,
                {
                    email: String(email).toLocaleLowerCase().trim()
                },
                {
                    fields: ["id", "name", "lastName", "email", "password", "isBlocked", "deletedAt"],
                    filters: { softDelete: false }
                }
            );

            if (!result) {
                res.status(404).send({ message: "User not found" });
                return;
            }

            if (result.deletedAt || result.isBlocked) {
                res.status(401).send({ message: "User deleted or blocked" });
                return;
            }

            const matchPassword = await bcrypt.compare(password, result.password);

            if (!matchPassword) {
                res.status(401).send({ message: "Wrong credentials" });
                return;
            }

            const payload = {
                id: result.id
            };

            const accessToken = jwt.sign(
                payload,
                jwtConfig.secretKey,
                {
                    expiresIn: jwtConfig.accessTokenExpire
                }
            );

            const refreshToken = jwt.sign(
                payload,
                jwtConfig.secretKey,
                {
                    expiresIn: jwtConfig.refreshTokenExpire
                }
            );

            const isProduction = process.env.NODE_ENV === "production";

            const cookieOptions = {
                httpOnly: true,
                secure: isProduction,
                sameSite: "strict" as const,
                path: "/",
                maxAge: jwtConfig.accessTokenTime
            };

            res.cookie(jwtConfig.accessTokenName, accessToken, cookieOptions);
            res.cookie(jwtConfig.refreshTokenName, refreshToken, { ...cookieOptions, maxAge: jwtConfig.refreshTokenTime });

            const sanitize = sanitizeUser(result);
            res.status(200).send(sanitize);
        } catch (error) {
            next(error);
        }
    }

    getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const em = req.em;
            const { id } = req.user!;

            const user = await em.findOne(UserSchema, { id });

            res.status(200).send(user);
        } catch (error) {
            next(error);
        }
    }

    logout = (req: Request, res: Response) => {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            path: '/',
            httpOnly: true,
            secure: isProduction
        };

        res.clearCookie(jwtConfig.accessTokenName, cookieOptions);
        res.clearCookie(jwtConfig.refreshTokenName, cookieOptions);

        res.status(200).send({ message: 'Logged out successfully' });
    }
}

export default Auth;