import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { jwtConfig } from "../config.js";
import { UserSchema } from "@/database/entities/User.js";

interface AuthTokenPayload extends JwtPayload {
    id: string;
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessTokenName = jwtConfig.accessTokenName;
        const refreshTokenName = jwtConfig.refreshTokenName;

        const accessToken = req.cookies?.[accessTokenName] as string | undefined;
        const refreshToken = req.cookies?.[refreshTokenName] as string | undefined;

        const isProduction = process.env.NODE_ENV === "production";

        const clearCookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? ("strict" as const) : ("lax" as const),
            path: "/",
        };

        if (!accessToken && !refreshToken) {
            res.status(401).send({ message: "Not autenticated" });
            return;
        }

        let userId: string | undefined;
        let tokenFingerprint: string | undefined;

        if (accessToken) {
            try {
                const payload = jwt.verify(
                    accessToken,
                    jwtConfig.secretKey,
                ) as AuthTokenPayload;

                userId = payload.id;
                tokenFingerprint = payload.fp;
            } catch (error: unknown) {
                if (!(error instanceof jwt.TokenExpiredError)) {
                    res.clearCookie(accessTokenName, clearCookieOptions);
                    res.clearCookie(refreshTokenName, clearCookieOptions);
                    res.status(401).send("Invalid access token");
                    return;
                }
            }
        }

        if (!userId) {
            if (!refreshToken) {
                res.clearCookie(accessTokenName, clearCookieOptions);
                res.clearCookie(refreshTokenName, clearCookieOptions);
                res.status(401).send("Session expired");
                return;
            }

            let refreshPayload: AuthTokenPayload;

            try {
                refreshPayload = jwt.verify(
                    refreshToken,
                    jwtConfig.secretKey,
                ) as AuthTokenPayload;

                userId = refreshPayload.id;
                tokenFingerprint = refreshPayload.fp;
            } catch {
                res.clearCookie(accessTokenName, clearCookieOptions);
                res.clearCookie(refreshTokenName, clearCookieOptions);
                res.status(401).send("Invalid refresh token");
                return;
            }

            const newAccessToken = jwt.sign(
                {
                    id: userId
                },
                jwtConfig.secretKey,
                {
                    expiresIn: jwtConfig.accessTokenExpire,
                },
            );

            res.cookie(accessTokenName, newAccessToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "strict" : "lax",
                maxAge: jwtConfig.accessTokenTime,
                path: "/",
            });
        }

        if (!userId) {
            res.status(401).send({ message: "Session not valid" });
            return;
        }

        const user = await req.em.findOne(
            UserSchema,
            {
                id: userId
            },
            {
                fields: ["id", "isBlocked", "deletedAt"]
            }
        );

        if (!user || user.deletedAt || user.isBlocked) {
            res.clearCookie(accessTokenName, clearCookieOptions);
            res.clearCookie(refreshTokenName, clearCookieOptions);
            res.status(401).send({ message: "Usuario no autorizado" });
            return;
        }

        req.user = {
            id: user.id
        };

        next();
    } catch (error: unknown) {
        console.error(error);
        res.status(500).send("Authentication error");
    }
}

export default authMiddleware;