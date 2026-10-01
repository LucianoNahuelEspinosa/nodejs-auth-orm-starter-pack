import { Request, Response, NextFunction } from "express";
import consolePrintWithTimedate from "@/helpers/consolePrintWithTimedate";

/**
 * Logger Middleware
 *
 */
const logger = (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV !== "production") {
        const start = Date.now();

        res.on("finish", () => {
            const duration = Date.now() - start;
            const statusColor = getStatusColor(res.statusCode);
            consolePrintWithTimedate("log", `${req.method} ${req.originalUrl} ${statusColor(res.statusCode)} - ${duration}ms`, true, "en-US");
        });
    }

    next();
}

/**
 * Add colors according HTTP status
 *
 */
const getStatusColor = (status: number) => {
    if (status >= 500) return (text: number) => `\x1b[31m${text}\x1b[0m`; // Red
    if (status >= 400) return (text: number) => `\x1b[33m${text}\x1b[0m`; // Yellow
    if (status >= 300) return (text: number) => `\x1b[36m${text}\x1b[0m`; // Cyan
    return (text: number) => `\x1b[32m${text}\x1b[0m`; // Green
}

export default logger;