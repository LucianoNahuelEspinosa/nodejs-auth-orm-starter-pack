import { Request, Response, NextFunction } from "express";
import consolePrintWithTimedate from "@/helpers/consolePrintWithTimedate";

/**
 * Interface extending standard Error to support optional status codes
 */
interface CustomError extends Error {
  statusCode?: number;
}

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const errorLog = `[${req.method}] ${req.url}\nMessage: "${err.message}"\nStack: ${err.stack}\n\n`;

  console.error('❌ Error detected:');
  consolePrintWithTimedate("error", errorLog, true, "en-US");

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;