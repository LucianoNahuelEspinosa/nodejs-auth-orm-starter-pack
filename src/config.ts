// ========= CORS =========
import { CorsOptions } from "cors";

const allowedOrigins: string[] = [
    "http://localhost:3000"
];

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error("The CORS policy for this site does not allow access from the specified origin."));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    // allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};
// ========================

// ========= JWT =========
import type { SignOptions } from "jsonwebtoken";
export const jwtConfig = {
    secretKey: process.env.SECRET_JWT_KEY,
    accessTokenName: "AccessToken",
    accessTokenExpire: "1h" as SignOptions["expiresIn"],
    accessTokenTime: 60 * 60 * 1000,
    refreshTokenName: "RefreshToken",
    refreshTokenExpire: "30d" as SignOptions["expiresIn"],
    refreshTokenTime: 30 * 24 * 60 * 60 * 1000
};
// =======================
